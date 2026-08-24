import React from "react";
import { Gauge } from "lucide-react";

const TRAFFIC = [
  { area: "Kota Junction",    status: "Heavy",    density: "88%", type: "critical" },
  { area: "Talwandi Circle",  status: "Moderate", density: "62%", type: "warn"     },
  { area: "Aerodrome Circle", status: "Low",      density: "24%", type: "safe"     },
  { area: "Nayapura Heritage",status: "Moderate", density: "55%", type: "warn"     }
];

function TrafficStatus() {
  return (
    <div className="asphalt-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <h2 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
          <span className="section-dot" />
          <span>Live Traffic Grid</span>
        </h2>
        <span className="text-xs font-mono flex items-center gap-1" style={{ color: "var(--ink-soft)" }}>
          <Gauge className="w-3.5 h-3.5 text-amber-400" /> Sensors Active
        </span>
      </div>

      <div className="space-y-2.5">
        {TRAFFIC.map((item, i) => {
          const isSafe = item.type === "safe";
          const isWarn = item.type === "warn";

          return (
            <div
              key={i}
              className="p-3 rounded-lg flex items-center justify-between transition-all"
              style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)" }}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className={isSafe ? "dot-glow-safe" : isWarn ? "dot-glow-warn" : "dot-glow-critical"} />
                  <h4 className="text-xs font-bold font-heading" style={{ color: "var(--ink)" }}>{item.area}</h4>
                </div>
                <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: "var(--line)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: item.density,
                      background: isSafe ? "var(--safe)" : isWarn ? "var(--warn)" : "var(--critical)"
                    }}
                  />
                </div>
              </div>

              <span className={isSafe ? "badge-dashed-safe shrink-0 text-[9px]" : isWarn ? "badge-dashed-warn shrink-0 text-[9px]" : "badge-dashed-critical shrink-0 text-[9px]"}>
                {item.status} ({item.density})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrafficStatus;