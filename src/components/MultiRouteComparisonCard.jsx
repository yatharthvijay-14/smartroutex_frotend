import React from "react";
import { Check, ChevronRight } from "lucide-react";

function MultiRouteComparisonCard({ evaluatedRoutes = [], selectedRouteId, onSelectRoute }) {
  if (!evaluatedRoutes || evaluatedRoutes.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Section Title Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
            <span className="section-dot" />
            Multi-Route Safety Comparison
          </h3>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>
            Evaluated {evaluatedRoutes.length} candidate paths to Talwandi Main Road
          </p>
        </div>
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {evaluatedRoutes.map((rt, idx) => {
          const isSelected = selectedRouteId ? selectedRouteId === rt.id : idx === 0;
          const isSafest   = rt.statusTag === "SAFEST" || rt.safetyScore >= 90;

          return (
            <div
              key={`rt-card-${rt.id}`}
              onClick={() => onSelectRoute && onSelectRoute(rt)}
              className={`rounded-xl p-5 cursor-pointer flex flex-col justify-between transition-all ${
                isSelected ? "route-card-active" : "asphalt-card"
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold font-heading" style={{ color: "var(--ink)" }}>
                    {rt.name}
                  </h4>
                  <span className={isSafest ? "badge-dashed-safe" : "badge-dashed-critical"}>
                    {rt.statusTag} {rt.safetyScore}%
                  </span>
                </div>
                <p className="text-xs font-mono mb-4" style={{ color: "var(--ink-soft)" }}>
                  {isSafest ? "Pothole-free corridor" : "Has known potholes"}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4 py-2 border-y border-dashed" style={{ borderColor: "var(--line)" }}>
                  <div>
                    <span className="block text-[9px] font-mono font-bold uppercase" style={{ color: "var(--ink-soft)" }}>DISTANCE</span>
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--ink)" }}>{rt.distance}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono font-bold uppercase" style={{ color: "var(--ink-soft)" }}>EST. TIME</span>
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--ink)" }}>{rt.duration}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono font-bold uppercase" style={{ color: "var(--ink-soft)" }}>HAZARDS</span>
                    <span className="font-mono text-sm font-bold" style={{ color: rt.potholeCount > 0 ? "var(--critical)" : "var(--safe)" }}>
                      {rt.potholeCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono" style={{ color: "var(--ink-soft)" }}>
                  Risk score: <strong style={{ color: "var(--ink)" }}>{rt.riskScore} pts</strong>
                </span>

                {isSelected ? (
                  <button className="btn-asphalt-primary flex items-center gap-1.5 pointer-events-none">
                    <Check className="w-3.5 h-3.5" /> Active route
                  </button>
                ) : (
                  <button className="btn-asphalt-secondary flex items-center gap-1">
                    Select <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MultiRouteComparisonCard;
