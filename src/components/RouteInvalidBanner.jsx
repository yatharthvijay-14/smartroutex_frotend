import React from "react";
import { Route, RefreshCw, X, AlertTriangle } from "lucide-react";

export default function RouteInvalidBanner({ event, onRecalculate, onDismiss }) {
  if (!event) return null;
  const { pothole } = event;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold shadow-lg"
      style={{
        background: "var(--accent-amber-bg)",
        border: "1px solid rgba(210,153,34,0.4)",
        animation: "slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1)"
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-12px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(210,153,34,0.2)" }}
      >
        <AlertTriangle className="w-4 h-4" style={{ color: "var(--accent-amber)" }} />
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <span className="font-bold" style={{ color: "var(--accent-amber)" }}>
          Route Affected — New Pothole Detected
        </span>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
          A{" "}
          <strong style={{ color: pothole?.severity === "HIGH" ? "var(--accent-rose)" : "var(--accent-amber)" }}>
            {pothole?.severity || "new"}
          </strong>{" "}
          severity pothole was reported on{" "}
          <em style={{ color: "var(--text-primary)" }}>{pothole?.roadName || "your current route"}</em>.
          Your route may need recalculation.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRecalculate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all active:scale-95"
          style={{ background: "var(--accent-amber)", color: "#fff" }}
        >
          <RefreshCw className="w-3 h-3" /> Recalculate
        </button>
        <button
          onClick={onDismiss}
          className="transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
