import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, authStorage, type ApiUser } from "./api";

interface AuthContextType {
  user: ApiUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  register: (fullName: string, email: string, password: string, departmentIds: string[]) => Promise<ApiUser>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(() => authStorage.getUser());
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMe = async () => {
    const currentToken = authStorage.getToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      if (data?.user) {
        setUser(data.user);
        setToken(currentToken);
      }
    } catch {
      authStorage.clear();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email: string, password: string): Promise<ApiUser> => {
    const res = await api.auth.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    return res.user;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    departmentIds: string[]
  ): Promise<ApiUser> => {
    const res = await api.auth.register({ fullName, email, password, departmentIds });
    setUser(res.user);
    setToken(res.token);
    return res.user;
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isStudent = user?.role === "STUDENT";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isStudent,
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

