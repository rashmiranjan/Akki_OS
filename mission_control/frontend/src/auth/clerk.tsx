"use client";
/**
 * auth/clerk.tsx — Gateway Token auth shim.
 * Exports all the same names as the old Clerk package so existing components
 * don't need to change their imports.
 */
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLocalAuthToken, clearLocalAuthToken } from "@/auth/localAuth";
import { useAppAuth } from "@/components/providers/AuthProvider";

// ─── Clerk feature flag (always false — we don't use Clerk) ──────────────────
export const isClerkEnabled = () => false;

// ─── useAuth — isSignedIn, isLoaded, getToken, signOut ───────────────────────
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setToken(getLocalAuthToken());
    setIsLoaded(true);
  }, []);

  return {
    isSignedIn: !!token,
    isLoaded,
    getToken: async () => getLocalAuthToken(),
    signOut: async () => {
      clearLocalAuthToken();
      window.location.href = "/login";
    },
  };
}

// ─── useUser — Clerk-compatible user shape ────────────────────────────────────
export function useUser() {
  const { user, loading } = useAppAuth();
  const { isSignedIn } = useAuth();

  return {
    isLoaded: !loading,
    isSignedIn,
    user: user
      ? {
        id: user.id,
        firstName: user.name?.split(" ")[0] || "Akki",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        fullName: user.name || "Akki",
        username: user.email?.split("@")[0] || "akki",
        emailAddresses: [{ emailAddress: user.email }],
        primaryEmailAddress: { emailAddress: user.email },
        imageUrl: user.image || null,
      }
      : null,
  };
}

// ─── SignedIn / SignedOut wrappers ────────────────────────────────────────────
export function SignedIn({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}

// ─── SignInButton — redirects to /login ───────────────────────────────────────
export function SignInButton(props: any) {
  const router = useRouter();
  return (
    <button onClick={() => router.push("/login")}>
      {props.children ?? "Sign In"}
    </button>
  );
}

// ─── SignOutButton ────────────────────────────────────────────────────────────
export function SignOutButton(props: any) {
  return (
    <button onClick={() => { clearLocalAuthToken(); window.location.href = "/login"; }}>
      {props.children ?? "Sign Out"}
    </button>
  );
}

// ─── UserButton (avatar) ─────────────────────────────────────────────────────
export function UserButton() {
  const { user } = useAppAuth();
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AK";
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
      {initials}
    </div>
  );
}

// ─── RedirectToLogin ──────────────────────────────────────────────────────────
export function RedirectToLogin() {
  const router = useRouter();
  useEffect(() => { router.replace("/login"); }, [router]);
  return null;
}
