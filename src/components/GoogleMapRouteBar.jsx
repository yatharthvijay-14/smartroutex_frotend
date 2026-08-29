import React, { useState, useEffect, useRef } from "react";
import { searchAllLocations, reverseGeocodeLocation } from "../services/geocodingService";
import { MapPin, Navigation, Crosshair, Map, Sparkles, ShieldCheck, AlertTriangle, Loader2, X } from "lucide-react";

function GoogleMapRouteBar({
  roads = [], startPoint, setStartPoint, endPoint, setEndPoint,
  routePlan, selectedRouteType, setSelectedRouteType,
  onCalculateRoute, isSelectingOnMap, setIsSelectingOnMap
}) {
  const [startQuery, setStartQuery]           = useState("");
  const [endQuery, setEndQuery]               = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions]   = useState([]);
  const [isSearchingEnd, setIsSearchingEnd]   = useState(false);
  const startTimer = useRef(null);
  const endTimer   = useRef(null);

  useEffect(() => { if (startPoint?.name) setStartQuery(startPoint.name); }, [startPoint]);
  useEffect(() => { setEndQuery(endPoint?.name || ""); }, [endPoint]);

  const buildLocal = (val, fallLat, fallLng) =>
    roads.filter(r => r.name?.toLowerCase().includes(val.toLowerCase()))
      .map(r => ({
        id: `db-${r.id || r.name}`,
        name: r.name,
        displayName: `${r.name} (${r.rating ? Number(r.rating).toFixed(1) : "4.0"}/5)`,
        lat: r.latitude  || fallLat,
        lng: r.longitude || fallLng
      }));

  const handleStartQuery = val => {
    setStartQuery(val);
    clearTimeout(startTimer.current);
    if (val.trim().length < 1) { setStartSuggestions([]); return; }
    startTimer.current = setTimeout(async () => {
      const results = await searchAllLocations(val);
      setStartSuggestions(results);
    }, 200);
  };

  const handleEndQuery = val => {
    setEndQuery(val);
    if (!val.trim()) {
      setEndPoint(null);
      setEndSuggestions([]);
      return;
    }
    clearTimeout(endTimer.current);
    if (val.trim().length < 1) { setEndSuggestions([]); return; }
    setIsSearchingEnd(true);
    endTimer.current = setTimeout(async () => {
      const results = await searchAllLocations(val);
      setEndSuggestions(results);
      setIsSearchingEnd(false);
    }, 200);
  };

  const selectStart = item => {
    const loc = { name: item.name, displayName: item.displayName, lat: item.lat, lng: item.lng };
    setStartPoint(loc); setStartQuery(item.name); setStartSuggestions([]);
    if (endPoint && onCalculateRoute) onCalculateRoute(loc, endPoint);
  };

  const selectEnd = item => {
    const loc = { name: item.name, displayName: item.displayName, lat: item.lat, lng: item.lng };
    setEndPoint(loc); setEndQuery(item.name); setEndSuggestions([]);
    if (startPoint && onCalculateRoute) onCalculateRoute(startPoint, loc);
  };

  const clearDestination = () => {
    setEndPoint(null);
    setEndQuery("");
    setEndSuggestions([]);
  };

  const useGPS = () => {
    if (!navigator.geolocation) return;
    setStartQuery("Detecting GPS position...");
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const geoLoc = await reverseGeocodeLocation(lat, lng);
        const name = geoLoc?.name ? `GPS: ${geoLoc.name}` : `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        const loc = { name, displayName: geoLoc?.displayName || name, lat, lng };
        setStartPoint(loc); setStartQuery(loc.name);
        if (endPoint && onCalculateRoute) onCalculateRoute(loc, endPoint);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        setStartQuery(startPoint?.name || "Current Location");
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const suggestionDropdown = (items, onSelect) => (
    <div
      className="absolute top-full left-0 right-0 mt-2 rounded-xl z-50 max-h-60 overflow-y-auto"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      {items.map(item => (
        <div
          key={`sug-${item.id}`}
          onClick={() => onSelect(item)}
          className="p-3 cursor-pointer text-xs transition-colors border-b last:border-b-0 hover:bg-white/5"
          style={{ borderBottomColor: "var(--line)" }}
        >
          <div className="font-bold font-heading flex items-center gap-2" style={{ color: "var(--ink)" }}>
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {item.name}
          </div>
          <div className="text-[10px] font-mono truncate mt-0.5" style={{ color: "var(--ink-soft)" }}>{item.displayName}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="asphalt-card p-5 mb-5 relative z-30">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
        {/* Search Inputs */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">

          {/* Start Point */}
          <div className="relative">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: "var(--ink-soft)" }}>
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Start / Current Position
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Detecting current position..."
                value={startQuery}
                onChange={e => handleStartQuery(e.target.value)}
                className="w-full h-10 rounded-lg pl-3.5 pr-20 text-xs font-mono focus:outline-none"
                style={{
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)"
                }}
              />
              <button
                type="button"
                onClick={useGPS}
                className="absolute right-1.5 px-2.5 py-1 text-[10px] font-mono font-bold rounded flex items-center gap-1 cursor-pointer"
                style={{ background: "var(--safe-bg)", color: "var(--safe)", border: "1px dashed var(--safe)" }}
              >
                <Crosshair className="w-3 h-3" /> GPS
              </button>
            </div>
            {startSuggestions.length > 0 && suggestionDropdown(startSuggestions, selectStart)}
          </div>

          {/* Destination Point (Empty by default) */}
          <div className="relative">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: "var(--ink-soft)" }}>
              <Navigation className="w-3.5 h-3.5 text-amber-400" /> Destination Place (Select Location)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search or pick destination place on map..."
                value={endQuery}
                onChange={e => handleEndQuery(e.target.value)}
                className="w-full h-10 rounded-lg pl-3.5 pr-10 text-xs font-mono focus:outline-none"
                style={{
                  background: "var(--surface-sunken)",
                  border: endPoint ? "1px solid var(--amber-400, #f59e0b)" : "1px solid var(--line)",
                  color: "var(--ink)"
                }}
              />
              {isSearchingEnd ? (
                <Loader2 className="absolute right-3.5 w-4 h-4 text-emerald-400 animate-spin" />
              ) : endQuery ? (
                <button
                  type="button"
                  onClick={clearDestination}
                  className="absolute right-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>
            {endSuggestions.length > 0 && suggestionDropdown(endSuggestions, selectEnd)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2 lg:pt-0">
          <button
            type="button"
            onClick={() => setIsSelectingOnMap(!isSelectingOnMap)}
            className="btn-asphalt-secondary h-10 flex items-center gap-2"
            style={{
              borderColor: isSelectingOnMap ? "var(--warn)" : "var(--line)",
              color: isSelectingOnMap ? "var(--warn)" : "var(--ink)"
            }}
          >
            <Map className="w-4 h-4 text-amber-400" />
            <span>{isSelectingOnMap ? "Click Map..." : "Pick on Map"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!endPoint) {
                alert("Please select or search a destination place first.");
                return;
              }
              onCalculateRoute && onCalculateRoute(startPoint, endPoint);
            }}
            className={`h-10 flex items-center gap-2 px-4 rounded-xl text-xs font-bold transition-all ${
              endPoint
                ? "btn-asphalt-primary"
                : "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700 opacity-70"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{endPoint ? "Calculate AI Route" : "Select Destination"}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Stats */}
      {routePlan && endPoint && (
        <div
          className="mt-4 pt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRouteType("SAFEST")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                selectedRouteType === "SAFEST" ? "badge-dashed-safe" : "btn-asphalt-secondary"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>AI Safest Route ({routePlan.safestSafetyScore || 98}% Safe)</span>
            </button>
            <button
              onClick={() => setSelectedRouteType("DIRECT")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                selectedRouteType === "DIRECT" ? "badge-dashed-critical" : "btn-asphalt-secondary"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Direct Path ({routePlan.potholeCountOnDirectRoute || 0} Hazards)</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span style={{ color: "var(--ink-soft)" }}>
              Distance: <strong style={{ color: "var(--ink)" }}>
                {selectedRouteType === "SAFEST" ? routePlan.safestDistance : routePlan.directDistance}
              </strong>
            </span>
            <span style={{ color: "var(--ink-soft)" }}>
              Est. Time: <strong style={{ color: "var(--ink)" }}>
                {selectedRouteType === "SAFEST" ? routePlan.safestTime : routePlan.directTime}
              </strong>
            </span>
            {routePlan.potholeCountOnDirectRoute > 0 && (
              <span className="badge-dashed-critical">
                <AlertTriangle className="w-3.5 h-3.5" />
                {routePlan.potholeCountOnDirectRoute} Potholes Detected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleMapRouteBar;
