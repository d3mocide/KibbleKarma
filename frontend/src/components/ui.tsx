import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { 
  Loader2, 
  Dog, 
  Cat, 
  Rabbit, 
  PawPrint, 
  X,
  ChevronDown,
  Bone,
  Scale,
  NotebookPen,
  AlertTriangle
} from "lucide-react";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-charcoal-500">
      <Loader2 className="h-5 w-5 animate-spin text-terracotta-500" />
      <span>{label ?? "Fetching the cuddles..."}</span>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-md bg-terracotta-50 border border-terracotta-200 px-4 py-3 text-sm font-semibold text-alert flex items-start gap-2">
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-alert" />
      <span>{message}</span>
    </div>
  );
}

export function Card({ 
  children, 
  interactive = false, 
  className = "",
  onClick
}: { 
  children: ReactNode; 
  interactive?: boolean; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      className={`${interactive ? "card-interactive" : "card"} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function Chip({ 
  children, 
  tone = "neutral", 
  className = "" 
}: { 
  children: ReactNode; 
  tone?: "neutral" | "sage" | "terracotta" | "butter" | "alert"; 
  className?: string;
}) {
  const toneClasses = {
    neutral: "chip-neutral",
    sage: "chip-sage",
    terracotta: "chip-terracotta",
    butter: "chip-butter",
    alert: "chip-alert",
  };
  return (
    <span className={`${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Avatar({ 
  species, 
  tone = "sand", 
  size = 56,
  className = ""
}: { 
  species: string; 
  tone?: "sand" | "sage" | "terracotta" | "butter"; 
  size?: number;
  className?: string;
}) {
  const toneClasses = {
    sand: "bg-oat-200 text-charcoal-700",
    sage: "bg-sage-100 text-sage-700",
    terracotta: "bg-terracotta-100 text-terracotta-600",
    butter: "bg-butter-200 text-butter-600",
  };
  
  const iconClass = size <= 40 ? "h-5 w-5" : "h-6 w-6";
  
  const renderIcon = () => {
    switch (species.toLowerCase()) {
      case "dog":
        return <Dog className={iconClass} />;
      case "cat":
        return <Cat className={iconClass} />;
      case "rabbit":
        return <Rabbit className={iconClass} />;
      default:
        return <PawPrint className={iconClass} />;
    }
  };

  return (
    <div 
      className={`inline-grid place-items-center rounded-pill ${toneClasses[tone]} ${className}`}
      style={{ width: size, height: size }}
    >
      {renderIcon()}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
  };
  const sizeClasses = {
    sm: "btn-sm",
    md: "btn",
  };
  return (
    <button
      type={type}
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function TextField({
  label,
  hint,
  error,
  className = "",
  ...props
}: {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="label">{label}</label>}
      <input className="input" {...props} />
      {error && <p className="mt-1 text-xs font-semibold text-alert">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  error,
  children,
  className = "",
  ...props
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <select className="input appearance-none pr-10" {...props}>
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-alert">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function StatMeter({
  value,
  max,
}: {
  value: number;
  max: number | null;
}) {
  const percentage = max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const isOver = max ? value > max : false;
  
  return (
    <div className="w-full">
      <div className="h-3.5 w-full rounded-pill bg-oat-200 overflow-hidden">
        <div
          className={`h-full rounded-pill transition-all duration-300 ${
            isOver ? "bg-alert" : "bg-sage-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
  icon = "paw"
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  icon?: "paw" | "bone" | "search";
}) {
  return (
    <div className="card flex flex-col items-center gap-4 text-center p-8 max-w-sm mx-auto">
      <div className="inline-grid place-items-center w-14 h-14 rounded-pill bg-oat-200 text-charcoal-500">
        {icon === "search" ? (
          <Scale className="h-6 w-6 text-charcoal-500" />
        ) : icon === "bone" ? (
          <Bone className="h-6 w-6 text-charcoal-500" />
        ) : (
          <PawPrint className="h-6 w-6 text-charcoal-500" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-extrabold text-charcoal-900 text-lg">{title}</h3>
        {hint && <p className="text-sm text-text-muted leading-relaxed">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

import { createPortal } from "react-dom";

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
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-card bg-oat-100 p-6 shadow-cozy-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-charcoal-900">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-pill hover:bg-oat-200 text-charcoal-500 hover:text-charcoal-900 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function speciesIcon(species: string) {
  switch (species.toLowerCase()) {
    case "dog":
      return "🐶";
    case "cat":
      return "🐱";
    case "rabbit":
      return "🐰";
    default:
      return "🐾";
  }
}

