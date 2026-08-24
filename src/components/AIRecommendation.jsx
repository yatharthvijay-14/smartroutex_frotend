import React, { useMemo } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Star, Sparkles } from "lucide-react";

function AIRecommendation({ roads = [], onSelectRoute, onSelectRoad }) {
  const analysis = useMemo(() => {
    if (!roads || roads.length === 0) {
      return {
        recommended: [{ id: 1, name: "Talwandi Road", rating: 4.8 }, { id: 2, name: "Mahaveer Nagar Road", rating: 4.2 }],
        caution:     [{ id: 3, name: "Aerodrome Circle Road", rating: 3.5 }, { id: 4, name: "Nayapura Road", rating: 3.5 }],
        avoid:       [{ id: 5, name: "Jhalawar Road", rating: 1.8 }, { id: 6, name: "Rajeev Gandhi Nagar Road", rating: 1.5 }]
      };
    }
    return {
      recommended: roads.filter(r => r.status === "LOW"  || r.rating >= 4.0),
      caution:     roads.filter(r => r.status === "MEDIUM" || (r.rating >= 3.0 && r.rating < 4.0)),
      avoid:       roads.filter(r => r.status === "HIGH" || r.rating < 3.0)
    };
  }, [roads]);

  const Section = ({ icon: Icon, label, items, badgeClass, listType }) => (
    <div>
      <h3 className="text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "var(--ink)" }}>
        <Icon className="w-4 h-4 text-emerald-400" /> {label}
      </h3>
      <ul className="space-y-2">
        {items.length > 0 ? items.map(road => (
          <li
            key={`${listType}-${road.id || road.name}`}
            onClick={() => onSelectRoad && onSelectRoad(road)}
            className="text-xs font-mono font-medium flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all hover:bg-white/[0.03]"
            style={{
              background: "var(--surface-sunken)",
              border: "1px solid var(--line)"
            }}
          >
            <div className="flex items-center gap-2 truncate">
              <span className={listType === "recommended" ? "dot-glow-safe" : listType === "caution" ? "dot-glow-warn" : "dot-glow-critical"} />
              <span className={`truncate ${listType === "avoid" ? "line-through opacity-70 text-rose-400" : "text-slate-200"}`}>{road.name}</span>
            </div>

            {listType !== "avoid" ? (
              <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-amber-400 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {road.rating ? Number(road.rating).toFixed(1) : "4.0"}
              </span>
            ) : (
              <span className="badge-dashed-critical text-[9px] py-0 px-1.5 shrink-0">
                Avoid
              </span>
            )}
          </li>
        )) : (
          <li className="text-xs font-mono italic" style={{ color: "var(--ink-soft)" }}>None at this time</li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="asphalt-card p-5 flex flex-col h-full">
      <h2 className="text-base font-bold font-heading flex items-center pb-3 mb-4" style={{ color: "var(--ink)", borderBottom: "1px solid var(--line)" }}>
        <span className="section-dot" />
        AI Route Recommendations
      </h2>

      <div className="space-y-4 flex-1 overflow-y-auto max-h-[420px]">
        <Section icon={CheckCircle2} label="Recommended Routes"  items={analysis.recommended} badgeClass="badge-dashed-safe" listType="recommended" />
        {analysis.caution.length > 0 && (
          <Section icon={AlertCircle} label="Use Carefully"        items={analysis.caution}     badgeClass="badge-dashed-warn" listType="caution" />
        )}
        <Section icon={AlertTriangle} label="Avoid These Corridors" items={analysis.avoid}        badgeClass="badge-dashed-critical" listType="avoid" />
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--line)" }}>
        <span className="text-[10px] font-mono" style={{ color: "var(--ink-soft)" }}>AI Route Classification v4.2</span>
        <button
          onClick={() => onSelectRoute && onSelectRoute(analysis)}
          className="btn-asphalt-primary flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Highlight AI Route
        </button>
      </div>
    </div>
  );
}

export default AIRecommendation;