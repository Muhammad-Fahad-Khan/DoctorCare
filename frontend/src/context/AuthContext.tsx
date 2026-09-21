import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, AuthUser, getToken, setToken, clearToken } from '../lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (body: {
    email: string;
    password: string;
    fullName: string;
    role: 'PATIENT' | 'DOCTOR';
    specialty?: string;
    licenseNumber?: string;
  }) => Promise<{ pendingApproval: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    // Verify the stored token is still valid (and the account not since suspended/deleted)
    // rather than trusting it blindly.
    api
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login({ email, password });
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }

  async function register(body: Parameters<AuthContextValue['register']>[0]) {
    const res = await api.register(body);
    if ('accessToken' in res) {
      setToken(res.accessToken);
      setUser(res.user);
      return { pendingApproval: false };
    }
    // Doctor registrations don't get a token until an admin approves them.
    return { pendingApproval: true, message: res.message };
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
