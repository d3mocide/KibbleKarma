import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/client";
import { ErrorBanner } from "../components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-5xl">🐾</div>
          <h1 className="mt-2 text-2xl font-extrabold text-teal-deep">
            Welcome back to KibbleKarma
          </h1>
          <p className="text-cocoa/60">Cozy wellness tracking for your sleepy snackers.</p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-4">
          <ErrorBanner message={error} />
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Snuggling in..." : "Sign in"}
          </button>
          <p className="text-center text-sm text-cocoa/60">
            New here?{" "}
            <Link to="/register" className="font-semibold text-teal-deep hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
