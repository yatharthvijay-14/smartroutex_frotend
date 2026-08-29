import React, { useState } from "react";
import {
  CheckCircle2, Trash2, ImageOff, AlertTriangle, Shield,
  MapPin, Clock, Ruler, ChevronDown, ChevronUp, X, Image as ImageIcon
} from "lucide-react";
import { markPotholeFixed, deletePotholeReport, removePotholeImage } from "../services/api";

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[7000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="rounded-xl p-6 shadow-2xl max-w-sm w-full font-mono"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <h3 className="font-bold font-heading text-sm mb-2" style={{ color: "var(--ink)" }}>
          Confirm Action
        </h3>
        <p className="text-xs mb-5 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-asphalt-secondary py-1.5 px-3 text-xs">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-xs font-mono font-bold text-white rounded-lg transition-all"
            style={{ background: "var(--critical)" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function MyReports({ potholes = [], onDataChanged }) {
  const [expandedId, setExpandedId]   = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [confirm,     setConfirm]     = useState(null);
  const [loadingId,   setLoadingId]   = useState(null);

  const handleMarkFixed = async id => {
    setLoadingId(id);
    await markPotholeFixed(id);
    setLoadingId(null);
    onDataChanged?.();
  };

  const handleDelete = async id => {
    setLoadingId(id);
    await deletePotholeReport(id);
    setLoadingId(null);
    onDataChanged?.();
  };

  const handleRemoveImage = async id => {
    setLoadingId(id);
    await removePotholeImage(id);
    setLoadingId(null);
    onDataChanged?.();
  };

  const activeCount = potholes.filter(p => (p.status || "ACTIVE") === "ACTIVE").length;
  const fixedCount  = potholes.filter(p => p.status === "FIXED").length;

  return (
    <div className="asphalt-card p-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div>
          <h2 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
            <span className="section-dot" />
            My Reported Potholes
          </h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>
            Manage all hazard reports you have submitted
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-dashed-critical">
            <AlertTriangle className="w-3 h-3" /> {activeCount} Active
          </span>
          <span className="badge-dashed-safe">
            <CheckCircle2 className="w-3 h-3" /> {fixedCount} Fixed
          </span>
        </div>
      </div>

      {/* Empty state */}
      {potholes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)" }}
          >
            <Shield className="w-6 h-6" style={{ color: "var(--ink-soft)" }} />
          </div>
          <p className="font-bold font-heading text-sm" style={{ color: "var(--ink)" }}>No reports found</p>
          <p className="text-xs font-mono" style={{ color: "var(--ink-soft)" }}>Reports you submit will appear here</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {potholes.map((p, idx) => {
            const id         = p.id || idx;
            const isExpanded = expandedId === id;
            const isFixed    = p.status === "FIXED";
            const isLoading  = loadingId === p.id;
            const photo      = p.imageUrl;
            const isHigh     = p.severity === "HIGH";

            return (
              <div
                key={id}
                className="rounded-lg overflow-hidden transition-all"
                style={{
                  background: isFixed ? "var(--safe-bg)" : "var(--surface-sunken)",
                  border: `1px solid ${isFixed ? "var(--safe)" : "var(--line)"}`,
                }}
              >
                {/* Card header row */}
                <div className="flex items-center gap-3 p-3.5">
                  <span className={isFixed ? "dot-glow-safe" : isHigh ? "dot-glow-critical" : "dot-glow-warn"} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className="text-xs font-bold font-heading"
                        style={{
                          color: isFixed ? "var(--ink-soft)" : "var(--ink)",
                          textDecoration: isFixed ? "line-through" : "none"
                        }}
                      >
                        {p.roadName || "Unnamed Corridor"}
                      </h3>
                      <span className={isFixed ? "badge-dashed-safe text-[9px] py-0 px-1.5" : isHigh ? "badge-dashed-critical text-[9px] py-0 px-1.5" : "badge-dashed-warn text-[9px] py-0 px-1.5"}>
                        {isFixed ? "Fixed" : p.severity || "Medium"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 font-mono text-[11px]" style={{ color: "var(--ink-soft)" }}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> {p.reportedAt || "Just now"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3 h-3 text-emerald-400" /> {p.depth || "N/A"}
                      </span>
                      {p.latitude && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>{p.latitude?.toFixed(4)}, {p.longitude?.toFixed(4)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : id)}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer"
                    style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 pt-3 space-y-3 font-mono"
                    style={{ borderTop: "1px solid var(--line)" }}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "var(--ink-soft)" }}>
                        <ImageIcon className="w-3 h-3 text-emerald-400" /> Photo Proof
                      </p>
                      {photo ? (
                        <div className="flex items-start gap-3">
                          <div
                            onClick={() => setLightboxImg(photo)}
                            className="relative h-28 w-40 rounded-lg overflow-hidden cursor-pointer group shrink-0"
                            style={{ border: "1px solid var(--line)" }}
                          >
                            <img src={photo} alt="Pothole proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <button
                            disabled={isLoading}
                            onClick={() => setConfirm({ type: "removeImage", id: p.id, label: `Remove photo from "${p.roadName}"?` })}
                            className="btn-asphalt-secondary text-xs py-1 px-2 flex items-center gap-1"
                          >
                            <ImageOff className="w-3 h-3 text-rose-400" /> Remove Photo
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg text-xs italic" style={{ background: "var(--surface)", border: "1px dashed var(--line)", color: "var(--ink-soft)" }}>
                          No photo attached
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--line)" }}>
                      {!isFixed ? (
                        <button
                          disabled={isLoading}
                          onClick={() => setConfirm({ type: "fix", id: p.id, label: `Mark "${p.roadName}" as fixed?` })}
                          className="btn-asphalt-primary flex items-center gap-1 py-1.5 px-3 text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Fixed
                        </button>
                      ) : (
                        <span className="badge-dashed-safe">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Marked Fixed
                        </span>
                      )}

                      <button
                        disabled={isLoading}
                        onClick={() => setConfirm({ type: "delete", id: p.id, label: `Delete report for "${p.roadName}"?` })}
                        className="btn-asphalt-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                        style={{ color: "var(--critical)", borderColor: "var(--critical-bg)" }}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[6000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)" }}
            >
              <X className="w-4 h-4" />
            </button>
            <img src={lightboxImg} alt="Pothole evidence" className="w-full h-auto rounded-xl" style={{ maxHeight: "75vh", objectFit: "contain" }} />
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          message={confirm.label}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            const { type, id } = confirm;
            setConfirm(null);
            if (type === "fix")         await handleMarkFixed(id);
            if (type === "delete")      await handleDelete(id);
            if (type === "removeImage") await handleRemoveImage(id);
          }}
        />
      )}
    </div>
  );
}

export default MyReports;
