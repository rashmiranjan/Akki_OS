"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, useAuth } from "@/auth/clerk";
import { BrandMark } from "@/components/atoms/BrandMark";
import { UserMenu } from "@/components/organisms/UserMenu";
import { getLocalAuthToken } from "@/auth/localAuth";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isSignedIn, isLoaded, pathname, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isSignedIn) {
        const token = getLocalAuthToken();
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          setProfile(data);
        } catch (err) {
          console.error("Failed to fetch profile", err);
        }
      }
    };
    fetchProfile();
  }, [isSignedIn]);

  const displayName = profile?.name || "Operator";
  const displayEmail = profile?.email || "";

  return (
    <div className="min-h-screen bg-app text-strong">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-8">
            <BrandMark />
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-sm font-bold text-indigo-600">Home</a>
              <a href="/strategy" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Strategy</a>
              <a href="/content" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Content</a>
            </nav>
          </div>

          <SignedIn>
            <div className="flex items-center gap-4">
              <div className="hidden text-right lg:block">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                  {displayName}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active OS</p>
                </div>
              </div>
              <UserMenu displayName={displayName} displayEmail={displayEmail} />
            </div>
          </SignedIn>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-73px)]">
        {children}
      </div>
    </div>
  );
}

