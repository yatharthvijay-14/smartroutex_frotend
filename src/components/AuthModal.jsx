import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Lock, User, Mail, LogIn, UserPlus, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { AuthBackgrounds, BACKGROUND_VARIANTS } from "./AuthBackgrounds";

function AuthModal({ isOpen, onClose }) {
  const { login, register, loginWithGoogle, registerWithGoogle } = useAuth();
  const [tab, setTab] = useState("register");
  const [activeBgVariant, setActiveBgVariant] = useState("asphalt_grid");

  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("ROLE_USER");

  const [error, setError]         = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading]     = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (tab === "login") {
        await login(username, password);
        setLoading(false);
        onClose();
      } else {
        const res = await register(username, email, password, role);
        setLoading(false);
        setPassword("");
        setTab("login");
        setSuccessMsg(res.message || "Account registered successfully! Please sign in with your credentials.");
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.error || err.message || "Authentication failed. Please check credentials.";
      setError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[5000] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono"
      onClick={onClose}
    >
      <AuthBackgrounds activeVariant={activeBgVariant} />

      {/* Selectable Pill Tabs above Modal Card */}
      <div
        className="relative z-10 flex items-center justify-center gap-2 mb-4 flex-wrap max-w-full"
        onClick={e => e.stopPropagation()}
      >
        {BACKGROUND_VARIANTS.map(v => {
          const isActive = activeBgVariant === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveBgVariant(v.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
              style={
                isActive
                  ? {
                      background: "rgba(212, 160, 23, 0.14)",
                      border: "1px solid #d4a017",
                      color: "#d4a017",
                      boxShadow: "0 0 12px rgba(212, 160, 23, 0.25)"
                    }
                  : {
                      background: "rgba(23, 23, 27, 0.85)",
                      border: "1px solid #2a2a30",
                      color: "#9a988f",
                      backdropFilter: "blur(8px)"
                    }
              }
            >
              {v.label}
            </button>
          );
        })}
      </div>

      <div
        className="relative w-full max-w-md rounded-2xl p-7 sm:p-8 shadow-2xl overflow-hidden transition-all z-10"
        style={{
          background: "#17171b",
          border: "1px solid #d4a017",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 160, 23, 0.15)"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          style={{ background: "#0d0d0f", border: "1px solid #2a2a30", color: "#9a988f" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-4 h-4 rounded-full shrink-0 shadow-md"
            style={{
              background: "#d4a017",
              boxShadow: "0 0 10px 2px rgba(212, 160, 23, 0.6)"
            }}
          />
          <div>
            <h3 className="text-xl font-bold font-heading leading-tight" style={{ color: "#f2f1ec" }}>
              {tab === "login" ? "Sign In to SmartRouteX" : "Join SmartRouteX"}
            </h3>
            <p className="text-xs font-mono mt-0.5" style={{ color: "#9a988f" }}>
              {tab === "login" ? "Sign in to access live telemetry dashboard" : "Register for live route safety & hazard alerts"}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div
          className="flex items-center gap-1.5 p-1 rounded-xl mb-5 font-mono"
          style={{ background: "#0d0d0f", border: "1px solid #2a2a30" }}
        >
          <button
            type="button"
            onClick={() => { setTab("login"); setError(""); setSuccessMsg(""); }}
            className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            style={
              tab === "login"
                ? { background: "rgba(95, 214, 160, 0.18)", color: "#5fd6a0", border: "1px solid #5fd6a0" }
                : { color: "#9a988f", background: "transparent", border: "1px solid transparent" }
            }
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab("register"); setError(""); setSuccessMsg(""); }}
            className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            style={
              tab === "register"
                ? { background: "rgba(95, 214, 160, 0.18)", color: "#5fd6a0", border: "1px solid #5fd6a0" }
                : { color: "#9a988f", background: "transparent", border: "1px solid transparent" }
            }
          >
            <UserPlus className="w-3.5 h-3.5" /> Register
          </button>
        </div>

        {/* Success Callout */}
        {successMsg && (
          <div
            className="p-3 rounded-lg mb-4 flex items-center gap-2 text-xs font-mono font-bold"
            style={{ background: "rgba(95, 214, 160, 0.15)", color: "#5fd6a0", border: "1px dashed #5fd6a0" }}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-[#5fd6a0]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Callout */}
        {error && (
          <div
            className="p-3 rounded-lg mb-4 flex items-center gap-2 text-xs font-mono font-bold"
            style={{ background: "rgba(255, 107, 74, 0.15)", color: "#ff6b4a", border: "1px dashed #ff6b4a" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ff6b4a]" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          {/* Username */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#9a988f" }}>
              Username
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-[#6b6963]" />
              <input
                type="text"
                required
                placeholder="e.g. yatharthvj"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full h-11 rounded-xl pl-9 pr-3.5 text-xs font-mono focus:outline-none transition-all"
                style={{
                  background: "#0d0d0f",
                  border: "1px solid #2a2a30",
                  color: "#f2f1ec"
                }}
              />
            </div>
          </div>

          {/* Email (Registration only) */}
          {tab === "register" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#9a988f" }}>
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-[#6b6963]" />
                <input
                  type="email"
                  required
                  placeholder="e.g. driver@kota.gov.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 rounded-xl pl-9 pr-3.5 text-xs font-mono focus:outline-none transition-all"
                  style={{
                    background: "#0d0d0f",
                    border: "1px solid #2a2a30",
                    color: "#f2f1ec"
                  }}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#9a988f" }}>
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-[#6b6963]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-11 rounded-xl pl-9 pr-3.5 text-xs font-mono focus:outline-none transition-all"
                style={{
                  background: "#0d0d0f",
                  border: "1px solid #2a2a30",
                  color: "#f2f1ec"
                }}
              />
            </div>
          </div>

          {/* Role selection (Registration only) */}
          {tab === "register" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#9a988f" }}>
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("ROLE_USER")}
                  className="p-3 rounded-xl border text-xs font-mono font-bold text-center transition-all cursor-pointer"
                  style={
                    role === "ROLE_USER"
                      ? { background: "rgba(95, 214, 160, 0.18)", color: "#5fd6a0", border: "1px solid #5fd6a0" }
                      : { background: "#0d0d0f", color: "#9a988f", border: "1px solid #2a2a30" }
                  }
                >
                  <span>DRIVER / CITIZEN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ROLE_ADMIN")}
                  className="p-3 rounded-xl border text-xs font-mono font-bold text-center transition-all cursor-pointer"
                  style={
                    role === "ROLE_ADMIN"
                      ? { background: "rgba(212, 160, 23, 0.18)", color: "#d4a017", border: "1px solid #d4a017" }
                      : { background: "#0d0d0f", color: "#9a988f", border: "1px solid #2a2a30" }
                  }
                >
                  <span>Municipal Admin</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-3 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "#5fd6a0",
              color: "#0d0d0f",
              boxShadow: "0 4px 14px rgba(95, 214, 160, 0.3)"
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0d0d0f]" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{tab === "login" ? "Sign In & Launch Dashboard →" : "Create Account & Launch →"}</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-[#2a2a30] flex-1" />
          <span className="text-[10px] font-mono font-bold text-[#6b6963] uppercase">OR</span>
          <div className="h-px bg-[#2a2a30] flex-1" />
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setError("");
            setSuccessMsg("");
            setLoading(true);
            try {
              const { handleGoogleOAuthSignIn } = await import("../services/googleAuth");
              const res = await handleGoogleOAuthSignIn(role, tab);
              if (res && res.email) {
                if (tab === "login") {
                  await loginWithGoogle(res.email, res.name, res.password, role);
                  onClose();
                } else {
                  const regRes = await registerWithGoogle(res.email, res.name, res.password, role);
                  setPassword("");
                  setTab("login");
                  setSuccessMsg(regRes.message || "Google account registered! Please sign in to continue.");
                }
              }
            } catch (err) {
              setError(err.message || "Google authentication failed.");
            } finally {
              setLoading(false);
            }
          }}
          className="w-full h-11 rounded-xl border border-[#2a2a30] hover:border-[#6b6963] bg-[#0d0d0f] hover:bg-[#111114] text-[#f2f1ec] font-mono font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}

export default AuthModal;
