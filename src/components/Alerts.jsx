import React, { useState } from "react";
import { AlertOctagon, Plus, ImageIcon, X, CheckCircle2 } from "lucide-react";

function Alerts({ potholes = [], onOpenReportModal }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="asphalt-card p-5 flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 mb-4 pb-3"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div>
          <h2 className="text-base font-bold font-heading flex items-center" style={{ color: "var(--ink)" }}>
            <span className="section-dot" />
            High-Risk Maintenance Hazards
          </h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--ink-soft)" }}>
            Live pothole alerts across monitored corridors
          </p>
        </div>

        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="btn-asphalt-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Report
          </button>
        )}
      </div>

      {/* Alert List */}
      <div className="space-y-2 overflow-y-auto flex-1 max-h-[420px]">
        {potholes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <CheckCircle2 className="w-8 h-8" style={{ color: "var(--safe)" }} />
            <p className="text-xs font-mono font-medium" style={{ color: "var(--ink-soft)" }}>
              No active pothole alerts
            </p>
          </div>
        ) : (
          potholes.map((pothole, index) => {
            const isHigh  = pothole.severity === "HIGH";
            const isFixed = pothole.status === "FIXED";
            const photo   = pothole.imageUrl;

            return (
              <div
                key={pothole.id || index}
                className="rounded-lg p-3.5 flex flex-col gap-2 transition-all hover:bg-white/[0.02]"
                style={{
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--line)"
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Glowing status dot + info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isFixed ? "dot-glow-safe" : isHigh ? "dot-glow-critical" : "dot-glow-warn"} />
                    <div className="min-w-0">
                      <h4
                        className="text-xs font-bold font-heading truncate"
                        style={{
                          color: isFixed ? "var(--ink-soft)" : "var(--ink)",
                          textDecoration: isFixed ? "line-through" : "none"
                        }}
                      >
                        {pothole.roadName || "Road Surface Hazard"}
                      </h4>
                      <p className="text-[11px] font-mono mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                        {pothole.roadName?.includes("Zone") ? pothole.roadName : "Pothole Corridor"}
                        {pothole.rating ? ` · rating ${pothole.rating}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Right: Depth, time, dashed pill badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block font-mono text-[11px]" style={{ color: "var(--ink-soft)" }}>
                      {pothole.depth ? `${pothole.depth} · ` : ""}{pothole.reportedAt || "Recently"}
                    </div>

                    <span className={isFixed ? "badge-dashed-safe" : isHigh ? "badge-dashed-critical" : "badge-dashed-warn"}>
                      {isFixed ? "Fixed" : isHigh ? "High risk" : (pothole.severity || "Medium")}
                    </span>
                  </div>
                </div>

                {/* Photo evidence preview */}
                {photo && !isFixed && (
                  <div
                    onClick={() => setSelectedImage(photo)}
                    className="relative h-20 rounded-lg overflow-hidden cursor-pointer group mt-1"
                    style={{ border: "1px solid var(--line)" }}
                  >
                    <img
                      src={photo}
                      alt="Pothole proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-bold font-mono text-white"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> View Photo
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[6000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)" }}
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged pothole photo"
              className="w-full h-auto rounded-xl"
              style={{ maxHeight: "75vh", objectFit: "contain", border: "1px solid var(--line)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Alerts;