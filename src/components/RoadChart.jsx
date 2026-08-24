import React from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const weeklyData = [
  { day: "Mon", potholes: 12, repaired: 8  },
  { day: "Tue", potholes: 19, repaired: 14 },
  { day: "Wed", potholes: 15, repaired: 12 },
  { day: "Thu", potholes: 25, repaired: 18 },
  { day: "Fri", potholes: 18, repaired: 20 },
  { day: "Sat", potholes: 10, repaired: 12 },
  { day: "Sun", potholes:  7, repaired:  9 }
];

function RoadChart() {
  return (
    <div className="asphalt-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <div>
          <h2 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
            <span className="section-dot" />
            Pothole Detection &amp; Repair Trends
          </h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>
            7-day rolling report — detected vs. repaired hazards
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="potholesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#E2543C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#E2543C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="repairedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#52B08C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#52B08C" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2A2F35" opacity={0.8} vertical={false} />
            <XAxis dataKey="day" stroke="#868D95" fontSize={11} fontFamily="IBM Plex Mono" tickLine={false} />
            <YAxis stroke="#868D95" fontSize={11} fontFamily="IBM Plex Mono" tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                borderColor:     "var(--line)",
                borderRadius:    "8px",
                fontSize:        "12px",
                fontFamily:      "IBM Plex Mono",
                color:           "var(--ink)"
              }}
              labelStyle={{ color: "var(--ink)", fontWeight: "bold" }}
              itemStyle={{ color: "var(--ink)" }}
            />
            <Area
              type="monotone"
              dataKey="potholes"
              name="Detected Potholes"
              stroke="#E2543C"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#potholesGrad)"
            />
            <Area
              type="monotone"
              dataKey="repaired"
              name="Repaired Potholes"
              stroke="#52B08C"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#repairedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-6 text-xs font-mono pt-3" style={{ borderTop: "1px solid var(--line)", color: "var(--ink-soft)" }}>
        <span className="flex items-center gap-2">
          <span className="w-3 h-1 rounded-full bg-[#E2543C] inline-block" /> Detected Hazards
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-1 rounded-full bg-[#52B08C] inline-block" /> Repaired / Fixed
        </span>
      </div>
    </div>
  );
}

export default RoadChart;