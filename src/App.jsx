import React, { useState, useCallback, createContext, useContext, Component } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import ReportPotholeModal from "./components/ReportPotholeModal";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./context/AuthContext";
import { ToastContainer, useToasts } from "./components/ToastSystem";
import { AlertTriangle, RefreshCw } from "lucide-react";

// ─── React Error Boundary Fallback ────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-4 my-8 shadow-2xl mx-auto max-w-xl"
          style={{
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "var(--text-primary)"
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-rose-500">Component Render Error</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {this.state.error?.message || "An unexpected rendering error occurred."}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-6 py-3 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 transition-all flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> Reset View to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Theme Context ────────────────────────────────────────────────────────────
export const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function MainAppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [theme,               setTheme]               = useState("dark");
  const [activeTab,           setActiveTab]           = useState("dashboard");
  const [searchQuery,         setSearchQuery]         = useState("");
  const [searchLocation,      setSearchLocation]      = useState(null);
  const [isReportModalOpen,   setIsReportModalOpen]   = useState(false);
  const [isAuthModalOpen,     setIsAuthModalOpen]     = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [refreshTrigger,      setRefreshTrigger]      = useState(0);
  // Live Hazard Notification toggle state
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem("smartroutex_notifs") !== "false";
  });

  // Toast system (9.3 real-time alerts)
  const { toasts, addToast, dismiss, dismissAll } = useToasts();

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled(prev => {
      const next = !prev;
      localStorage.setItem("smartroutex_notifs", next ? "true" : "false");
      if (next && "Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission().catch(() => {});
      }
      addToast({
        type: "info",
        title: next ? "Notifications Enabled" : "Notifications Muted",
        message: next
          ? "You will receive live hazard alerts when someone reports a pothole."
          : "Live hazard notification popups muted.",
        timestamp: Date.now()
      });
      return next;
    });
  }, [addToast]);

  const triggerAlert = useCallback((alert) => {
    if (!notificationsEnabled && alert.type !== "info") return;

    addToast(alert);

    // Also trigger browser push notification if permitted
    if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(alert.title || "SmartRouteX Hazard Alert", {
          body: alert.message || "New pothole report on your network",
          icon: "/favicon.ico"
        });
      } catch (_) {}
    }
  }, [notificationsEnabled, addToast]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePotholeReported = useCallback((pothole) => {
    setRefreshTrigger(p => p + 1);
    triggerAlert({
      type: "new_pothole",
      severity: pothole?.severity || "HIGH",
      title: `🚨 New Hazard Reported: ${pothole?.roadName || "Road Corridor"}`,
      message: `Pothole depth ${pothole?.depth || "10 cm"} reported at ${pothole?.latitude?.toFixed(4) || "25.18"}° N, ${pothole?.longitude?.toFixed(4) || "75.84"}° E.`,
      pothole: pothole,
      reportedAt: pothole?.reportedAt || "Just now",
      timestamp: Date.now()
    });
  }, [triggerAlert]);

  // Render loading indicator during session initialization
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-3 select-none">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/50" />
        <p className="text-xs font-extrabold tracking-wide text-slate-300">Initializing SmartRouteX Engine...</p>
      </div>
    );
  }

  // If user is not logged in, render dedicated AuthPage (Login/Signup page)
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        className="min-h-screen font-sans antialiased"
        style={{
          backgroundColor: "var(--bg-base)",
          color: "var(--text-primary)",
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}
      >
        {/* Sidebar (Desktop + Mobile Responsive Drawer) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onOpenReportModal={() => { setIsReportModalOpen(true); setIsMobileSidebarOpen(false); }}
          onOpenAuthModal={() => { setIsAuthModalOpen(true); setIsMobileSidebarOpen(false); }}
        />

        {/* Main content — offset by sidebar width on large screens */}
        <main
          className="lg:ml-72 min-h-screen"
        >
          {/* Sticky top navbar */}
          <div
            className="sticky top-0 z-40 px-4 sm:px-6 pt-5 pb-0"
            style={{ background: "var(--bg-base)", borderBottom: "1px solid transparent" }}
          >
            <Navbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectSearchLocation={(loc) => {
                setSearchLocation(loc);
                setSearchQuery(loc.name);
                setActiveTab("map");
              }}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
              theme={theme}
              toggleTheme={toggleTheme}
              activeTab={activeTab}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={toggleNotifications}
            />
          </div>

          {/* Page content */}
          <div className="px-4 sm:px-6 pb-10">
            <ErrorBoundary key={activeTab} onReset={() => setActiveTab("dashboard")}>
              <Dashboard
                activeTab={activeTab}
                searchQuery={searchQuery}
                searchLocation={searchLocation}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                refreshTrigger={refreshTrigger}
                onAlert={triggerAlert}
              />
            </ErrorBoundary>
          </div>
        </main>

        {/* Report Modal */}
        <ReportPotholeModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onPotholeReported={handlePotholeReported}
        />

        {/* Auth Modal (if triggered while authenticated) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Toast Alerts */}
        <ToastContainer
          toasts={toasts}
          onDismiss={dismiss}
          onDismissAll={dismissAll}
        />
      </div>
    </ThemeContext.Provider>
  );
}

export default MainAppLayout;