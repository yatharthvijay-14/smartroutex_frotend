/**
 * useRealTimeData – React hook
 *
 * Implements:
 *   9.1  Auto-refresh road & pothole data on a configurable interval
 *   9.2  Live risk/status change detection (compares previous vs new data)
 *   9.3  Fires change events so the UI can show real-time alerts
 *   9.5  Signals when a route needs recalculation
 *   9.6  Loading, error, and retry state
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { getRoads, getGoodRoads, getHighRiskRoads, getPotholes } from "../services/api";

const ROAD_REFRESH_MS    = 30_000;   // 30 s
const POTHOLE_REFRESH_MS = 15_000;   // 15 s

export function useRealTimeData({ onAlert, onRouteInvalidated, refreshTrigger = 0 } = {}) {
  const [roads,        setRoads]        = useState([]);
  const [bestRoads,    setBestRoads]    = useState([]);
  const [highRiskRoads,setHighRiskRoads]= useState([]);
  const [potholes,     setPotholes]     = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [retryCount,   setRetryCount]   = useState(0);

  // Refs to persist previous values without triggering re-renders
  const prevRoadsRef    = useRef([]);
  const prevPotholesRef = useRef([]);
  const roadTimerRef    = useRef(null);
  const potholeTimerRef = useRef(null);
  const activeRouteRef  = useRef(null); // { startLat, startLng, endLat, endLng }

  // ── compare roads: detect severity / rating changes ──────────────────────
  const detectRoadChanges = useCallback((newRoads) => {
    if (!onAlert || prevRoadsRef.current.length === 0) return;
    newRoads.forEach(road => {
      const prev = prevRoadsRef.current.find(r => r.id === road.id);
      if (!prev) return;
      if (prev.trafficLevel !== road.trafficLevel && road.trafficLevel === "HIGH") {
        onAlert({
          type: "road_risk",
          severity: "HIGH",
          title: "Traffic Surge Detected",
          message: `${road.name || road.roadName} — traffic escalated to HIGH`,
          roadId: road.id,
          timestamp: Date.now()
        });
      }
      if (prev.rating !== road.rating && road.rating < 2.0 && prev.rating >= 2.0) {
        onAlert({
          type: "road_degraded",
          severity: "HIGH",
          title: "Road Quality Critical",
          message: `${road.name || road.roadName} dropped to ${road.rating}/5.0 — avoid if possible`,
          roadId: road.id,
          timestamp: Date.now()
        });
      }
    });
    prevRoadsRef.current = newRoads;
  }, [onAlert]);

  // ── compare potholes: detect new ones ────────────────────────────────────
  const detectPotholeChanges = useCallback((newPotholes) => {
    if (!onAlert) return;
    const prevIds = new Set(prevPotholesRef.current.map(p => p.id));
    const added   = newPotholes.filter(p => !prevIds.has(p.id));

    added.forEach(p => {
      onAlert({
        type: "new_pothole",
        severity: p.severity || "MEDIUM",
        title: "New Pothole Reported",
        message: `${p.roadName || "Unknown road"} — ${p.severity} severity, depth ${p.depth || "N/A"}`,
        potholeId: p.id,
        timestamp: Date.now()
      });

      // Check if new pothole is on the active route
      if (activeRouteRef.current && onRouteInvalidated) {
        const { startLat, startLng, endLat, endLng } = activeRouteRef.current;
        if (p.latitude && p.longitude) {
          // Simple bounding box check
          const minLat = Math.min(startLat, endLat) - 0.02;
          const maxLat = Math.max(startLat, endLat) + 0.02;
          const minLng = Math.min(startLng, endLng) - 0.02;
          const maxLng = Math.max(startLng, endLng) + 0.02;
          if (p.latitude >= minLat && p.latitude <= maxLat &&
              p.longitude >= minLng && p.longitude <= maxLng) {
            onRouteInvalidated({ reason: "new_pothole", pothole: p });
          }
        }
      }
    });

    prevPotholesRef.current = newPotholes;
  }, [onAlert, onRouteInvalidated]);

  // ── core fetch: roads ─────────────────────────────────────────────────────
  const fetchRoads = useCallback(async (isInitial = false) => {
    try {
      const [roadsData, goodData, highData] = await Promise.all([
        getRoads(), getGoodRoads(), getHighRiskRoads()
      ]);
      if (!isInitial) detectRoadChanges(roadsData);
      prevRoadsRef.current = roadsData;
      setRoads(roadsData);
      setBestRoads(goodData);
      setHighRiskRoads(highData);
      setError(null);
      setRetryCount(0);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to refresh road data");
      setRetryCount(c => c + 1);
    }
  }, [detectRoadChanges]);

  // ── core fetch: potholes ──────────────────────────────────────────────────
  const fetchPotholes = useCallback(async (isInitial = false) => {
    try {
      const data = await getPotholes();
      if (!isInitial) detectPotholeChanges(data);
      prevPotholesRef.current = data;
      setPotholes(data);
      setError(null);
      setRetryCount(0);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to refresh pothole data");
      setRetryCount(c => c + 1);
    }
  }, [detectPotholeChanges]);

  // ── full initial load ─────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchRoads(true), fetchPotholes(true)]);
    setIsLoading(false);
  }, [fetchRoads, fetchPotholes]);

  // ── manual refresh (called externally) ───────────────────────────────────
  const refresh = useCallback(async () => {
    await Promise.all([fetchRoads(false), fetchPotholes(false)]);
  }, [fetchRoads, fetchPotholes]);

  // ── set active route for pothole proximity checks ─────────────────────────
  const setActiveRoute = useCallback((startLat, startLng, endLat, endLng) => {
    activeRouteRef.current = { startLat, startLng, endLat, endLng };
  }, []);

  // ── lifecycle: initial load only (auto-refresh disabled) ──────────────────
  useEffect(() => {
    fetchAll();
  }, []); // eslint-disable-line

  // ── re-fetch when parent triggers (e.g. after report submit) ─────────────
  useEffect(() => {
    if (refreshTrigger > 0) refresh();
  }, [refreshTrigger]); // eslint-disable-line

  return {
    roads, bestRoads, highRiskRoads, potholes,
    isLoading, error, lastUpdated, retryCount,
    refresh, setActiveRoute
  };
}
