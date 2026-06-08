import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "../api/endpoints";
import { getToken, setToken } from "../api/client";
import type { User } from "../api/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  needsSetup: boolean;
  allowRegistration: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(false);

  useEffect(() => {
    const token = getToken();
    // Status is public and drives the first-run enrollment gate; `me` only
    // runs when we already hold a token.
    Promise.all([
      authApi
        .status()
        .then((s) => {
          setNeedsSetup(s.needsSetup);
          setAllowRegistration(s.allowRegistration);
        })
        .catch(() => {
          setNeedsSetup(false);
          setAllowRegistration(false);
        }),
      token
        ? authApi
            .me()
            .then((u) => setUser(u))
            .catch(() => setToken(null))
        : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    setToken(token);
    setUser(user);
  };

  const register = async (email: string, password: string) => {
    const { token, user } = await authApi.register(email, password);
    setToken(token);
    setUser(user);
    // Once the first owner exists, setup is complete.
    setNeedsSetup(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, needsSetup, allowRegistration, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
