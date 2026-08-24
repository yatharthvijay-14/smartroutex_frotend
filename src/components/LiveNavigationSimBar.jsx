import React from "react";
import { Navigation, PlayCircle, PauseCircle, StopCircle, Gauge } from "lucide-react";

function LiveNavigationSimBar({
  isNavigating, isPaused,
  onStartNavigation, onPauseNavigation, onStopNavigation,
  currentInstruction = "Enter a route above then click 'Start Navigation' to begin driving mode.",
  progressPercent = 0,
  speedKmH = 45
}) {
  return (
    <div
      className="rounded-xl p-4 mb-4 relative z-20"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${isNavigating && !isPaused ? "rgba(63,185,80,0.4)" : "var(--border)"}`,
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

        {/* Status + instruction */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: isNavigating && !isPaused
                ? "var(--accent-green-bg)"
                : "var(--bg-elevated)",
              border: `1px solid ${isNavigating && !isPaused ? "rgba(63,185,80,0.35)" : "var(--border)"}`
            }}
          >
            <Navigation
              className={`w-5 h-5 ${isNavigating && !isPaused ? "animate-pulse" : ""}`}
              style={{ color: isNavigating && !isPaused ? "var(--accent-green)" : "var(--text-muted)" }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={
                  isNavigating
                    ? isPaused
                      ? { background: "var(--accent-amber-bg)", color: "var(--accent-amber)", border: "1px solid rgba(210,153,34,0.3)" }
                      : { background: "var(--accent-green-bg)",  color: "var(--accent-green)",  border: "1px solid rgba(63,185,80,0.3)" }
                    : { background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                }
              >
                {isNavigating ? (isPaused ? "Paused" : "Driving Active") : "Idle"}
              </span>

              {isNavigating && !isPaused && (
                <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: "var(--accent-blue)" }}>
                  <Gauge className="w-3 h-3" /> {speedKmH} km/h · {progressPercent}% completed
                </span>
              )}
            </div>

            <p className="text-xs font-medium mt-1 truncate" style={{ color: "var(--text-primary)" }}>
              {isNavigating ? currentInstruction : "Route planned — click 'Start Navigation' to simulate driving."}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!isNavigating ? (
            <button
              type="button"
              onClick={onStartNavigation}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all active:scale-95"
              style={{ background: "var(--accent-green)", color: "#fff", boxShadow: "0 4px 12px rgba(63,185,80,0.3)" }}
            >
              <PlayCircle className="w-4 h-4" /> Start Navigation
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onPauseNavigation}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all"
                style={{ background: "var(--accent-amber-bg)", color: "var(--accent-amber)", border: "1px solid rgba(210,153,34,0.3)" }}
              >
                {isPaused
                  ? <><PlayCircle className="w-4 h-4" /> Resume</>
                  : <><PauseCircle className="w-4 h-4" /> Pause</>
                }
              </button>
              <button
                type="button"
                onClick={onStopNavigation}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all"
                style={{ background: "var(--accent-rose-bg)", color: "var(--accent-rose)", border: "1px solid rgba(248,81,73,0.3)" }}
              >
                <StopCircle className="w-4 h-4" /> Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {isNavigating && (
        <div
          className="w-full h-1.5 rounded-full mt-3 overflow-hidden"
          style={{ background: "var(--bg-elevated)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, var(--accent-green), var(--accent-blue))"
            }}
          />
        </div>
      )}
    </div>
  );
}

export default LiveNavigationSimBar;
