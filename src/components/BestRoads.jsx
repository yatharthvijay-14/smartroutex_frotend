import React from "react";
import { Star } from "lucide-react";

function BestRoads({ roads = [], onSelectRoad }) {
  return (
    <div className="asphalt-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <h2 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
          <span className="section-dot" />
          <span>Safest &amp; Recommended Corridors</span>
        </h2>
        <span className="badge-dashed-safe">
          {roads.length} Safe
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto flex-1 max-h-[360px]">
        {roads.length === 0 ? (
          <p className="text-xs font-mono text-center py-8" style={{ color: "var(--ink-soft)" }}>No top-tier roads found</p>
        ) : (
          roads.map(road => (
            <div
              key={road.id || road.name}
              onClick={() => onSelectRoad && onSelectRoad(road)}
              className="p-3.5 rounded-lg cursor-pointer flex items-center justify-between transition-all hover:bg-white/[0.03]"
              style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)" }}
            >
              <div>
                <h3 className="text-xs font-bold font-heading" style={{ color: "var(--ink)" }}>{road.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono" style={{ color: "var(--ink-soft)" }}>
                  <span>Speed: {road.speedLimit || "50 km/h"}</span>
                  <span>·</span>
                  <span>Traffic: {road.traffic || "Light"}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold font-mono flex items-center justify-end gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {road.rating ? Number(road.rating).toFixed(1) : "4.8"}
                </div>
                <span className="badge-dashed-safe text-[9px] py-0 px-1.5 mt-1">
                  Optimal
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BestRoads;