import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div
      className="p-3 rounded-lg text-xs font-mono"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        color: "var(--ink)",
        boxShadow: "0 12px 28px -16px rgba(0,0,0,0.8)"
      }}
    >
      <p className="font-bold font-heading text-sm mb-1" style={{ color: "var(--ink)" }}>{data.fullName || label}</p>
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--ink-soft)" }}>Quality Rating:</span>
        <span className="font-bold text-amber-400">★ {data.rating}/5.0</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span style={{ color: "var(--ink-soft)" }}>Risk Status:</span>
        <span
          className="font-bold"
          style={{
            color: data.rating < 3.0
              ? "var(--critical)"
              : data.rating >= 4.0
              ? "var(--safe)"
              : "var(--warn)"
          }}
        >
          {data.rating < 3.0 ? "High Risk" : data.rating >= 4.0 ? "Safe" : "Medium"}
        </span>
      </div>
    </div>
  );
};

function AnalyticsChart({ roads = [] }) {
  const [metric, setMetric] = useState("rating");

  const chartData = roads.slice(0, 10).map(road => ({
    name: (road.name || "Road").split(" ")[0],
    fullName: road.name,
    rating: Number(road.rating || 0),
    potholes: road.potholesCount || (road.rating < 3 ? 8 : road.rating < 4 ? 3 : 1)
  }));

  const getBarColor = r => r >= 4.0 ? "#52B08C" : r >= 3.0 ? "#E8A33D" : "#E2543C";

  return (
    <div className="asphalt-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <div>
          <h2 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
            <span className="section-dot" />
            Infrastructure Quality Analytics
          </h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>
            Road surface rating &amp; pothole density
          </p>
        </div>

        {/* Metric Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMetric("rating")}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              metric === "rating" ? "badge-dashed-safe" : "btn-asphalt-secondary"
            }`}
          >
            Ratings (0–5★)
          </button>
          <button
            onClick={() => setMetric("potholes")}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              metric === "potholes" ? "badge-dashed-critical" : "btn-asphalt-secondary"
            }`}
          >
            Pothole Count
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[300px] pt-2">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono" style={{ color: "var(--ink-soft)" }}>
            No telemetry data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F35" opacity={0.8} vertical={false} />
              <XAxis dataKey="name" stroke="#868D95" fontSize={11} fontFamily="IBM Plex Mono" tickLine={false} interval={0} angle={-20} textAnchor="end" />
              <YAxis stroke="#868D95" fontSize={11} fontFamily="IBM Plex Mono" tickLine={false} domain={metric === "rating" ? [0, 5] : [0, "auto"]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey={metric} radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={metric === "rating" ? getBarColor(entry.rating) : "#E2543C"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-6 text-xs font-mono pt-3" style={{ borderTop: "1px solid var(--line)", color: "var(--ink-soft)" }}>
        <span className="flex items-center gap-2">
          <span className="dot-glow-safe" /> Safe (&gt;4.0)
        </span>
        <span className="flex items-center gap-2">
          <span className="dot-glow-warn" /> Medium (3–4)
        </span>
        <span className="flex items-center gap-2">
          <span className="dot-glow-critical" /> High Risk (&lt;3.0)
        </span>
      </div>
    </div>
  );
}

export default AnalyticsChart;