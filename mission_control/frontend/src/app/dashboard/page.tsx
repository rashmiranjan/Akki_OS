"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedIn, SignedOut, useAuth, useUser } from "@/auth/clerk";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { AgentStatusPanel } from "@/components/dashboard/AgentStatusPanel";
import { DraftPanel } from "@/components/dashboard/DraftPanel";
import { OnboardingFlow } from "@/components/dashboard/OnboardingFlow";
import { Sparkles, LayoutDashboard, Zap, TrendingUp, Brain, FileText, Activity, Loader2 } from "lucide-react";

type Stats = {
  totalDrafts: number;
  approvedDrafts: number;
  pendingDrafts: number;
  totalMemories: number;
  totalActivity: number;
  byAgent?: Record<string, number>;
};

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Step 1: Check onboarding status from server (with localStorage fallback)
  useEffect(() => {
    async function checkOnboarding() {
      // Fast local check first (avoids flash)
      const localDone = localStorage.getItem("akki_onboarding_complete");
      if (localDone) {
        setShowOnboarding(false);
        setIsLoaded(true);
        return;
      }

      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.onboarding?.completed) {
          localStorage.setItem("akki_onboarding_complete", "true");
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      } catch {
        // Network error: default to no onboarding if unsure
        setShowOnboarding(false);
      }
      setIsLoaded(true);
    }
    checkOnboarding();
  }, []);

  // Step 2: Fetch real stats from backend
  useEffect(() => {
    async function fetchStats() {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/memory/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch {
        // Silently fail â€” stats are non-critical
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleOnboardingComplete = async (context?: any) => {
    try {
      const token = await getToken();
      // Persist onboarding to server
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ context: context || {} }),
      });
    } catch {
      // best-effort
    }
    localStorage.setItem("akki_onboarding_complete", "true");
    setShowOnboarding(false);
  };

  const [userName, setUserName] = useState("there");
  useEffect(() => {
    getToken().then(token =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).then(d => {
        if (d.name) setUserName(d.name.split(" ")[0]);
      }).catch(() => {})
    );
  }, []);
  const firstName = userName;

  if (!isLoaded) return null;

  const statCards = [
    {
      label: "Drafts Generated",
      value: statsLoading ? null : (stats?.totalDrafts ?? 0),
      sub: statsLoading ? null : `${stats?.pendingDrafts ?? 0} pending approval`,
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Memories Stored",
      value: statsLoading ? null : (stats?.totalMemories ?? 0),
      sub: "Permanent graph memory",
      icon: Brain,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Agent Actions",
      value: statsLoading ? null : (stats?.totalActivity ?? 0),
      sub: "Total activity logged",
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <DashboardShell>
      <SignedOut>
        <SignedOutPanel
          message="Sign in to access Akki OS."
          forceRedirectUrl="/login"
        />
      </SignedOut>

      <SignedIn>
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          {showOnboarding ? (
            <div className="flex items-center justify-center min-h-[80vh]">
              <OnboardingFlow onComplete={handleOnboardingComplete} />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                    Welcome back, {firstName} <Sparkles className="w-6 h-6 text-indigo-600" />
                  </h1>
                  <p className="text-slate-500 mt-1">Your Personal Branding OS is active and learning.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    System Online
                  </div>
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
                    Generate New Ideas
                  </button>
                </div>
              </div>

              {/* Real Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-xl ${card.bg}`}>
                        <card.icon className={`w-4 h-4 ${card.color}`} />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      {card.value === null ? (
                        <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                      ) : (
                        <h3 className="text-3xl font-black text-slate-900">{card.value.toLocaleString()}</h3>
                      )}
                    </div>
                    {card.sub && (
                      <p className="text-slate-400 text-xs mt-1 font-medium">{card.sub}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Areas */}
                <div className="lg:col-span-2 space-y-8">
                  <AgentStatusPanel />
                  <DraftPanel />
                </div>

                {/* Sidebar Areas */}
                <div className="space-y-8">
                  <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-2">Akki is Ready</h3>
                      <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                        Your agents are standing by. Trigger Fury for research or Loki to generate posts.
                      </p>
                      <button
                        onClick={() => window.location.href = "/agents"}
                        className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all"
                      >
                        Go to Agent Cabinet
                      </button>
                    </div>
                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                      Memory Overview
                    </h3>
                    {statsLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[
                          { label: 'User Profile', stored: (stats?.byAgent?.['jarvis'] ?? 0) > 0 },
                          { label: 'Pain Points', stored: (stats?.byAgent?.['jarvis'] ?? 0) > 1 },
                          { label: 'Voice Profile', stored: (stats?.byAgent?.['loki'] ?? 0) > 0 },
                          { label: 'Post Drafts', stored: (stats?.approvedDrafts ?? 0) > 0 },
                          { label: 'Activity Log', stored: (stats?.totalActivity ?? 0) > 0 },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                            <div className={`w-2 h-2 rounded-full ${item.stored ? 'bg-green-500' : 'bg-slate-200'}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </SignedIn>
    </DashboardShell>
  );
}




