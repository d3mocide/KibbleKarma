import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Spinner } from "./components/ui";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PetsListPage from "./pages/PetsListPage";
import PetDashboardPage from "./pages/PetDashboardPage";
import FoodsPage from "./pages/FoodsPage";
import FoodDetailPage from "./pages/FoodDetailPage";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Waking up..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={loading ? <Spinner /> : user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={loading ? <Spinner /> : user ? <Navigate to="/" replace /> : <RegisterPage />}
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
