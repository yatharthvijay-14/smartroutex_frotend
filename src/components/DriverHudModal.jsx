import React, { useState, useEffect } from "react";
import { X, Navigation, AlertTriangle, ShieldCheck, Zap, Volume2, VolumeX, Activity, Compass, Gauge } from "lucide-react";
import { speakVoiceAlert } from "../services/VoiceAlertService";

function DriverHudModal({ isOpen, onClose, routePlan, currentPos }) {
  const [speed, setSpeed] = useState(48);
  const [riskScore, setRiskScore] = useState(12);
  const [isImpactWarning, setIsImpactWarning] = useState(false);
  const [gForce, setGForce] = useState(1.02);

  useEffect(() => {
    if (!isOpen) return;
    speakVoiceAlert("SmartRouteX Drive Mode HUD Active. Monitoring road telemetry and pothole hazards.");

    const interval = setInterval(() => {
      // Simulate velocity variations
      setSpeed(prev => Math.max(30, Math.min(85, prev + (Math.random() * 6 - 3))));
      
      // Simulate random road bumps / G-force spikes
      const bump = Math.random();
      if (bump > 0.85) {
        setIsImpactWarning(true);
        setGForce(2.4);
        setRiskScore(78);
        speakVoiceAlert("Caution: Road bump detected ahead. Reduce speed.");
        setTimeout(() => setIsImpactWarning(false), 1500);
      } else {
        setGForce(1.0 + Math.random() * 0.15);
        setRiskScore(15);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[8000] flex flex-col justify-between p-6 select-none font-mono transition-colors duration-300 ${
        isImpactWarning ? "bg-rose-950/90 ring-8 ring-rose-500/80 animate-pulse" : "bg-slate-950/95"
      }`}
      style={{ backdropFilter: "blur(20px)" }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-extrabold shadow-lg">
            <Gauge className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-black text-cyan-400 tracking-wider">SMARTROUTEX · HUD MODE</h2>
            <p className="text-xs text-slate-400">Telemetry Radar &amp; Audio Hazard Detector</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => speakVoiceAlert("SmartRouteX Telemetry status normal. Proceeding on safe path.")}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-2 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> Voice Status
          </button>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Telemetry Dashboard */}
      <div className="relative my-auto flex flex-col items-center justify-center gap-6">
        
        {/* Speedometer Circle */}
        <div className="relative w-72 h-72 rounded-full border-4 border-cyan-500/30 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl shadow-cyan-500/20">
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-spin-slow" />
          <span className="text-6xl font-black text-white tracking-tighter">{Math.round(speed)}</span>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mt-1">KM / H</span>
          <span className="text-[10px] text-slate-400 mt-2 font-sans">OPTIMAL VELOCITY</span>
        </div>

        {/* Hazard Warning Pill */}
        {isImpactWarning ? (
          <div className="px-6 py-3 rounded-2xl bg-rose-500 text-white font-extrabold text-sm flex items-center gap-3 shadow-2xl animate-bounce">
            <AlertTriangle className="w-5 h-5 text-white" />
            <span>POTHOLE IMPACT DETECTED · REDUCE SPEED</span>
          </div>
        ) : (
          <div className="px-6 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs flex items-center gap-3 shadow-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>ROAD TELEMETRY CLEAR · SAFEST PATH ACTIVE</span>
          </div>
        )}

      </div>

      {/* Bottom Telemetry Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 z-10">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <Activity className="w-6 h-6 text-purple-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">G-FORCE ACCELEROMETER</div>
            <div className="text-xl font-extrabold text-purple-300">{gForce.toFixed(2)} G</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <Zap className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">HAZARD RISK SCORE</div>
            <div className="text-xl font-extrabold text-amber-300">{riskScore} / 100</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <Compass className="w-6 h-6 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">CURRENT CORRIDOR</div>
            <div className="text-sm font-extrabold text-cyan-300 truncate">Kota Urban Telemetry Sector</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverHudModal;
