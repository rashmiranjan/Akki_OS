"use client";

import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedIn, SignedOut, useAuth } from "@/auth/clerk";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { Activity } from "lucide-react";

export default function ActivityPage() {
  const { isSignedIn } = useAuth();

  return (
    <DashboardShell>
      <SignedOut>
        <SignedOutPanel message="Sign in to view live feed." forceRedirectUrl="/login" />
      </SignedOut>

      <SignedIn>
        <DashboardSidebar />
        <main className="flex-1 bg-slate-50 min-h-screen p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                  Live Feed <Activity className="w-6 h-6 text-indigo-600 animate-pulse" />
                </h1>
                <p className="text-slate-500 mt-1">Real-time logs of your autonomous agents in action.</p>
              </div>
            </div>

            <ActivityFeed />
          </div>
        </main>
      </SignedIn>
    </DashboardShell>
  );
}
