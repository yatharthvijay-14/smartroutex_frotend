import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { searchPhoton } from "../services/geocodingService";
import {
  Search, X, Menu, MapPin, Navigation, Loader2, Route, Building2, Map,
  BellOff, Sun, Moon
} from "lucide-react";

// Static local road database (instant prefix search)
const LOCAL_ROADS_DB = [
  { id: "l1",  name: "Talwandi Main Road",       displayName: "Talwandi, Kota, Rajasthan",       lat: 25.1510, lng: 75.8420, type: "road" },
  { id: "l2",  name: "Talwandi Bypass",           displayName: "Talwandi Bypass, Kota, Raj.",      lat: 25.1480, lng: 75.8390, type: "road" },
  { id: "l3",  name: "Jhalawar Road",             displayName: "Jhalawar Road, Kota, Rajasthan",   lat: 25.2070, lng: 75.8680, type: "road" },
  { id: "l4",  name: "DC Mill Road",              displayName: "DC Mill Area, Kota, Rajasthan",    lat: 25.1800, lng: 75.8340, type: "road" },
  { id: "l5",  name: "Vigyan Nagar Road",         displayName: "Vigyan Nagar, Kota, Rajasthan",    lat: 25.1650, lng: 75.8480, type: "road" },
  { id: "l6",  name: "Mahaveer Nagar Road",       displayName: "Mahaveer Nagar, Kota, Raj.",       lat: 25.1720, lng: 75.8310, type: "road" },
  { id: "l7",  name: "Dadabari Road",             displayName: "Dadabari, Kota, Rajasthan",        lat: 25.1900, lng: 75.8450, type: "road" },
  { id: "l8",  name: "Rangpur Road",              displayName: "Rangpur, Kota, Rajasthan",         lat: 25.1560, lng: 75.8270, type: "road" },
  { id: "l9",  name: "Aerodrome Circle Road",     displayName: "Aerodrome, Kota, Rajasthan",       lat: 25.1680, lng: 75.8520, type: "road" },
  { id: "l10", name: "Nayapura Road",             displayName: "Nayapura, Kota, Rajasthan",        lat: 25.1750, lng: 75.8400, type: "road" },
  { id: "l11", name: "Gumanpura Road",            displayName: "Gumanpura, Kota, Rajasthan",       lat: 25.1820, lng: 75.8360, type: "road" },
  { id: "l12", name: "Borkheda Road",             displayName: "Borkheda, Kota, Rajasthan",        lat: 25.1950, lng: 75.8560, type: "road" },
  { id: "l13", name: "Swami Vivekanand Nagar",    displayName: "SV Nagar, Kota, Rajasthan",        lat: 25.1640, lng: 75.8350, type: "area" },
  { id: "l14", name: "Kota City Center",          displayName: "Central Business District, Kota",  lat: 25.1800, lng: 75.8390, type: "city" },
  { id: "l15", name: "Rawatbhata Road",           displayName: "Rawatbhata, Kota, Rajasthan",      lat: 25.0880, lng: 75.6000, type: "road" }
];

const TYPE_ICON_MAP = {
  road: Route,
  area: Building2,
  city: Map,
  junction: MapPin,
  default: MapPin
};

function SuggestionItem({ item, isActive, onSelect }) {
  const Icon = TYPE_ICON_MAP[item.type] || TYPE_ICON_MAP.default;
  return (
    <div
      onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
        isActive ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "var(--safe-bg)", border: "1px solid var(--safe-border)" }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: "var(--safe)" }} />
      </div>
      <div className="min-w-0 flex-1 font-mono">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold font-heading truncate"
            style={{ color: isActive ? "var(--safe)" : "var(--text-primary)" }}
          >
            {item.name}
          </span>
          {item.isLocal && (
            <span className="badge-dashed-safe text-[9px] py-0 px-1.5 shrink-0">
              Local
            </span>
          )}
        </div>
        <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {item.displayName}
        </p>
      </div>
      <Navigation className="w-3.5 h-3.5 shrink-0 mt-1 opacity-60" style={{ color: "var(--safe)" }} />
    </div>
  );
}

