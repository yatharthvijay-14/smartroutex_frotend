import React, { useState } from "react";
import { Clock, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";

function LiveStatusBar({ roadCount = 9, potholeCount = 7, lastRefreshed = "Just now", onManualRefresh }) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRefreshClick = () => {
    setIsSpinning(true);
    if (onManualRefresh) onManualRefresh();
    setTimeout(() => setIsSpinning(false), 800);
  };

  return (
    <div className="asphalt-card px-4 py-2.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      {/* Telemetry Status badges */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="badge-dashed-safe py-1 px-3">
          <span className="dot-glow-safe" />
          <span>LIVE TELEMETRY</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: "var(--safe)" }} />
            <strong style={{ color: "var(--text-primary)" }}>{roadCount}</strong> Corridors
          </span>

          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--risk)" }} />
            <strong style={{ color: "var(--text-primary)" }}>{potholeCount}</strong> Active Hazards
          </span>

          <span className="flex items-center gap-1.5 hidden sm:flex">
            <Clock className="w-3.5 h-3.5" style={{ color: "var(--medium)" }} />
            <span>Updated: <strong style={{ color: "var(--text-primary)" }}>{lastRefreshed}</strong></span>
          </span>
        </div>
      </div>

      {/* Manual Refresh Button */}
      <button
        onClick={handleRefreshClick}
        className="btn-asphalt-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} style={{ color: "var(--safe)" }} />
        <span>Refresh Data</span>
      </button>
    </div>
  );
}

export default LiveStatusBar;
