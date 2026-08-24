import React, { useState, useEffect, useCallback, useRef } from "react";
import { AlertTriangle, ShieldAlert, Route, X, Bell, RefreshCw, Zap, MapPin, Clock, User, Camera } from "lucide-react";

const TOAST_DURATION_MS = 8000;

const TOAST_CONFIG = {
  new_pothole:    { icon: AlertTriangle, accentVar: "--critical", badgeClass: "badge-dashed-critical", label: "HAZARD REPORTED" },
  road_risk:      { icon: ShieldAlert,   accentVar: "--warn",     badgeClass: "badge-dashed-warn",     label: "ROAD RISK SURGE" },
  road_degraded:  { icon: Zap,           accentVar: "--critical", badgeClass: "badge-dashed-critical", label: "ROAD CRITICAL" },
  route_invalid:  { icon: Route,         accentVar: "--safe",     badgeClass: "badge-dashed-safe",     label: "ROUTE ALERT" },
  data_refreshed: { icon: RefreshCw,     accentVar: "--safe",     badgeClass: "badge-dashed-safe",     label: "TELEMETRY SYNC" },
  info:           { icon: Bell,          accentVar: "--safe",     badgeClass: "badge-dashed-safe",     label: "NOTIFICATION" }
};

function ToastItem({ toast, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef   = useRef(null);

  useEffect(() => {
    const tick = () => {
      const elapsed   = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION_MS) * 100);
      setProgress(remaining);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(timer); };
  }, []);

  const cfg  = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = cfg.icon;
  const p    = toast.pothole || {};
  const timeStr = toast.reportedAt || new Date(toast.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="relative w-88 sm:w-96 rounded-xl overflow-hidden shadow-2xl transition-all font-mono"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        animation: "slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)"
      }}
    >
      {/* Top Accent Strip */}
      <div className="h-1 w-full" style={{ background: `var(${cfg.accentVar})` }} />

      <div className="p-4 flex flex-col gap-2.5">
        {/* Header line */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: `var(${cfg.accentVar})` }} />
            <span className={cfg.badgeClass}>
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              {timeStr}
            </span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              style={{ color: "var(--ink-soft)" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Message */}
        <div>
          <h4 className="text-xs font-bold font-heading leading-snug" style={{ color: "var(--ink)" }}>
            {toast.title}
          </h4>
          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {toast.message}
          </p>
        </div>

        {/* Rich Metadata Section for Pothole Reports */}
        {(toast.type === "new_pothole" || p.roadName) && (
          <div
            className="rounded-lg p-2.5 space-y-1 text-[10px]"
            style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)" }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-bold text-slate-400">
                <MapPin className="w-3 h-3 text-rose-400" /> Location:
              </span>
              <span className="font-bold text-slate-200 truncate max-w-[190px]">
                {p.roadName || toast.roadName || "City Grid Corridor"}
              </span>
            </div>

            {(p.latitude || toast.latitude) && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-emerald-400 font-bold">
                  {(p.latitude || toast.latitude)?.toFixed(4)}° N, {(p.longitude || toast.longitude)?.toFixed(4)}° E
                </span>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Preview */}
        {(p.imageUrl || toast.imageUrl) && (
          <div className="relative h-20 rounded-lg overflow-hidden border border-slate-700">
            <img
              src={p.imageUrl || toast.imageUrl}
              alt="Hazard proof"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-900">
        <div
          className="h-full transition-none"
          style={{ width: `${progress}%`, background: `var(${cfg.accentVar})` }}
        />
      </div>
    </div>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((alert) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => {
      const isDup = prev.some(t =>
        t.type === alert.type &&
        (t.potholeId === alert.potholeId || t.roadId === alert.roadId) &&
        Date.now() - t.timestamp < 15_000
      );
      if (isDup) return prev;
      return [...prev, { ...alert, id }].slice(-5);
    });
  }, []);

  const dismiss    = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  const dismissAll = useCallback(() => setToasts([]), []);

  return { toasts, addToast, dismiss, dismissAll };
}

export function ToastContainer({ toasts, onDismiss, onDismissAll }) {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-[9000] flex flex-col gap-2.5 items-end max-w-full">
        {toasts.length > 1 && (
          <button
            onClick={onDismissAll}
            className="btn-asphalt-secondary text-[10px] font-mono py-1 px-2"
          >
            Dismiss all ({toasts.length})
          </button>
        )}
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}
