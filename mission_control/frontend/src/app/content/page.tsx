"use client";
import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedIn, SignedOut, useAuth } from "@/auth/clerk";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { FileText, Search, Sparkles, RefreshCw, CheckCircle, Clock, XCircle, X } from "lucide-react";

export default function ContentLibraryPage() {
    const { getToken } = useAuth();
    const [isTriggering, setIsTriggering] = useState(false);
    const [message, setMessage] = useState("");
    const [drafts, setDrafts] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedDraft, setSelectedDraft] = useState<any>(null);

    useEffect(() => {
        fetchDrafts();
        const interval = setInterval(fetchDrafts, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchDrafts = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/drafts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const raw = data.drafts || data.items || [];
                setDrafts(raw.map((d: any) => ({
                    ...d,
                    id: d._id || d.id,
                    created_at: d._creationTime ? new Date(d._creationTime).toISOString() : new Date().toISOString()
                })));
            }
        } catch (e) { }
        finally { setLoading(false); }
    };

    const handleApprove = async (id: string) => {
        try {
            const token = await getToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/drafts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "approved" })
            });
            fetchDrafts();
            setSelectedDraft(null);
        } catch (e) { }
    };

    const handleReject = async (id: string) => {
        try {
            const token = await getToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/drafts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "rejected" })
            });
            fetchDrafts();
            setSelectedDraft(null);
        } catch (e) { }
    };

    const handleTriggerSprint = async () => {
        setIsTriggering(true);
        setMessage("");
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agents/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ agentName: "loki", command: "generate_posts" })
            });
            const data = await res.json();
            setMessage(data.success ? "✅ Loki is writing new posts!" : "❌ Gateway error.");
        } catch { setMessage("❌ Failed to connect."); }
        finally { setIsTriggering(false); setTimeout(() => setMessage(""), 4000); }
    };

    const filtered = drafts.filter(d =>
        d.content?.toLowerCase().includes(search.toLowerCase()) ||
        d.platform?.toLowerCase().includes(search.toLowerCase())
    );

    const statusIcon = (status: string) => {
        if (status === "approved") return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        if (status === "rejected") return <XCircle className="w-4 h-4 text-red-400" />;
        return <Clock className="w-4 h-4 text-orange-400" />;
    };

    return (
        <DashboardShell>
            <SignedOut>
                <SignedOutPanel message="Sign in to view your Content Library." forceRedirectUrl="/content" />
            </SignedOut>
            <SignedIn>
                <DashboardSidebar />
                <main className="flex-1 bg-slate-50 min-h-screen p-8">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                                    Content Library <FileText className="w-8 h-8 text-indigo-600" />
                                </h1>
                                <p className="text-slate-500 mt-2 text-lg">All agent-generated drafts — approve or reject.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Search content..." value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64" />
                                </div>
                                <button onClick={fetchDrafts} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Total Drafts", value: drafts.length, color: "text-slate-900" },
                                { label: "Pending", value: drafts.filter(d => d.status === "pending").length, color: "text-orange-500" },
                                { label: "Approved", value: drafts.filter(d => d.status === "approved").length, color: "text-emerald-500" },
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
                                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Drafts Table */}
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="p-16 text-center text-slate-400">
                                    <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
                                    <p>Loading drafts...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="p-16 text-center text-slate-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="font-bold">No drafts yet</p>
                                    <p className="text-sm mt-1">Trigger Loki to generate posts</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="px-8 py-5">Content</th>
                                            <th className="px-8 py-5">Platform</th>
                                            <th className="px-8 py-5">Agent</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filtered.map((draft: any) => (
                                            <tr key={draft.id} onClick={() => setSelectedDraft(draft)}
                                                className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                                <td className="px-8 py-6 max-w-sm">
                                                    <p className="text-sm text-slate-700 line-clamp-2 group-hover:text-indigo-600 transition-colors">{draft.content}</p>
                                                    <p className="text-xs text-slate-300 mt-1">{new Date(draft.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-full capitalize">{draft.platform || "—"}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-bold text-indigo-600 capitalize">{draft.agent || "—"}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-1.5">
                                                        {statusIcon(draft.status)}
                                                        <span className="text-xs font-bold capitalize text-slate-600">{draft.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6" onClick={e => e.stopPropagation()}>
                                                    {draft.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleApprove(draft.id)}
                                                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black hover:bg-emerald-100 transition-all">
                                                                Approve
                                                            </button>
                                                            <button onClick={() => handleReject(draft.id)}
                                                                className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-black hover:bg-red-100 transition-all">
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* CTA */}
                        <div className="bg-indigo-600 rounded-[40px] p-12 text-center text-white relative overflow-hidden">
                            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                                <h3 className="text-3xl font-black">Need more content?</h3>
                                <p className="text-indigo-100 text-lg">Trigger Loki to write new posts based on your strategy.</p>
                                <button onClick={handleTriggerSprint} disabled={isTriggering}
                                    className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl disabled:opacity-50">
                                    <Sparkles className="inline w-4 h-4 mr-2" />
                                    {isTriggering ? "Triggering Loki..." : "Generate Posts with Loki"}
                                </button>
                                {message && <p className="text-white font-bold text-sm">{message}</p>}
                            </div>
                            <FileText className="absolute top-[-20px] left-[-20px] w-48 h-48 text-white/5 -rotate-12" />
                            <Sparkles className="absolute bottom-[-20px] right-[-20px] w-48 h-48 text-white/5 rotate-12" />
                        </div>
                    </div>
                </main>

                {/* Modal */}
                {selectedDraft && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedDraft(null)}>
                        <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full capitalize">{selectedDraft.agent}</span>
                                    <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-full capitalize">{selectedDraft.platform}</span>
                                    <div className="flex items-center gap-1">
                                        {statusIcon(selectedDraft.status)}
                                        <span className="text-xs font-bold capitalize text-slate-600">{selectedDraft.status}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedDraft(null)}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 mb-6 max-h-96 overflow-y-auto">
                                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{selectedDraft.content}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-400">{new Date(selectedDraft.created_at).toLocaleString()}</p>
                                {selectedDraft.status === "pending" && (
                                    <div className="flex gap-3">
                                        <button onClick={() => handleReject(selectedDraft.id)}
                                            className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-black hover:bg-red-100 transition-all">
                                            Reject
                                        </button>
                                        <button onClick={() => handleApprove(selectedDraft.id)}
                                            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-black hover:bg-emerald-600 transition-all">
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </SignedIn>
        </DashboardShell>
    );
}
