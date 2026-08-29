import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { planMapRoute, calculateHaversineMeters } from "../services/api";
import { detectUserPhysicalLocation } from "../services/geocodingService";
import { Route, Star, ShieldCheck, AlertTriangle, Camera, Image as ImageIcon, X, RefreshCw } from "lucide-react";

// Components
import StatCard               from "../components/StatCard";
import LiveMap                from "../components/LiveMap";
import GoogleMapRouteBar      from "../components/GoogleMapRouteBar";
import GoogleMapDirectionsPanel from "../components/GoogleMapDirectionsPanel";
import MultiRouteComparisonCard from "../components/MultiRouteComparisonCard";
import AnalyticsChart         from "../components/AnalyticsChart";
import RoadChart              from "../components/RoadChart";
import BestRoads              from "../components/BestRoads";
import HighRiskRoads          from "../components/HighRiskRoads";
import AIRecommendation       from "../components/AIRecommendation";
import Alerts                 from "../components/Alerts";
import TrafficStatus          from "../components/TrafficStatus";
import MyReports              from "../components/MyReports";
import LiveStatusBar          from "../components/LiveStatusBar";
import RouteInvalidBanner     from "../components/RouteInvalidBanner";
import DispatchWorkOrderModal from "../components/DispatchWorkOrderModal";
import DriverHudModal         from "../components/DriverHudModal";

// Real-time data hook
import { useRealTimeData }    from "../hooks/useRealTimeData";

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="skeleton h-4 w-1/3 rounded-lg" />
      <div className="skeleton h-8 w-1/2 rounded-lg" />
      <div className="skeleton h-3 w-2/3 rounded-lg" />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div
      className="rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 my-6 shadow-xl"
      style={{
        background: "var(--accent-rose-bg)",
        border: "1px solid rgba(248,81,73,0.3)",
        color: "var(--text-primary)"
      }}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-extrabold text-base text-rose-500">Connection Error</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1">
          {error?.message || "Failed to sync real-time telemetry from server."}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" /> Retry Sync
      </button>
    </div>
  );
}

