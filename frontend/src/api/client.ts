import axios from "axios";

const TOKEN_KEY = "kibblekarma_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize backend error shape { error: { message } } into a thrown Error.
export function apiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.error?.message ??
      err.response?.data?.message ??
      err.message ??
      "Something went wrong"
    );
  }
  return err instanceof Error ? err.message : "Something went wrong";
}
