import React, { useState } from "react";
import { Star, Wrench, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

function HighRiskRoads({ roads = [], onSelectRoad, onDispatchRepair }) {
  const [dispatchStatus, setDispatchStatus] = useState({});

  const handleDispatchClick = (e, road) => {
    e.stopPropagation();
    const roadKey = road.id || road.name;

    setDispatchStatus(prev => ({ ...prev, [roadKey]: "DISPATCHING" }));

    setTimeout(() => {
      setDispatchStatus(prev => ({ ...prev, [roadKey]: "DISPATCHED" }));

      if (onDispatchRepair) {
        onDispatchRepair(road);
      }
    }, 700);
  };

  return (
    <div className="asphalt-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <h2 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
          <span className="section-dot" />
          <span>High-Risk Maintenance Corridors</span>
        </h2>
        <span className="badge-dashed-critical">
          {roads.length} Critical
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto flex-1 max-h-[380px]">
        {roads.length === 0 ? (
          <div className="badge-dashed-safe py-6 justify-center w-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>No critical high-risk hazards detected</span>
          </div>
        ) : (
          roads.map(road => {
            const roadKey = road.id || road.name;
            const status = dispatchStatus[roadKey] || "IDLE";

            return (
              <div
                key={roadKey}
                onClick={() => onSelectRoad && onSelectRoad(road)}
                className="p-3.5 rounded-lg cursor-pointer flex items-center justify-between transition-all hover:bg-white/[0.03]"
                style={{
                  background: status === "DISPATCHED" ? "var(--safe-bg)" : "var(--surface-sunken)",
                  border: status === "DISPATCHED" ? "1px dashed var(--safe)" : "1px solid var(--line)"
                }}
              >
                <div className="flex items-center gap-3">
                  <span className={status === "DISPATCHED" ? "dot-glow-safe" : "dot-glow-critical"} />
                  <div>
                    <h3 className="text-xs font-bold font-heading" style={{ color: "var(--ink)" }}>{road.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono" style={{ color: "var(--ink-soft)" }}>
                      <span className={status === "DISPATCHED" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {status === "DISPATCHED" ? "REPAIR EN ROUTE" : "HIGH RISK"}
                      </span>
                      <span>·</span>
                      <span>{road.potholesCount || "7+"} potholes</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <div className="text-xs font-bold flex items-center justify-end gap-1 text-rose-400">
                    <Star className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                    {road.rating ? Number(road.rating).toFixed(1) : "1.8"}
                  </div>

                  <div className="mt-1 flex justify-end">
                    {status === "DISPATCHING" ? (
                      <span className="badge-dashed-warn text-[9px] py-0.5 px-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Dispatching...
                      </span>
                    ) : status === "DISPATCHED" ? (
                      <span className="badge-dashed-safe text-[9px] py-0.5 px-2">
                        <CheckCircle2 className="w-3 h-3" /> Dispatched
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleDispatchClick(e, road)}
                        className="btn-asphalt-secondary text-[10px] font-mono py-1 px-2 flex items-center gap-1"
                      >
                        <Wrench className="w-3 h-3 text-amber-400" /> Dispatch Repair
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default HighRiskRoads;