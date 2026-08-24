import React from "react";

export const BACKGROUND_VARIANTS = [
  { id: "asphalt_grid",    label: "01 · Asphalt Grid" },
  { id: "route_contours",  label: "02 · Route Contours" },
  { id: "spotlight_dots",  label: "03 · Spotlight Dots" },
  { id: "animated_path",   label: "04 · Animated Path" }
];

export function AuthBackgrounds({ activeVariant }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: "#0a0a0c" }}>
      {/* ── 01. ASPHALT GRID ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          activeVariant === "asphalt_grid" ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 15%, rgba(212,160,23,0.22) 0%, transparent 60%),
            repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(212,160,23,0.15) 79px, rgba(212,160,23,0.15) 80px),
            linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 32px 32px, 32px 32px"
        }}
      />

      {/* ── 02. ROUTE CONTOURS ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          activeVariant === "route_contours" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 20%, rgba(212,160,23,0.15) 0%, transparent 60%)"
          }}
        />
        <svg className="w-full h-full opacity-35" viewBox="0 0 1440 900" fill="none">
          <path d="M-100 200 C300 100, 500 500, 900 300 C1200 150, 1400 400, 1600 250" stroke="#d4a017" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M-100 400 C400 300, 600 700, 1000 450 C1250 300, 1450 600, 1600 400" stroke="#d4a017" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="6 6" />
          <path d="M-100 600 C200 450, 700 800, 1100 550 C1300 400, 1500 750, 1600 600" stroke="#5fd6a0" strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M-100 100 C500 250, 400 650, 800 750 C1100 850, 1350 500, 1600 700" stroke="#d4a017" strokeWidth="1" fill="none" opacity="0.3" />
          {/* Contour elevation loops */}
          <ellipse cx="720" cy="450" rx="450" ry="250" stroke="#d4a017" strokeWidth="1" opacity="0.25" fill="none" />
          <ellipse cx="720" cy="450" rx="320" ry="180" stroke="#d4a017" strokeWidth="1" opacity="0.2" fill="none" />
          <ellipse cx="720" cy="450" rx="200" ry="110" stroke="#5fd6a0" strokeWidth="1" opacity="0.25" fill="none" />
        </svg>
      </div>

      {/* ── 03. SPOTLIGHT DOTS ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          activeVariant === "spotlight_dots" ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 18%, rgba(212,160,23,0.28) 0%, transparent 55%),
            radial-gradient(circle at 88% 85%, rgba(95,214,160,0.18) 0%, transparent 50%),
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)
          `,
          backgroundSize: "100% 100%, 100% 100%, 24px 24px"
        }}
      />

      {/* ── 04. ANIMATED PATH ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          activeVariant === "animated_path" ? "opacity-100" : "opacity-0"
        }`}
      >
        <style>{`
          @keyframes dashTraceRoute {
            from { stroke-dashoffset: 2000; }
            to   { stroke-dashoffset: 0; }
          }
          .anim-route-line-1 {
            stroke-dasharray: 12 16;
            animation: dashTraceRoute 25s linear infinite;
          }
          .anim-route-line-2 {
            stroke-dasharray: 10 20;
            animation: dashTraceRoute 18s linear infinite reverse;
          }
          @keyframes pulseWaypoint {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50%      { transform: scale(1.4); opacity: 1; }
          }
        `}</style>
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 20%, rgba(212,160,23,0.18) 0%, transparent 65%)"
          }}
        />
        <svg className="w-full h-full opacity-60" viewBox="0 0 1440 900" fill="none">
          {/* Main Primary Route Line (Amber) */}
          <path
            d="M 100 150 L 350 280 L 520 200 L 720 450 L 950 350 L 1180 600 L 1380 500"
            stroke="#d4a017"
            strokeWidth="2.5"
            className="anim-route-line-1"
          />
          {/* Secondary AI Safest Bypass Line (Green) */}
          <path
            d="M 100 300 C 400 100, 600 650, 950 500 C 1150 400, 1300 750, 1380 650"
            stroke="#5fd6a0"
            strokeWidth="2.5"
            className="anim-route-line-2"
          />

          {/* Waypoint Nodes */}
          <g>
            <circle cx="350" cy="280" r="5" fill="#d4a017" />
            <circle cx="350" cy="280" r="10" stroke="#d4a017" strokeWidth="1" fill="none" opacity="0.6" />

            <circle cx="520" cy="200" r="5" fill="#5fd6a0" />
            <circle cx="520" cy="200" r="10" stroke="#5fd6a0" strokeWidth="1" fill="none" opacity="0.6" />

            <circle cx="720" cy="450" r="7" fill="#d4a017" />
            <circle cx="720" cy="450" r="14" stroke="#d4a017" strokeWidth="1.5" fill="none" opacity="0.8" />

            <circle cx="950" cy="350" r="5" fill="#5fd6a0" />
            <circle cx="950" cy="350" r="10" stroke="#5fd6a0" strokeWidth="1" fill="none" opacity="0.6" />

            <circle cx="1180" cy="600" r="5" fill="#d4a017" />
            <circle cx="1180" cy="600" r="10" stroke="#d4a017" strokeWidth="1" fill="none" opacity="0.6" />
          </g>
        </svg>
      </div>
    </div>
  );
}