function Navbar({
  searchQuery,
  setSearchQuery,
  onSelectSearchLocation,
  onOpenReportModal,
  onToggleMobileSidebar,
  theme = "dark",
  toggleTheme,
  activeTab = "dashboard",
  notificationsEnabled = true,
  onToggleNotifications
}) {
  const { isAuthenticated, logout } = useAuth();
  const [suggestions,     setSuggestions]     = useState([]);
  const [isSearching,     setIsSearching]     = useState(false);
  const [isDropdownOpen,  setIsDropdownOpen]  = useState(false);
  const [activeIndex,     setActiveIndex]     = useState(-1);
  const inputRef   = useRef(null);
  const containerRef = useRef(null);
  const timerRef   = useRef(null);

  const TAB_LABELS = {
    dashboard: "OVERVIEW DASHBOARD",
    map: "LIVE GIS MAP",
    potholes: "POTHOLE HAZARD ALERTS",
    myreports: "MY SUBMITTED REPORTS",
    analytics: "TELEMETRY ANALYTICS",
    assistant: "AI SAFETY ASSISTANT"
  };

  useEffect(() => {
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const runSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const lower = trimmed.toLowerCase();
    const localMatches = LOCAL_ROADS_DB
      .filter(r => r.name.toLowerCase().includes(lower))
      .slice(0, 5)
      .map(r => ({ ...r, isLocal: true }));

    setSuggestions(localMatches);
    setIsDropdownOpen(true);
    setActiveIndex(-1);

    clearTimeout(timerRef.current);
    setIsSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const photonResults = await searchPhoton(trimmed);
        setSuggestions(() => {
          const combined = [...localMatches];
          photonResults.forEach(item => {
            const isDupe = combined.some(
              c => c.name.toLowerCase() === item.name.toLowerCase()
            );
            if (!isDupe) combined.push(item);
          });
          return combined.slice(0, 8);
        });
      } catch (_) {
      } finally {
        setIsSearching(false);
      }
    }, 200);
  }, []);

  useEffect(() => {
    runSearch(searchQuery || "");
  }, [searchQuery, runSearch]);

  const handleSelect = useCallback((item) => {
    setSearchQuery(item.name);
    setIsDropdownOpen(false);
    setActiveIndex(-1);
    if (onSelectSearchLocation) {
      onSelectSearchLocation({
        name: item.name,
        displayName: item.displayName || item.name,
        lat: item.lat,
        lng: item.lng
      });
    }
  }, [setSearchQuery, onSelectSearchLocation]);

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      if (target) handleSelect(target);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  return (
    <header className="w-full mb-6 font-mono relative z-30">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Left: Brand Dot + Title Stack */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg transition-all cursor-pointer shrink-0"
            style={{ background: "var(--surface-sunken)", border: "1px solid var(--panel-border)", color: "var(--text-primary)" }}
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" style={{ color: "var(--accent)" }} />
          </button>

          {/* Brand Dot Core */}
          <div
            className="w-5 h-5 rounded-full shrink-0"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 10px 2px rgba(212, 160, 23, 0.4)"
            }}
          />

          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest leading-none mb-1" style={{ color: "var(--text-secondary)" }}>
              AI TELEMETRY &amp; SAFETY
            </span>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-heading leading-none" style={{ color: "var(--text-primary)" }}>
                SmartRouteX
              </h1>
              <span className="badge-dashed-safe text-[9px] py-0.5 px-2.5 rounded-full font-mono font-bold tracking-wide">
                {TAB_LABELS[activeTab] || "OVERVIEW DASHBOARD"}
              </span>
            </div>
            <p className="text-xs font-mono mt-1 leading-none" style={{ color: "var(--text-secondary)" }}>
              Pothole telemetry · Route safety engine · Risk scoring
            </p>
          </div>
        </div>

        {/* Right: Single Uniform-Height Control Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap lg:flex-nowrap justify-start lg:justify-end">

          {/* Search Input */}
          <div className="relative" ref={containerRef}>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none z-10"
              style={{ color: "var(--text-secondary)" }}
            />

            <input
              ref={inputRef}
              type="text"
              placeholder="Search road, area, city…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery?.trim().length >= 1 && setIsDropdownOpen(true)}
              autoComplete="off"
              className="pl-9 pr-8 h-9 text-xs font-mono rounded-lg w-52 sm:w-60 transition-all focus:outline-none"
              style={{
                background: "var(--surface-sunken)",
                border: "1px solid var(--panel-border)",
                color: "var(--text-primary)"
              }}
            />

            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--safe)" }} />
              ) : searchQuery ? (
                <button onClick={clearSearch} className="cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            {/* Search Dropdown */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 rounded-xl shadow-2xl overflow-hidden z-50 p-2"
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--panel-border)",
                  minWidth: "300px"
                }}
              >
                <div className="p-1 space-y-0.5 max-h-72 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <SuggestionItem
                      key={item.id}
                      item={item}
                      isActive={idx === activeIndex}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alerts ON Toggle Button */}
          <button
            onClick={onToggleNotifications}
            className="h-9 px-3.5 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            style={{
              background: "var(--panel)",
              border: `1px solid ${notificationsEnabled ? "var(--safe-border)" : "var(--panel-border)"}`,
              color: notificationsEnabled ? "var(--safe)" : "var(--text-secondary)"
            }}
            title={notificationsEnabled ? "Alerts ON (Mute)" : "Alerts OFF (Enable)"}
          >
            {notificationsEnabled ? (
              <>
                <span className="dot-glow-safe" />
                <span>Alerts ON</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5" style={{ color: "var(--text-faint)" }} />
                <span>Alerts OFF</span>
              </>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="h-9 px-3.5 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--panel-border)",
              color: "var(--text-primary)"
            }}
            title={`Switch theme (Current: ${theme === "light" ? "Daylight Asphalt" : "Asphalt Night"})`}
          >
            {theme === "light" ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-600" />
                <span>Asphalt Night</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Daylight Asphalt</span>
              </>
            )}
          </button>

          {/* Report Hazard CTA Button */}
          <button
            onClick={onOpenReportModal}
            className="h-9 px-4 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 text-white"
            style={{
              background: "var(--safe)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
            }}
          >
            <span>🚨</span> Report Hazard
          </button>
        </div>
      </div>

      {/* Full width Amber Accent Rule Line spanning bottom of Header */}
      <div
        className="w-full h-[2px] mt-4 rounded-full"
        style={{ background: "var(--accent-line)" }}
      />
    </header>
  );
}

export default Navbar;