import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/client";
import { ErrorBanner } from "../components/ui";

// First-run enrollment: shown only when the backend reports no users yet.
// Creating this account makes you the owner of this KibbleKarma instance.
export default function SetupPage() {
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
          <h1 className="mt-2 text-2xl font-extrabold text-teal-deep">Welcome to KibbleKarma!</h1>
          <p className="text-cocoa/60">
            Let's set up your owner account — this is the first and only account on this
            instance, so make it yours.
          </p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-4">
          <div className="rounded-xl bg-teal-soft/20 px-3 py-2 text-sm font-semibold text-teal-deep">
            🎉 First-time setup — you're creating the owner account.
          </div>
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
            {busy ? "Setting things up..." : "Create owner account"}
          </button>
        </form>
      </div>
    </div>
  );
}
