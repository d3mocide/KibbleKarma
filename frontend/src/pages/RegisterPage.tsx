import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/client";
import { ErrorBanner } from "../components/ui";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      await register(email, password);
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
          <h1 className="mt-2 text-2xl font-extrabold text-teal-deep">Join KibbleKarma</h1>
          <p className="text-cocoa/60">Start a cozy log for your furry friends.</p>
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
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Creating..." : "Create account"}
          </button>
          <p className="text-center text-sm text-cocoa/60">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-teal-deep hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
