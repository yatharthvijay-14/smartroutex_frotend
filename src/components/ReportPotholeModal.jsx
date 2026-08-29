import React, { useState } from "react";
import { reportPothole } from "../services/api";
import { detectAIGeneratedImage } from "../services/aiDetectionService";
import { useAuth } from "../context/AuthContext";
import {
  AlertOctagon, X, Send, Camera, Upload, Trash2,
  ShieldCheck, ShieldAlert, Loader2, ScanLine,
  CheckCircle2, XCircle, Info, ChevronDown, ChevronUp
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Detection Result UI Component
// ─────────────────────────────────────────────────────────────────────────────
function DetectionResult({ result, onDismiss }) {
  const [showDetails, setShowDetails] = useState(false);
  const isAI = result.isAIGenerated;
  const conf = result.confidence;

  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      isAI
        ? "bg-rose-950/40 border-rose-500/50"
        : "bg-emerald-950/30 border-emerald-500/40"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isAI ? "bg-rose-500/20" : "bg-emerald-500/20"
        }`}>
          {isAI ? (
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-black text-sm ${isAI ? "text-rose-300" : "text-emerald-300"}`}>
              {isAI ? "AI-Generated Image Detected" : "Real Photo Verified"}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
              isAI
                ? "bg-rose-500/30 text-rose-300 border border-rose-500/40"
                : "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
            }`}>
              {conf}% confidence
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isAI ? "text-rose-300/70" : "text-emerald-300/70"}`}>
            {result.verdict}
          </p>
        </div>
        {!isAI && (
          <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Confidence Bar */}
      <div className="mt-3 mb-1">
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              conf >= 70 ? "bg-rose-500" :
              conf >= 38 ? "bg-amber-500" :
              conf >= 22 ? "bg-yellow-400" :
              "bg-emerald-500"
            }`}
            style={{ width: `${conf}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-bold">
          <span>Real</span>
          <span className="text-slate-400">{conf}% — blocked above 38%</span>
          <span>AI-Generated</span>
        </div>
      </div>

      {/* AI Error Message */}
      {isAI && (
        <div className="mt-3 bg-rose-900/30 border border-rose-500/30 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-200 font-semibold leading-relaxed">
            <strong>Upload blocked.</strong> Our system detected this image was likely generated
            by an AI tool (e.g. Stable Diffusion, Midjourney, DALL-E). Please upload an
            actual photograph of the pothole taken with your camera or phone.
          </p>
        </div>
      )}

      {/* Signal Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors font-semibold"
      >
        <Info className="w-3.5 h-3.5" />
        {showDetails ? "Hide" : "Show"} detection signals
        {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showDetails && (
        <div className="mt-2 space-y-1.5">
          {result.signals.map((sig, i) => (
            <div key={i} className="bg-slate-900/60 rounded-xl p-2.5 flex items-start gap-2.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                sig.score === 0 ? "bg-emerald-500/20" : "bg-rose-500/20"
              }`}>
                {sig.score === 0
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  : <XCircle className="w-3.5 h-3.5 text-rose-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-white">{sig.name}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                    sig.score === 0
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}>
                    {sig.score === 0 ? "PASS" : `+${sig.score}`}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{sig.detail}</p>
              </div>
            </div>
          ))}
          {result.width > 0 && (
            <div className="bg-slate-900/60 rounded-xl p-2.5">
              <p className="text-[10px] font-bold text-slate-300 mb-1">Image Dimensions:</p>
              <span className="text-[11px] text-slate-300 font-mono">{result.width} x {result.height} px</span>
              <span className="text-[10px] text-slate-500 ml-2">
                {result.width % 64 === 0 && result.height % 64 === 0
                  ? "(multiples of 64 — matches AI generation grid)"
                  : "(non-standard size — consistent with real camera)"}
              </span>
            </div>
          )}
          {result.exifTags && Object.keys(result.exifTags).length > 0 && (
            <div className="bg-slate-900/60 rounded-xl p-2.5">
              <p className="text-[10px] font-bold text-slate-300 mb-1">Detected EXIF Tags:</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.exifTags).slice(0, 8).map(([k, v]) => (
                  <span key={k} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {k}: {String(v).slice(0, 20)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scanning Animation Component
// ─────────────────────────────────────────────────────────────────────────────
function ScanningOverlay({ imagePreview, phase }) {
  const phases = [
    "Reading EXIF metadata...",
    "Analyzing pixel noise patterns...",
    "Checking color histogram...",
    "Evaluating file format..."
  ];
  return (
    <div className="relative rounded-2xl overflow-hidden border border-blue-500/60 bg-slate-950">
      <img src={imagePreview} alt="Scanning" className="w-full h-48 object-cover opacity-40" />
      {/* Animated scan line */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.7)]"
          style={{ animation: "scan-line 1.5s linear infinite", top: 0 }}
        />
      </div>
      {/* Overlay text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 rounded-2xl border border-blue-500/40 shadow-xl">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <ScanLine className="w-4 h-4 text-blue-300" />
          <span className="text-xs font-bold text-blue-200">AI Detection Running...</span>
        </div>
        <div className="px-4 py-1.5 bg-slate-900/80 rounded-xl border border-slate-700">
          <span className="text-[11px] text-slate-300 font-mono">{phases[phase % phases.length]}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────────────────────
function ReportPotholeModal({ isOpen, onClose, onPotholeReported, roads = [] }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    roadName: roads[0]?.name || "Jhalawar Road",
    severity: "HIGH",
    latitude: 25.18,
    longitude: 75.84,
    depth: "10 cm",
    description: "",
    imageUrl: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [detectionResult, setDetectionResult] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);

  if (!isOpen) return null;

  const runAIDetection = async (file, dataUrl) => {
    setIsScanning(true);
    setDetectionResult(null);
    setScanPhase(0);

    // Advance phase animation while detecting
    const phaseInterval = setInterval(() => setScanPhase(p => p + 1), 600);

    try {
      const result = await detectAIGeneratedImage(file, dataUrl);
      clearInterval(phaseInterval);
      setIsScanning(false);
      setDetectionResult(result);

      if (!result.isAIGenerated) {
        // Verified real — allow upload
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
      } else {
        // AI detected — block upload, keep preview for display but don't set imageUrl
        setFormData(prev => ({ ...prev, imageUrl: "" }));
      }
    } catch (e) {
      clearInterval(phaseInterval);
      setIsScanning(false);
      // On detection error, allow upload (fail-open)
      setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCurrentFile(file);
    setDetectionResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      await runAIDetection(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setDetectionResult(null);
    setCurrentFile(null);
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Block if AI detected
    if (detectionResult?.isAIGenerated) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const username = user?.username || "Guest";
      const payload = {
        roadName: formData.roadName,
        severity: formData.severity,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        depth: formData.depth,
        reportedAt: "Just now",
        reportedBy: username,
        imageUrl: formData.imageUrl || null
      };

      const result = await reportPothole(payload);

      // Save to user local reports storage
      try {
        const key = `smartroutex_user_reports_${username.toLowerCase()}`;
        const localSaved = JSON.parse(localStorage.getItem(key) || "[]");
        localSaved.unshift(result);
        localStorage.setItem(key, JSON.stringify(localSaved));
      } catch (_) {}
      setSuccessMsg("Pothole report & verified photo successfully transmitted!");

      if (onPotholeReported) onPotholeReported(result);

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMsg("");
        setImagePreview(null);
        setDetectionResult(null);
        setCurrentFile(null);
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isScanning && !(detectionResult?.isAIGenerated);

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="asphalt-card w-full max-w-lg p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="dot-glow-warn" />
          <div>
            <h3 className="text-lg font-bold font-heading" style={{ color: "var(--ink)" }}>Report Road Hazard / Pothole</h3>
            <p className="text-xs font-mono" style={{ color: "var(--ink-soft)" }}>Photos are AI-verified before submission</p>
          </div>
        </div>

        {/* Success */}
        {successMsg ? (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl text-center text-sm font-medium my-4 animate-pulse flex items-center gap-2 justify-center">
            <CheckCircle2 className="w-5 h-5" /> {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">

            {/* ── IMAGE UPLOAD ZONE ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-400" />
                Upload Pothole Photo
                <span className="ml-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[9px] font-black uppercase tracking-widest">
                  AI Verified
                </span>
              </label>

              {/* Scanning State */}
              {isScanning && imagePreview && (
                <ScanningOverlay imagePreview={imagePreview} phase={scanPhase} />
              )}

              {/* Preview State (after scan) */}
              {!isScanning && imagePreview && (
                <div>
                  <div className={`relative rounded-2xl overflow-hidden border max-h-48 group ${
                    detectionResult?.isAIGenerated
                      ? "border-rose-500/60"
                      : detectionResult && !detectionResult.isAIGenerated
                        ? "border-emerald-500/60"
                        : "border-slate-700"
                  }`}>
                    <img
                      src={imagePreview}
                      alt="Pothole preview"
                      className={`w-full h-48 object-cover transition-all duration-300 ${
                        detectionResult?.isAIGenerated ? "opacity-40 grayscale" : "opacity-100"
                      }`}
                    />
                    {/* Verified badge overlay */}
                    {detectionResult && !detectionResult.isAIGenerated && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-900/80 text-emerald-300 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> Real Photo Verified
                      </div>
                    )}
                    {/* AI blocked badge */}
                    {detectionResult?.isAIGenerated && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1 bg-rose-900/90 text-rose-300 text-xs font-black px-4 py-3 rounded-2xl border border-rose-500/50 shadow-2xl">
                          <XCircle className="w-6 h-6 text-rose-400" />
                          <span>AI IMAGE — BLOCKED</span>
                        </div>
                      </div>
                    )}
                    {/* Remove button (hover) */}
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Dropzone (when no image) */}
              {!imagePreview && !isScanning && (
                <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-blue-500/10 border border-slate-700 group-hover:border-blue-500/40 flex items-center justify-center mb-2 transition-all">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Click or drag photo here</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <ScanLine className="w-3 h-3 text-blue-400" />
                    AI will scan for authenticity before upload
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WEBP supported</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Detection Result Card */}
              {detectionResult && !isScanning && (
                <div className="mt-2">
                  <DetectionResult result={detectionResult} onDismiss={() => {}} />
                </div>
              )}
            </div>

            {/* ── FORM FIELDS ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Affected Road Corridor
              </label>
              <select
                value={formData.roadName}
                onChange={(e) => {
                  const selected = roads.find(r => r.name === e.target.value);
                  setFormData({
                    ...formData,
                    roadName: e.target.value,
                    latitude: selected?.latitude || formData.latitude,
                    longitude: selected?.longitude || formData.longitude
                  });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {roads.map(road => (
                  <option key={road.id || road.name} value={road.name}>{road.name}</option>
                ))}
                <option value="Other / Custom Location">Other / Custom Location</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Hazard Severity
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="HIGH">HIGH (Critical Danger)</option>
                  <option value="MEDIUM">MEDIUM (Caution)</option>
                  <option value="LOW">LOW (Minor Crack)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Estimated Depth
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 cm"
                  value={formData.depth}
                  onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Latitude</label>
                <input
                  type="number" step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Longitude</label>
                <input
                  type="number" step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isScanning || detectionResult?.isAIGenerated}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${
                  canSubmit && !isSubmitting
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-slate-700 cursor-not-allowed opacity-60"
                }`}
              >
                {isScanning ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning Photo...</>
                ) : detectionResult?.isAIGenerated ? (
                  <><XCircle className="w-3.5 h-3.5" /> Upload Blocked</>
                ) : isSubmitting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-3.5 h-3.5" /> Submit Hazard Report</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Inject scan-line keyframe */}
      <style>{`
        @keyframes scan-line {
          0%   { top: 0%; }
          50%  { top: 95%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}

export default ReportPotholeModal;
