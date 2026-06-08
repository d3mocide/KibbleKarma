import type { ReactNode } from "react";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-cocoa/60">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-soft border-t-transparent" />
      {label ?? "Loading..."}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl bg-blush/60 px-4 py-3 text-sm font-semibold text-cocoa">
      {message}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 text-center text-cocoa/70">
      <span className="text-4xl">🐾</span>
      <p className="font-bold text-cocoa">{title}</p>
      {hint && <p className="text-sm">{hint}</p>}
      {action}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-cream p-6 shadow-cozy"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-cocoa">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-cocoa/50 hover:text-cocoa">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const speciesEmoji: Record<string, string> = { dog: "🐶", cat: "🐱", other: "🐾" };
export function speciesIcon(species: string) {
  return speciesEmoji[species] ?? "🐾";
}
