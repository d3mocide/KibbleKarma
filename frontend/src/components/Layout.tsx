import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-full text-sm font-semibold transition ${
      isActive ? "bg-teal-deep text-white" : "text-cocoa/70 hover:bg-sand"
    }`;

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-sand/70 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-teal-deep">
            <span className="text-2xl">🐾</span> Nibbles &amp; Naps
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              My Pets
            </NavLink>
            <NavLink to="/foods" className={navClass}>
              Foods
            </NavLink>
            <button
              onClick={logout}
              className="ml-2 text-sm font-semibold text-cocoa/60 hover:text-cocoa"
              title={user?.email}
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
