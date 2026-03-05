"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getLocalAuthToken } from "@/auth/localAuth";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refetch: () => { },
});

export const useAppAuth = () => useContext(AuthContext);
/** @deprecated use useAppAuth instead */
export const useSupabaseAuth = useAppAuth;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = getLocalAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.id || "local-user",
          email: data.email || "local@akki.os",
          name: data.name || "Akki",
          image: data.image,
        });
      } else {
        setUser(null);
      }
    } catch {
      // Backend offline — show defaults so app still works
      setUser({ id: "local-user", email: "local@akki.os", name: "Akki" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchUser(); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}