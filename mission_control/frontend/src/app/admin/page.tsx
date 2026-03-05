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

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                </div>
            </main>
        </DashboardShell>
    );
}
