import React from "react";
import { Compass, CornerUpRight, AlertTriangle, MapPin, Flag, CheckCircle2 } from "lucide-react";

function GoogleMapDirectionsPanel({ routePlan, selectedRouteType, activeStepIndex = 0, onSelectStep }) {
  if (!routePlan) {
    return (
      <div className="asphalt-card p-6 flex flex-col h-full items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)" }}>
          <Compass className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="font-bold font-heading text-sm mb-1" style={{ color: "var(--ink)" }}>
          No Active Navigation Route
        </h3>
        <p className="text-xs font-mono max-w-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Enter start &amp; destination above to view real turn-by-turn navigation steps and AI pothole safety warnings.
        </p>
      </div>
    );
  }

  let steps = routePlan.steps?.length > 0 ? routePlan.steps : [];
  if (steps.length === 0) {
    const dist = selectedRouteType === "SAFEST" ? routePlan.safestDistance : routePlan.directDistance;
    steps = [
      { id: 1, type: "start",  instruction: "Start at origin location",         distance: "0 m",      status: "LOW" },
      { id: 2, type: "turn",   instruction: "Proceed along driving corridor",    distance: dist || "3.5 km", status: "LOW" },
      { id: 3, type: "arrive", instruction: "Arrive at destination",             distance: "0 m",      status: "LOW" }
    ];
  }

  const isSafest      = selectedRouteType === "SAFEST";
  const totalDistance = isSafest ? routePlan.safestDistance  : routePlan.directDistance;
  const totalTime     = isSafest ? routePlan.safestTime      : routePlan.directTime;
  const potholeCount  = isSafest ? routePlan.potholeCountOnSafestRoute : routePlan.potholeCountOnDirectRoute;

  const getStepIcon = st => {
    if (st.status === "HIGH" || st.instruction?.includes("Potholes") || st.instruction?.includes("Warning"))
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    if (st.instruction?.includes("Start") || st.type === "start")
      return <MapPin className="w-4 h-4 text-emerald-400" />;
    if (st.instruction?.includes("Arrive") || st.type === "arrive")
      return <Flag className="w-4 h-4 text-amber-400" />;
    if (st.instruction?.includes("reroute") || st.instruction?.includes("bypass"))
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    return <CornerUpRight className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="asphalt-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="pb-3 mb-3 flex items-center justify-between gap-2" style={{ borderBottom: "1px solid var(--line)" }}>
        <div>
          <h2 className="text-sm font-bold font-heading flex items-center gap-2" style={{ color: "var(--ink)" }}>
            <span className="section-dot" />
            Turn-By-Turn Navigation
          </h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>
            {isSafest ? "AI Safest Path (Pothole Avoidance Active)" : "Direct Path Corridor"}
          </p>
        </div>
        <div className="text-right shrink-0 font-mono">
          <div className="text-sm font-bold" style={{ color: "var(--safe)" }}>{totalTime || "—"}</div>
          <span className="text-xs" style={{ color: "var(--ink-soft)" }}>{totalDistance || "—"}</span>
        </div>
      </div>

      {/* Pothole status banner */}
      <div
        className="p-3 rounded-lg mb-3 flex items-center justify-between gap-2 text-xs font-mono"
        style={{
          background: potholeCount === 0 ? "var(--safe-bg)" : "var(--critical-bg)",
          border: `1px dashed ${potholeCount === 0 ? "var(--safe)" : "var(--critical)"}`,
          color: potholeCount === 0 ? "var(--safe)" : "var(--critical)"
        }}
      >
        <div className="flex items-center gap-2 font-bold truncate">
          {potholeCount === 0
            ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          }
          <span className="truncate">
            {potholeCount === 0 ? "Pothole-free corridor — 100% Safe" : `${potholeCount} potholes detected near route`}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1 max-h-[380px]">
        {steps.map((st, idx) => {
          const isHazard  = st.status === "HIGH" || st.instruction?.includes("Warning") || st.instruction?.includes("Potholes");
          const isActive  = idx === activeStepIndex;

          return (
            <div
              key={`step-${st.id || idx}`}
              onClick={() => onSelectStep && onSelectStep(st, idx)}
              className="p-3 rounded-lg cursor-pointer flex items-start justify-between gap-3 transition-all"
              style={{
                background: isActive ? "rgba(82, 176, 140, 0.15)" : "var(--surface-sunken)",
                border: `1px solid ${isActive ? "var(--safe)" : isHazard ? "rgba(226,84,60,0.4)" : "var(--line)"}`
              }}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">{getStepIcon(st)}</div>
                <div className="min-w-0">
                  <h4
                    className="text-xs font-bold font-heading leading-tight truncate"
                    style={{
                      color: isActive ? "var(--safe)" : isHazard ? "var(--critical)" : "var(--ink)"
                    }}
                  >
                    {st.instruction}
                  </h4>
                  <p className="text-[11px] font-mono mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                    {st.streetName && st.streetName !== "Corridor" ? `Via ${st.streetName} · ` : ""}
                    {st.distance || "100 m"}
                  </p>
                </div>
              </div>

              <span className={isActive ? "badge-dashed-safe shrink-0" : isHazard ? "badge-dashed-critical shrink-0" : "badge-dashed-safe shrink-0"}>
                {isActive ? "Active" : isHazard ? "Hazard" : "Clear"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GoogleMapDirectionsPanel;