function Dashboard({ activeTab = "dashboard", searchQuery = "", searchLocation = null, onOpenReportModal, refreshTrigger = 0, onAlert }) {
  // ── Route state ──────────────────────────────────────────────────────────
  const [startPoint, setStartPoint] = useState({ name: "Current GPS Location", lat: 25.1800, lng: 75.8390 });
  const [endPoint,   setEndPoint]   = useState(null); // Destination empty by default until selected
  const [routePlan,  setRoutePlan]  = useState(null);
  const [selectedRouteType, setSelectedRouteType]       = useState("SAFEST");
  const [selectedCandidateRouteId, setSelectedCandidateRouteId] = useState(null);
  const [isSelectingOnMap, setIsSelectingOnMap]          = useState(false);

  // ── GPS / navigation state ───────────────────────────────────────────────
  const [isRealGpsActive,    setIsRealGpsActive]    = useState(false);
  const [currentVehiclePos,  setCurrentVehiclePos]  = useState([25.1800, 75.8390]);
  const [gpsAccuracy,        setGpsAccuracy]        = useState(10);
  const [dynamicEtaMinutes,  setDynamicEtaMinutes]  = useState(12);
  const [dynamicDistanceText,setDynamicDistanceText]= useState("4.9 km");
  const [navProgressPercent, setNavProgressPercent] = useState(0);
  const [currentStepIndex,   setCurrentStepIndex]   = useState(0);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selectedGalleryImage,  setSelectedGalleryImage]  = useState(null);
  const [routeInvalidEvent,     setRouteInvalidEvent]     = useState(null);
  const [dispatchModalRoad,     setDispatchModalRoad]     = useState(null);
  const [isHudModalOpen,        setIsHudModalOpen]        = useState(false);

  const animIntervalRef = useRef(null);

  // ── Route invalidation handler ───────────────────────────────────────
  const handleRouteInvalidated = useCallback((event) => {
    setRouteInvalidEvent(event);
    if (onAlert) {
      onAlert({
        type: "route_invalid",
        severity: "HIGH",
        title: "Route Invalidated",
        message: `New pothole detected near your route on ${event.pothole?.roadName || "your path"}.`,
        timestamp: Date.now()
      });
    }
  }, [onAlert]);

  // ── Dispatch repair unit handler ──────────────────────────────────────────
  const handleDispatchRepair = useCallback((road) => {
    setDispatchModalRoad(road);
  }, []);

  const handleConfirmWorkOrder = useCallback((road, workOrderId, crewUnit) => {
    if (onAlert) {
      onAlert({
        type: "repair_dispatched",
        severity: "HIGH",
        title: `🚨 Dispatch Confirmed: ${workOrderId}`,
        message: `${crewUnit} deployed to ${road.name || "hazard corridor"} for priority repair.`,
        timestamp: Date.now()
      });
    }
  }, [onAlert]);

  // ── Real-time data hook ─────────────────────────────────────────────────
  const {
    roads, bestRoads, highRiskRoads, potholes,
    isLoading, error, lastUpdated, retryCount,
    refresh, setActiveRoute
  } = useRealTimeData({
    onAlert,
    onRouteInvalidated: handleRouteInvalidated,
    refreshTrigger
  });

  // ── Derived / computed search filtering ──────────────────────────────────
  const q = (searchQuery || "").toLowerCase().trim();

  const filteredRoads = useMemo(() =>
    roads.filter(r => !q || r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)),
    [roads, q]
  );

  const filteredHighRiskRoads = useMemo(() =>
    highRiskRoads.filter(r => !q || r.name?.toLowerCase().includes(q)),
    [highRiskRoads, q]
  );

  const filteredBestRoads = useMemo(() =>
    bestRoads.filter(r => !q || r.name?.toLowerCase().includes(q)),
    [bestRoads, q]
  );

  const filteredPotholes = useMemo(() =>
    potholes.filter(p => !q || p.roadName?.toLowerCase().includes(q) || p.severity?.toLowerCase().includes(q)),
    [potholes, q]
  );

  const avgRating = useMemo(() =>
    roads.length > 0
      ? (roads.reduce((s, r) => s + Number(r.rating || 0), 0) / roads.length).toFixed(1)
      : "4.1",
    [roads]
  );

  const totalPotholesCount = potholes.length > 0 ? potholes.length : 17;

  // ── Automatic Real-Time Physical User Location Detector on Mount ───────────
  useEffect(() => {
    detectUserPhysicalLocation().then((loc) => {
      if (loc && loc.lat && loc.lng) {
        const userLoc = {
          name: loc.name || "Your Current Location",
          displayName: loc.displayName || `Coordinates: ${loc.lat}, ${loc.lng}`,
          lat: loc.lat,
          lng: loc.lng
        };
        setStartPoint(userLoc);
        setCurrentVehiclePos([loc.lat, loc.lng]);
        // Destination remains null until selected explicitly
      }
    });
  }, []);

  // ── Real Device GPS Watcher ────────────────────────────────────────────────
  useEffect(() => {
    if (!isRealGpsActive || !("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentVehiclePos([lat, lng]);
        setGpsAccuracy(Math.round(pos.coords.accuracy || 10));
      },
      (err) => console.warn("GPS watch warning:", err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRealGpsActive]);

  // ── Route calculation + active route registration ────────────────────────
  const handleCalculateRoute = useCallback(async (sPoint, ePoint, customPool) => {
    const startP = sPoint || startPoint;
    const endP   = ePoint || endPoint;
    if (!endP || !endP.lat || !endP.lng) {
      setRoutePlan(null);
      return;
    }
    const sLat = startP?.lat || 25.1800;
    const sLng = startP?.lng || 75.8390;
    const eLat = endP.lat;
    const eLng = endP.lng;
    const pool = customPool || potholes;

    const result = await planMapRoute(sLat, sLng, eLat, eLng, pool);
    setRoutePlan(result);
    if (result?.evaluatedRoutes?.length > 0) {
      setSelectedCandidateRouteId(result.evaluatedRoutes[0].id);
    }
    setCurrentVehiclePos([sLat, sLng]);
    setRouteInvalidEvent(null);

    setActiveRoute(sLat, sLng, eLat, eLng);
  }, [startPoint, endPoint, potholes, setActiveRoute]);

  const handleSelectCandidateRoute = (route) => setSelectedCandidateRouteId(route.id);

  // ── Sync searchLocation to map center & route ──────────────────────────────
  useEffect(() => {
    if (!searchLocation || !searchLocation.lat || !searchLocation.lng) return;
    setCurrentVehiclePos([searchLocation.lat, searchLocation.lng]);
    setEndPoint({
      name: searchLocation.name || "Searched Location",
      displayName: searchLocation.displayName || searchLocation.name,
      lat: searchLocation.lat,
      lng: searchLocation.lng
    });
    handleCalculateRoute(startPoint, searchLocation, potholes);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchLocation]);

  // ── Recalculate when route invalidated ───────────────────────────────────
  const handleRecalculateRoute = useCallback(() => {
    setRouteInvalidEvent(null);
    handleCalculateRoute(startPoint, endPoint, potholes);
    if (onAlert) onAlert({
      type: "route_invalid",
      severity: "LOW",
      title: "Route Recalculated",
      message: "Safest route updated to avoid new hazard.",
      timestamp: Date.now()
    });
  }, [handleCalculateRoute, startPoint, endPoint, potholes, onAlert]);

  // ── Vehicle simulation ───────────────────────────────────────────────────
  const handleSimulateDriveMovement = (customPos) => {
    if (customPos) {
      setCurrentVehiclePos(customPos);
      return;
    }
    const routes = routePlan?.evaluatedRoutes || [];
    const active = selectedCandidateRouteId
      ? routes.find(r => r.id === selectedCandidateRouteId) || routes[0]
      : routes[0];
    const coords = active?.coordinates || routePlan?.safestPath || routePlan?.directPath || [];
    if (coords.length < 2) return;

    let idx = 0;
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    animIntervalRef.current = setInterval(() => {
      idx++;
      if (idx >= coords.length) {
        clearInterval(animIntervalRef.current);
        setNavProgressPercent(100);
        setDynamicEtaMinutes(0);
        return;
      }
      const pos = coords[idx];
      setCurrentVehiclePos(pos);
      setNavProgressPercent(Math.round((idx / (coords.length - 1)) * 100));
      if (endPoint?.lat) {
        const dm = calculateHaversineMeters(pos[0], pos[1], endPoint.lat, endPoint.lng);
        setDynamicEtaMinutes(Math.max(0, Math.ceil((dm / 1000) * 2.2)));
        setDynamicDistanceText(`${(dm / 1000).toFixed(1)} km`);
      }
    }, 600);
  };

  // ── Shared LiveMap props ─────────────────────────────────────────────────
  const liveMapProps = {
    roads: filteredRoads, selectedRoad: null,
    startPoint, setStartPoint, endPoint, setEndPoint,
    routePlan, selectedRouteType, selectedCandidateRouteId,
    isSelectingOnMap, setIsSelectingOnMap,
    currentVehiclePos, isRealGpsActive, setIsRealGpsActive,
    gpsAccuracy, dynamicEtaMinutes, dynamicDistanceText,
    onSimulateDrive: handleSimulateDriveMovement,
    onOpenHudModal: () => setIsHudModalOpen(true)
  };

  // ── Shared LiveStatusBar ─────────────────────────────────────────────────
  const statusBar = (
    <LiveStatusBar
      isLoading={isLoading}
      error={error}
      lastUpdated={lastUpdated}
      retryCount={retryCount}
      roadsCount={roads.length}
      potholesCount={potholes.length}
      onRefresh={refresh}
    />
  );

  // ── Route invalid banner ─────────────────────────────────────────────────
  const routeBanner = routeInvalidEvent ? (
    <RouteInvalidBanner
      event={routeInvalidEvent}
      onRecalculate={handleRecalculateRoute}
      onDismiss={() => setRouteInvalidEvent(null)}
    />
  ) : null;

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: map (Live GIS Map View)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === "map") {
    return (
      <div className="space-y-6 pb-12">
        {statusBar}
        {routeBanner}
        <GoogleMapRouteBar
          roads={roads}
          startPoint={startPoint} setStartPoint={setStartPoint}
          endPoint={endPoint}     setEndPoint={setEndPoint}
          onCalculateRoute={handleCalculateRoute}
          onPickOnMap={() => setIsSelectingOnMap(!isSelectingOnMap)}
          isSelectingOnMap={isSelectingOnMap}
          routePlan={routePlan}
          selectedRouteType={selectedRouteType}
          setSelectedRouteType={setSelectedRouteType}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveMap {...liveMapProps} />
          </div>
          <div>
            <GoogleMapDirectionsPanel
              routePlan={routePlan}
              selectedRouteType={selectedRouteType}
              activeStepIndex={currentStepIndex}
            />
          </div>
        </div>
        <MultiRouteComparisonCard
          evaluatedRoutes={routePlan?.evaluatedRoutes}
          selectedRouteId={selectedCandidateRouteId}
          onSelectRoute={handleSelectCandidateRoute}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: myreports (My Submitted Reports View)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === "myreports") {
    return (
      <div className="space-y-6 pb-12">
        {statusBar}
        <MyReports potholes={potholes} onDataChanged={refresh} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: potholes (Pothole Hazard Alerts & Repairs View)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === "potholes") {
    return (
      <div className="space-y-6 pb-12">
        {statusBar}
        {error && !potholes.length ? (
          <ErrorState error={error} onRetry={refresh} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HighRiskRoads
                roads={highRiskRoads}
                onSelectRoad={() => {}}
                onDispatchRepair={handleDispatchRepair}
              />
              <Alerts potholes={potholes} onOpenReportModal={onOpenReportModal} />
            </div>
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: analytics (Telemetry Analytics View)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === "analytics") {
    return (
      <div className="space-y-6 pb-12">
        {statusBar}
        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Monitored Corridors" value={roads.length || 8} subtitle="City Sector Grid" badge="+2 Active" icon={Route} trend="up" />
              <StatCard title="Average Quality Rating" value={`${avgRating} / 5`} subtitle="Telemetry score" badge="Stable" icon={Star} trend="up" />
              <StatCard title="Safe Corridors" value={bestRoads.length || 2} subtitle="Recommended routes" badge="82% Clear" badgeType="success" icon={ShieldCheck} trend="up" />
              <StatCard title="Critical Hazards" value={highRiskRoads.length || 4} subtitle="High risk" badge={`${totalPotholesCount} Potholes`} badgeType="danger" icon={AlertTriangle} trend="down" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart roads={filteredRoads} />
              <RoadChart      roads={filteredRoads} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BestRoads     roads={bestRoads}     onSelectRoad={() => {}} />
              <HighRiskRoads roads={highRiskRoads} onSelectRoad={() => {}} onDispatchRepair={handleDispatchRepair} />
            </div>
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: assistant (AI Safety Assistant View)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === "assistant") {
    return (
      <div className="space-y-6 pb-12">
        {statusBar}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <AIRecommendation
              roads={roads}
              onSelectRoute={(roadNameOrObj) => {
                const name = typeof roadNameOrObj === "string" ? roadNameOrObj : (roadNameOrObj?.name || "");
                if (!name) return;
                roads.find(r => r.name?.toLowerCase().includes(name.toLowerCase()));
              }}
            />
          </div>
          <div className="lg:col-span-2">
            <LiveMap {...liveMapProps} />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEFAULT: dashboard (Overview Dashboard View)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12">

      {/* Status bar */}
      {statusBar}

      {/* Route invalidation banner */}
      {routeBanner}

      {/* Error fallback */}
      {error && !roads.length ? (
        <ErrorState error={error} onRetry={refresh} />
      ) : (
        <>
          {/* SECTION 1: LIVE NAVIGATION & AI ROUTE SAFETY */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
                  <span className="section-dot" />
                  SECTION 1 · LIVE NAVIGATION &amp; ROUTE SAFETY
                </h3>
                <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>Real-time pothole avoidance engine &amp; dynamic routing</p>
              </div>
            </div>

            <GoogleMapRouteBar
              roads={roads}
              startPoint={startPoint} setStartPoint={setStartPoint}
              endPoint={endPoint}     setEndPoint={setEndPoint}
              onCalculateRoute={handleCalculateRoute}
              onPickOnMap={() => setIsSelectingOnMap(!isSelectingOnMap)}
              isSelectingOnMap={isSelectingOnMap}
              routePlan={routePlan}
              selectedRouteType={selectedRouteType}
              setSelectedRouteType={setSelectedRouteType}
            />

            <MultiRouteComparisonCard
              evaluatedRoutes={routePlan?.evaluatedRoutes}
              selectedRouteId={selectedCandidateRouteId}
              onSelectRoute={handleSelectCandidateRoute}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveMap {...liveMapProps} />
              </div>
              <div>
                <GoogleMapDirectionsPanel
                  routePlan={routePlan}
                  selectedRouteType={selectedRouteType}
                  activeStepIndex={currentStepIndex}
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: SYSTEM KPI STATS & PHOTO EVIDENCE */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
                  <span className="section-dot" />
                  SECTION 2 · TELEMETRY KPIS &amp; HAZARD EVIDENCE
                </h3>
                <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>Live system metrics &amp; community reported proof</p>
              </div>
            </div>

            {isLoading ? <SkeletonGrid /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Monitored Corridors" value={roads.length || 8} subtitle="City Sector Grid" badge="+2 Active" icon={Route} trend="up" />
                <StatCard title="Average Quality Rating" value={`${avgRating} / 5`} subtitle="Telemetry score" badge="Stable" icon={Star} trend="up" />
                <StatCard title="Safe Corridors (Low)" value={bestRoads.length || 2} subtitle="Recommended routes" badge="82% Clear" badgeType="success" icon={ShieldCheck} trend="up" />
                <StatCard title="Avoid Hazards (High)" value={highRiskRoads.length || 4} subtitle="High risk / Potholes" badge={`${totalPotholesCount} Potholes`} badgeType="danger" icon={AlertTriangle} trend="down" />
              </div>
            )}

            {/* Pothole photo gallery */}
            <div className="asphalt-card p-5">
              <div
                className="flex items-center justify-between gap-2 mb-4 pb-3"
                style={{ borderBottom: "1px solid var(--line)" }}
              >
                <div>
                  <h2 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
                    <Camera className="w-4 h-4 text-emerald-400 mr-2" />
                    Pothole Photo Evidence
                    {!isLoading && (
                      <span className="badge-dashed-safe ml-2">
                        <span className="dot-glow-safe" /> Live
                      </span>
                    )}
                  </h2>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>
                    {filteredPotholes.length} of {potholes.length} reports
                    {q ? <span className="ml-1 text-emerald-400">· filtered by "{searchQuery}"</span> : <span className="ml-1">· Click photo to enlarge</span>}
                  </p>
                </div>
                <button
                  onClick={onOpenReportModal}
                  className="btn-asphalt-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs font-mono"
                >
                  <Camera className="w-3.5 h-3.5" /> Report New
                </button>
              </div>

              {isLoading && !filteredPotholes.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="skeleton h-40 rounded-lg" />
                  ))}
                </div>
              ) : filteredPotholes.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 gap-2 rounded-lg"
                  style={{ background: "var(--surface-sunken)", border: "1px dashed var(--line)" }}
                >
                  <Camera className="w-8 h-8" style={{ color: "var(--ink-soft)" }} />
                  <p className="text-sm font-bold font-heading" style={{ color: "var(--ink)" }}>No photos yet</p>
                  <p className="text-xs font-mono" style={{ color: "var(--ink-soft)" }}>Submit a pothole report to add photo evidence</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredPotholes.map((p, idx) => {
                    const photoUrl = p.imageUrl || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop";
                    const isFixed  = p.status === "FIXED";

                    return (
                      <div
                        key={`gallery-${p.id || idx}`}
                        className="rounded-lg overflow-hidden group transition-all flex flex-col"
                        style={{
                          background: "var(--surface-sunken)",
                          border: `1px solid ${isFixed ? "var(--safe)" : "var(--line)"}`,
                          opacity: isFixed ? 0.7 : 1
                        }}
                      >
                        <div
                          onClick={() => setSelectedGalleryImage(photoUrl)}
                          className="relative h-36 overflow-hidden cursor-pointer"
                          style={{ background: "var(--bg)" }}
                        >
                          <img
                            src={photoUrl}
                            alt={p.roadName || "Pothole proof"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-mono font-bold text-white"
                            style={{ background: "rgba(0,0,0,0.6)" }}
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> View
                          </div>
                          <span
                            className={`absolute top-2 right-2 ${isFixed ? "badge-dashed-safe text-[8px] py-0 px-1" : "badge-dashed-critical text-[8px] py-0 px-1"}`}
                          >
                            {isFixed ? "Fixed" : (p.severity || "High")}
                          </span>
                        </div>
                        <div className="p-2.5 font-mono">
                          <h4 className="text-[11px] font-bold font-heading truncate" style={{ color: "var(--ink)" }}>
                            {p.roadName || "Hazard Corridor"}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px]" style={{ color: "var(--warn)" }}>{p.depth || "—"}</span>
                            <span className="text-[10px]" style={{ color: "var(--ink-soft)" }}>{p.reportedAt || "Just now"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3: HAZARDS & MUNICIPAL REPAIRS */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
                  <span className="section-dot" />
                  SECTION 3 · HAZARD MANAGEMENT &amp; MUNICIPAL REPAIRS
                </h3>
                <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>Critical road repairs, active dispatches &amp; corridor ratings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HighRiskRoads
                roads={filteredHighRiskRoads}
                onSelectRoad={() => {}}
                onDispatchRepair={handleDispatchRepair}
              />
              <BestRoads
                roads={filteredBestRoads}
                onSelectRoad={() => {}}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Alerts potholes={filteredPotholes} onOpenReportModal={onOpenReportModal} />
              <TrafficStatus />
            </div>
          </section>

          {/* SECTION 4: ANALYTICS & AI RECOMMENDATIONS */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
                  <span className="section-dot" />
                  SECTION 4 · ANALYTICS &amp; AI INTELLIGENCE ASSISTANT
                </h3>
                <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>Predictive AI safety scoring &amp; telemetry analytics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <AIRecommendation
                  roads={roads}
                  onSelectRoute={(roadNameOrObj) => {
                    const name = typeof roadNameOrObj === "string" ? roadNameOrObj : (roadNameOrObj?.name || "");
                    if (!name) return;
                    roads.find(r => r.name?.toLowerCase().includes(name.toLowerCase()));
                  }}
                />
              </div>
              <div className="lg:col-span-2">
                <AnalyticsChart roads={filteredRoads} />
              </div>
            </div>

            <div>
              <RoadChart roads={filteredRoads} />
            </div>
          </section>

          {/* Enlarged photo modal */}
          {selectedGalleryImage && (
            <div
              className="fixed inset-0 z-[6000] flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }}
              onClick={() => setSelectedGalleryImage(null)}
            >
              <div
                className="relative max-w-3xl w-full rounded-2xl p-4 shadow-2xl"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedGalleryImage(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={selectedGalleryImage}
                  alt="Enlarged pothole proof"
                  className="w-full h-auto rounded-xl"
                  style={{ maxHeight: "80vh", objectFit: "contain" }}
                />
              </div>
            </div>
          )}

          {/* Municipal Dispatch Work Order Modal */}
          <DispatchWorkOrderModal
            isOpen={Boolean(dispatchModalRoad)}
            road={dispatchModalRoad}
            onClose={() => setDispatchModalRoad(null)}
            onConfirmDispatch={handleConfirmWorkOrder}
          />

          {/* Driver Telemetry HUD Modal */}
          <DriverHudModal
            isOpen={isHudModalOpen}
            onClose={() => setIsHudModalOpen(false)}
            routePlan={routePlan}
            currentPos={currentVehiclePos}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;