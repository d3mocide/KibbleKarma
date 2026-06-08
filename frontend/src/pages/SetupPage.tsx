import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/client";
import { ErrorBanner, TextField, Button } from "../components/ui";

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
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">Welcome to KibbleKarma!</h1>
          <p className="text-text-muted text-sm mt-1">
            Let's set up your owner account — this is the first and only account on this
            instance, so make it yours.
          </p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-4">
          <div className="rounded-md bg-sage-100 px-3 py-2 text-sm font-semibold text-sage-700">
            🎉 First-time setup — you're creating the owner account.
          </div>
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
            minLength={6}
            autoComplete="new-password"
          />
          
          <TextField
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
          
          <Button type="submit" loading={busy} fullWidth>
            {busy ? "Setting things up..." : "Create owner account"}
          </Button>
        </form>
      </div>
    </div>
  );
}

