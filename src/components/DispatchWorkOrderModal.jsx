import React, { useState } from "react";
import { X, Wrench, ShieldCheck, Truck, Clock, AlertTriangle, FileText, CheckCircle2, Loader2 } from "lucide-react";

function DispatchWorkOrderModal({ isOpen, onClose, road, onConfirmDispatch }) {
  const [crewUnit, setCrewUnit] = useState("Kota Rapid Patch Crew #4");
  const [priority, setPriority] = useState("EMERGENCY (HIGH)");
  const [patchMaterial, setPatchMaterial] = useState("Cold-Mix Bituminous Asphalt (350kg)");
  const [isDispatching, setIsDispatching] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen || !road) return null;

  const workOrderId = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleConfirm = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setIsCompleted(true);
      setTimeout(() => {
        if (onConfirmDispatch) onConfirmDispatch(road, workOrderId, crewUnit);
        onClose();
        setIsCompleted(false);
      }, 1200);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-[7000] flex items-center justify-center p-4 select-none"
      style={{ background: "rgba(7, 10, 18, 0.85)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="relative max-w-lg w-full rounded-3xl p-6 shadow-2xl overflow-hidden border font-sans"
        style={{
          background: "var(--bg-card)",
          borderColor: "rgba(245, 158, 11, 0.4)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.2)",
          borderTop: "4px solid #f59e0b"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer"
          style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center shadow-lg shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
              Municipal Repair Dispatch Hub
            </h3>
            <p className="text-xs font-semibold text-amber-500 mt-0.5 flex items-center gap-1.5">
              <span>Work Order ID:</span>
              <span className="font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">{workOrderId}</span>
            </p>
          </div>
        </div>

        {isCompleted ? (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-emerald-400">Work Order Dispatched!</h4>
            <p className="text-xs text-slate-300 max-w-sm">
              Crew <strong>{crewUnit}</strong> deployed to <strong>{road.name}</strong>. ETA: 25 minutes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Target Road Card */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <h4 className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>{road.name}</h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">High-Risk Hazard Corridor · Rating {road.rating ? Number(road.rating).toFixed(1) : "1.8"}/5</p>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-sm">
                CRITICAL
              </span>
            </div>

            {/* Crew Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Assigned Maintenance Unit
              </label>
              <select
                value={crewUnit}
                onChange={e => setCrewUnit(e.target.value)}
                className="w-full p-3 rounded-xl text-xs font-bold border outline-none cursor-pointer"
                style={{ background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option value="Kota Rapid Patch Crew #4">Kota Rapid Patch Crew #4 (ETA 25m)</option>
                <option value="Municipal Highway Asphalt Team A">Municipal Highway Asphalt Team A (ETA 40m)</option>
                <option value="Emergency Hazard Repair Response Unit">Emergency Hazard Repair Response Unit (ETA 15m)</option>
              </select>
            </div>

            {/* Patch Materials */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Allocated Repair Material
              </label>
              <input
                type="text"
                value={patchMaterial}
                onChange={e => setPatchMaterial(e.target.value)}
                className="w-full p-3 rounded-xl text-xs font-bold border outline-none"
                style={{ background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                disabled={isDispatching}
                onClick={handleConfirm}
                className="flex-1 py-3 text-xs font-extrabold text-slate-950 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isDispatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Dispatching Unit...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-slate-950" />
                    <span>Confirm &amp; Dispatch Crew</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DispatchWorkOrderModal;
