import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/client";
import { ErrorBanner, TextField, Button } from "../components/ui";

export default function LoginPage() {
  const { login, register, allowRegistration } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (activeTab === "login") {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          setBusy(false);
          return;
        }
        await register(email, password);
      }
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-surface-app text-text-body font-body animate-fade-in">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center flex flex-col items-center">
          <svg className="h-14 w-14 mb-2 flex-shrink-0" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 18 A42 42 0 0 1 60 102 A21 21 0 0 1 60 60 A21 21 0 0 0 60 18 Z" fill="#E07A5F"></path>
            <path d="M60 102 A42 42 0 0 1 60 18 A21 21 0 0 1 60 60 A21 21 0 0 0 60 102 Z" fill="#81B29A"></path>
            <g fill="#FAF7F0" transform="translate(60 39) scale(0.62)">
              <ellipse cx="0" cy="7" rx="9" ry="8"></ellipse><ellipse cx="-10" cy="-2" rx="3.4" ry="4.8"></ellipse>
              <ellipse cx="-3.7" cy="-8.5" rx="3.5" ry="5.2"></ellipse><ellipse cx="3.7" cy="-8.5" rx="3.5" ry="5.2"></ellipse>
              <ellipse cx="10" cy="-2" rx="3.4" ry="4.8"></ellipse>
            </g>
            <g fill="#FAF7F0" transform="translate(60 81) rotate(180) scale(0.62)">
              <ellipse cx="0" cy="7" rx="9" ry="8"></ellipse><ellipse cx="-10" cy="-2" rx="3.4" ry="4.8"></ellipse>
              <ellipse cx="-3.7" cy="-8.5" rx="3.5" ry="5.2"></ellipse><ellipse cx="3.7" cy="-8.5" rx="3.5" ry="5.2"></ellipse>
              <ellipse cx="10" cy="-2" rx="3.4" ry="4.8"></ellipse>
            </g>
          </svg>
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
            {activeTab === "login" ? "Welcome back to KibbleKarma" : "Join KibbleKarma"}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {activeTab === "login"
              ? "Cozy wellness tracking for your sleepy snackers."
              : "Start a cozy log for your furry friends."}
          </p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-4">
          {allowRegistration && (
            <div className="flex border-b border-oat-300 -mx-5 -mt-5 mb-2 overflow-hidden rounded-t-card">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setError("");
                }}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all duration-200 ${
                  activeTab === "login"
                    ? "border-primary text-primary bg-oat-100/30"
                    : "border-transparent text-text-muted hover:bg-oat-200 hover:text-charcoal-900"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setError("");
                }}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all duration-200 ${
                  activeTab === "register"
                    ? "border-primary text-primary bg-oat-100/30"
                    : "border-transparent text-text-muted hover:bg-oat-200 hover:text-charcoal-900"
                }`}
              >
                Create account
              </button>
            </div>
          )}

          <ErrorBanner message={error} />
          
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={activeTab === "register" ? 6 : undefined}
            autoComplete={activeTab === "login" ? "current-password" : "new-password"}
          />

          {activeTab === "register" && (
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          )}
          
          <Button 
            type="submit" 
            loading={busy} 
            fullWidth
          >
            {busy 
              ? (activeTab === "login" ? "Snuggling in..." : "Creating account...") 
              : (activeTab === "login" ? "Sign in" : "Create account")}
          </Button>
          
          {!allowRegistration && (
            <p className="text-center text-xs text-text-muted pt-2 border-t border-oat-300">
              Registration is closed on this instance.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

