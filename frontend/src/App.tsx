import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Spinner } from "./components/ui";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SetupPage from "./pages/SetupPage";
import PetsListPage from "./pages/PetsListPage";
import PetDashboardPage from "./pages/PetDashboardPage";
import FoodsPage from "./pages/FoodsPage";
import FoodDetailPage from "./pages/FoodDetailPage";
import SettingsPage from "./pages/SettingsPage";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, needsSetup } = useAuth();
  if (loading) return <Spinner label="Waking up..." />;
  if (needsSetup) return <Navigate to="/setup" replace />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, loading, needsSetup, allowRegistration } = useAuth();

  if (loading) return <Spinner label="Waking up..." />;

  return (
    <Routes>
      {/* First-run enrollment: only reachable when the instance has no users. */}
      <Route
        path="/setup"
        element={user ? <Navigate to="/" replace /> : needsSetup ? <SetupPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : needsSetup ? <Navigate to="/setup" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : needsSetup ? (
            <Navigate to="/setup" replace />
          ) : allowRegistration ? (
            <RegisterPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<PetsListPage />} />
        <Route path="/pets/:petId" element={<PetDashboardPage />} />
        <Route path="/foods" element={<FoodsPage />} />
        <Route path="/foods/:foodId" element={<FoodDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
