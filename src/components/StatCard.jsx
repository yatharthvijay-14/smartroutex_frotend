import React from "react";

function StatCard({ title, value, subtitle, badge, badgeType = "default" }) {
  // Color mapping based on Asphalt Night tokens
  const getValueColor = () => {
    if (badgeType === "danger" || title?.toLowerCase().includes("active hazards") || title?.toLowerCase().includes("high risk")) {
      return "var(--critical)";
    }
    if (badgeType === "success" || title?.toLowerCase().includes("safe corridors")) {
      return "var(--safe)";
    }
    return "var(--ink)";
  };

  return (
    <div
      className="rounded-xl p-5 flex flex-col justify-between transition-all"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        boxShadow: "0 12px 28px -16px rgba(0,0,0,0.6)"
      }}
    >
      <div>
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2" style={{ color: "var(--ink-soft)" }}>
          {title}
        </p>
        <h3 className="text-3xl font-bold font-heading leading-tight" style={{ color: getValueColor() }}>
          {value}
        </h3>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between gap-2" style={{ borderTop: "1px solid var(--line)" }}>
        <span className="text-[11px] font-mono truncate" style={{ color: "var(--ink-soft)" }}>
          {subtitle || "City sector grid"}
        </span>

        {badge && (
          <span
            className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
            style={{
              background: badgeType === "danger" ? "var(--critical-bg)" : badgeType === "success" ? "var(--safe-bg)" : "var(--warn-bg)",
              color: badgeType === "danger" ? "var(--critical)" : badgeType === "success" ? "var(--safe)" : "var(--warn)",
              border: `1px dashed ${badgeType === "danger" ? "var(--critical)" : badgeType === "success" ? "var(--safe)" : "var(--warn)"}`
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;