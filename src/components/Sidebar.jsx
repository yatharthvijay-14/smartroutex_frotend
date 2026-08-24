import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Map, AlertOctagon, BarChart3,
  Bot, Plus, ShieldCheck, ClipboardList, LogIn, LogOut, X
} from "lucide-react";

const MENU_GROUPS = [
  {
    title: "NAVIGATION & CONTROL",
    items: [
      { id: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
      { id: "map",       label: "Live GIS Map",        icon: Map,             badge: "LIVE" }
    ]
  },
  {
    title: "HAZARDS & REPAIRS",
    items: [
      { id: "potholes",  label: "Pothole Hazard Alerts", icon: AlertOctagon },
      { id: "myreports", label: "My Submitted Reports",  icon: ClipboardList }
    ]
  },
  {
    title: "INTELLIGENCE & AI",
    items: [
      { id: "analytics", label: "Telemetry Analytics",   icon: BarChart3 },
      { id: "assistant", label: "AI Safety Assistant",   icon: Bot,             badge: "AI" }
    ]
  }
];

function Sidebar({ activeTab, setActiveTab, isOpen, onClose, onOpenReportModal, onOpenAuthModal }) {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  return (
    <>
      {/* Mobile Dark Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`w-72 h-screen fixed left-0 top-0 flex flex-col z-50 select-none shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "var(--panel)",
          borderRight: "1px solid var(--panel-border)"
        }}
      >
        {/* Brand Header */}
        <div
          className="flex items-center justify-between px-6 py-6"
          style={{ borderBottom: "1px solid var(--panel-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shrink-0 shadow-md"
              style={{ background: "var(--accent)" }}
            />
            <div>
              <h2 className="text-xl font-bold font-heading leading-none" style={{ color: "var(--text-primary)" }}>
                SmartRouteX
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest mt-1" style={{ color: "var(--text-secondary)" }}>
                POTHOLE TELEMETRY &amp; ROUTE ENGINE
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary CTA: Report Pothole */}
        <div className="px-6 pt-5 pb-3">
          <button
            onClick={onOpenReportModal}
            className="btn-asphalt-primary w-full py-3 px-4 flex items-center justify-center gap-2 group text-xs font-mono font-bold"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Report New Hazard</span>
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-5 overflow-y-auto">
          {MENU_GROUPS.map((group, gIdx) => (
            <div key={`group-${gIdx}`} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {group.title}
              </div>
              {group.items.map(({ id, label, icon: Icon, badge }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono font-medium transition-all text-left cursor-pointer"
                    style={{
                      color: isActive ? "var(--safe)" : "var(--text-primary)",
                      background: isActive ? "var(--safe-bg)" : "transparent",
                      borderLeft: isActive ? "3px solid var(--safe)" : "3px solid transparent"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: isActive ? "var(--safe)" : "var(--text-secondary)" }}
                      />
                      <span>{label}</span>
                    </div>
                    {badge && (
                      <span className="badge-dashed-safe text-[9px] py-0 px-1.5">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Auth & User Profile Footer */}
        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid var(--panel-border)" }}
        >
          {isAuthenticated ? (
            <div
              className="rounded-xl p-3 flex items-center justify-between gap-2 font-mono"
              style={{ background: "var(--surface-sunken)", border: "1px solid var(--panel-border)" }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--safe-bg)", color: "var(--safe)", border: "1px solid var(--safe-border)" }}
                >
                  {user.username ? user.username.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                    {user.username}
                  </p>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {isAdmin ? "ADMIN" : "USER"}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: "var(--risk)" }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn-asphalt-secondary w-full py-2.5 flex items-center justify-center gap-2 font-mono text-xs font-bold"
            >
              <LogIn className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;