"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { getLocalAuthToken } from "@/auth/localAuth";
import { Users, Server, BarChart3, ShieldAlert } from "lucide-react";

type User = {
    id: string;
    email: string;
    plan?: string;
    created_at: string;
};

type UpgradeCheck = {
    success?: boolean;
    updateAvailable?: boolean;
    manifestVersion?: string;
    installedVersion?: string;
    collisions?: Array<{ kind: string; name?: string }>;
    error?: string;
};

type UpgradeJob = {
    id: string;
    status: string;
    logs: string[];
    error?: string;
};

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [upgradeCheck, setUpgradeCheck] = useState<UpgradeCheck | null>(null);
    const [upgradeJob, setUpgradeJob] = useState<UpgradeJob | null>(null);
    const [upgradeBusy, setUpgradeBusy] = useState(false);

    const fetchUsers = async () => {
        try {
            const token = getLocalAuthToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const checkForUpgrades = async () => {
        setUpgradeBusy(true);
        try {
            const token = getLocalAuthToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/system/upgrade/check`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setUpgradeCheck(data);
        } catch (err: any) {
            setUpgradeCheck({ error: err?.message || "Upgrade check failed" });
        } finally {
            setUpgradeBusy(false);
        }
    };

    const runUpgrade = async () => {
        setUpgradeBusy(true);
        try {
            const token = getLocalAuthToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/system/upgrade/run`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pullLatest: true }),
            });
            const data = await res.json();
            if (data.jobId) {
                await pollUpgradeStatus(data.jobId);
            }
        } catch (err) {
            console.error("Upgrade failed to start", err);
        } finally {
            setUpgradeBusy(false);
        }
    };

    const pollUpgradeStatus = async (jobId: string) => {
        const token = getLocalAuthToken();
        for (let i = 0; i < 120; i += 1) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/system/upgrade/status/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.job) {
                setUpgradeJob(data.job);
                if (data.job.status === "success" || data.job.status === "failed") {
                    break;
                }
            }
            await new Promise((r) => setTimeout(r, 1500));
        }
    };

    return (
        <DashboardShell>
            <DashboardSidebar />
            <main className="flex-1 bg-slate-50 min-h-screen p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                            Admin Control Room <ShieldAlert className="w-8 h-8 text-rose-600" />
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">System-wide monitoring and user management.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Users className="w-5 h-5" /></div>
                                <span className="text-slate-500 font-bold text-xs uppercase">Total Users</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900">{users.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-green-50 rounded-2xl text-green-600"><Server className="w-5 h-5" /></div>
                                <span className="text-slate-500 font-bold text-xs uppercase">System Health</span>
                            </div>
                            <div className="text-3xl font-black text-green-600">HEALTHY</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900">User Directory</h2>
                            <BarChart3 className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="px-8 py-4">User ID</th>
                                        <th className="px-8 py-4">Email</th>
                                        <th className="px-8 py-4">Plan</th>
                                        <th className="px-8 py-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={4} className="px-8 py-6 h-12 bg-slate-50/50" />
                                            </tr>
                                        ))
                                    ) : users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6 font-mono text-[11px] text-slate-400">{user.id}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-900">{user.email}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">
                                                    {user.plan || 'Free'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-4">
                        <h2 className="text-xl font-black text-slate-900">System Upgrade</h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={checkForUpgrades}
                                disabled={upgradeBusy}
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold disabled:opacity-60"
                            >
                                Check for updates
                            </button>
                            <button
                                type="button"
                                onClick={runUpgrade}
                                disabled={upgradeBusy}
                                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-60"
                            >
                                Upgrade now
                            </button>
                        </div>
                        {upgradeCheck && (
                            <div className="text-sm text-slate-700 space-y-1">
                                <div>Installed: <span className="font-mono">{upgradeCheck.installedVersion || "unknown"}</span></div>
                                <div>Latest: <span className="font-mono">{upgradeCheck.manifestVersion || "unknown"}</span></div>
                                <div>Update available: <span className="font-bold">{String(Boolean(upgradeCheck.updateAvailable))}</span></div>
                                {upgradeCheck.collisions && upgradeCheck.collisions.length > 0 ? (
                                    <div className="text-amber-700">Local skill edits detected: {upgradeCheck.collisions.length}</div>
                                ) : null}
                                {upgradeCheck.error ? <div className="text-rose-700">{upgradeCheck.error}</div> : null}
                            </div>
                        )}
                        {upgradeJob && (
                            <div className="border border-slate-200 rounded-2xl p-4">
                                <div className="text-sm font-bold">Job: {upgradeJob.id}</div>
                                <div className="text-sm">Status: {upgradeJob.status}</div>
                                {upgradeJob.error ? <div className="text-sm text-rose-700">{upgradeJob.error}</div> : null}
                                <pre className="mt-3 max-h-64 overflow-auto text-[11px] bg-slate-950 text-slate-100 rounded-xl p-3">
{(upgradeJob.logs || []).join("\n")}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </DashboardShell>
    );
}
