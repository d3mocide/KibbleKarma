import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-2.5 py-1.5 sm:px-4 rounded-pill text-xs sm:text-sm font-bold transition-all duration-200 ${
      isActive ? "bg-primary text-text-on-primary" : "text-text-muted hover:bg-oat-200 hover:text-charcoal-900"
    }`;

  return (
    <div className="min-h-full bg-surface-app text-text-body font-body">
      <header className="sticky top-0 z-40 border-b border-oat-300 bg-oat-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <svg className="h-8 w-8 flex-shrink-0" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
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
            <span className="font-display font-semibold text-base sm:text-xl text-charcoal-900 tracking-tight">
              <span className="text-terracotta-500">Kibble</span>Karma
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" end className={navClass}>
              buddies
            </NavLink>
            <NavLink to="/foods" className={navClass}>
              foods
            </NavLink>
            <button
              onClick={logout}
              className="ml-2 sm:ml-3 text-xs sm:text-sm font-bold text-text-muted hover:text-charcoal-900 transition whitespace-nowrap"
              title={user?.email}
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

