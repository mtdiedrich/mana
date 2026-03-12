import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AuthService } from "./auth-service";
import type { User, AuthResponse } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, displayName: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({
  children,
  authService,
}: {
  children: ReactNode;
  authService: AuthService;
}) {
  const [user, setUser] = useState<User | null>(() => authService.restoreSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      setLoading(true);
      setError(null);
      try {
        const result = await authService.login(email, password);
        if (result.ok) {
          setUser(result.user);
        } else {
          setError(result.error);
        }
        return result;
      } finally {
        setLoading(false);
      }
    },
    [authService],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
      setLoading(true);
      setError(null);
      try {
        const result = await authService.register(email, password, displayName);
        if (result.ok) {
          setUser(result.user);
        } else {
          setError(result.error);
        }
        return result;
      } finally {
        setLoading(false);
      }
    },
    [authService],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, [authService]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
