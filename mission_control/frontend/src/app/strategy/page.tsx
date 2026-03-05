"use client";
import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedIn, SignedOut, useAuth } from "@/auth/clerk";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { Calendar, List, Sparkles, RefreshCw, Target, Users, Zap, Plus, X, Save } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    drafted:   "bg-purple-100 text-purple-700",
    pending:   "bg-orange-100 text-orange-700",
    published: "bg-emerald-100 text-emerald-700",
};

const AGENTS = ["loki","jarvis","shuri","oracle","fury","echo","pulse","atlas","vision","main"];
const PLATFORMS = ["LinkedIn","Twitter","Both"];
const STATUSES = ["pending","scheduled","drafted","published"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const EMPTY_FORM = { day:"Monday", date:"", theme:"", topic:"", platform:"LinkedIn", time:"10:00 AM IST", agent:"loki", status:"pending" };

export default function StrategyPage() {
    const { getToken } = useAuth();
    const [tab, setTab]               = useState<"list"|"calendar">("list");
    const [strategy, setStrategy]     = useState<any>(null);
    const [activity, setActivity]     = useState<any[]>([]);
    const [loading, setLoading]       = useState(true);
    const [triggering, setTriggering] = useState(false);
    const [message, setMessage]       = useState("");
    const [showAdd, setShowAdd]       = useState(false);
    const [editIdx, setEditIdx]       = useState<number|null>(null);
    const [form, setForm]             = useState({ ...EMPTY_FORM });
    const [saving, setSaving]         = useState(false);

    useEffect(() => {
        fetchStrategy();
        fetchActivity();
        const i = setInterval(() => { fetchStrategy(); fetchActivity(); }, 30000);
        return () => clearInterval(i);
    }, []);

    const fetchStrategy = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/strategy`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.strategy) setStrategy(data.strategy);
        } catch (e) {}
        finally { setLoading(false); }
    };

    const fetchActivity = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/activity`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setActivity((data.activity || data.items || []).slice(0, 5));
        } catch (e) {}
    };

    const triggerShuri = async () => {
        setTriggering(true);
        setMessage("");
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agents/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ agentName: "shuri", command: "regenerate_strategy" })
            });
            const data = await res.json();
            setMessage(data.success ? "✅ Shuri is generating new strategy!" : "❌ Failed.");
            setTimeout(fetchStrategy, 15000);
        } catch { setMessage("❌ Connection failed."); }
        finally { setTriggering(false); setTimeout(() => setMessage(""), 5000); }
    };

    const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditIdx(null); setShowAdd(true); };
    const openEdit = (idx: number) => { setForm({ ...strategy.days[idx] }); setEditIdx(idx); setShowAdd(true); };

    const saveEntry = async () => {
        if (!form.topic.trim()) return;
        setSaving(true);
        try {
            const token = await getToken();
            const currentDays = strategy?.days || [];
            const newDays = editIdx !== null
                ? currentDays.map((d: any, i: number) => i === editIdx ? form : d)
                : [...currentDays, form];

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/strategy`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    week: strategy?.week || "Custom Plan",
                    goal: strategy?.goal || "Custom content strategy",
                    frequency: strategy?.frequency || `${newDays.length} Posts`,
                    persona: strategy?.persona || "Tech Founders",
                    days: newDays,
                    generatedBy: "manual"
                })
            });
            setShowAdd(false);
            setMessage(editIdx !== null ? "✅ Entry updated!" : "✅ Entry added!");
            setTimeout(() => setMessage(""), 3000);
            await fetchStrategy();
        } catch (e) { setMessage("❌ Save failed."); }
        finally { setSaving(false); }
    };

    const deleteEntry = async (idx: number) => {
        try {
            const token = await getToken();
            const newDays = strategy.days.filter((_: any, i: number) => i !== idx);
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/strategy`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...strategy, days: newDays, generatedBy: "manual" })
            });
            await fetchStrategy();
        } catch (e) {}
    };

    const days = strategy?.days || [];

    // Calendar: group by day
    const calendarMap: Record<string, any[]> = {};
    DAYS.forEach(d => calendarMap[d] = []);
    days.forEach((item: any) => {
        const key = item.day || "Monday";
        if (calendarMap[key]) calendarMap[key].push(item);
        else calendarMap[key] = [item];
    });

    return (
        <DashboardShell>
            <SignedOut>
                <SignedOutPanel message="Sign in to view your Content Roadmap." forceRedirectUrl="/strategy" />
            </SignedOut>
            <SignedIn>
                <DashboardSidebar />
                <main className="flex-1 bg-slate-50 min-h-screen p-8">
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                                    Content Roadmap <Calendar className="w-8 h-8 text-indigo-600" />
                                </h1>
                                <p className="text-slate-500 mt-1 text-sm">
                                    {strategy ? `${strategy.week} · by ${strategy.generatedBy}` : "No strategy yet"}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={fetchStrategy} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button onClick={openAdd}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                                    <Plus className="w-4 h-4" /> Add Entry
                                </button>
                                <button onClick={triggerShuri} disabled={triggering}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all disabled:opacity-50">
                                    <Sparkles className="w-4 h-4" />
                                    {triggering ? "Generating..." : "Regenerate"}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-3 text-sm font-bold text-indigo-700">
                                {message}
                            </div>
                        )}

                        {/* Goal Cards */}
                        {strategy && (
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: <Target className="w-4 h-4 text-indigo-500" />, label: "Weekly Goal", value: strategy.goal },
                                    { icon: <Zap className="w-4 h-4 text-orange-500" />, label: "Frequency", value: strategy.frequency },
                                    { icon: <Users className="w-4 h-4 text-emerald-500" />, label: "Target Persona", value: strategy.persona },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
                                        <div className="flex items-center gap-2 mb-2">{s.icon}<p className="text-xs font-black uppercase tracking-widest text-slate-400">{s.label}</p></div>
                                        <p className="text-sm font-bold text-slate-800">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit">
                            <button onClick={() => setTab("list")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === "list" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-900"}`}>
                                <List className="w-4 h-4" /> List View
                            </button>
                            <button onClick={() => setTab("calendar")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === "calendar" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-900"}`}>
                                <Calendar className="w-4 h-4" /> Calendar View
                            </button>
                        </div>

                        {/* LIST VIEW */}
                        {tab === "list" && (
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                                {loading ? (
                                    <div className="p-16 text-center text-slate-400">
                                        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
                                        <p>Loading...</p>
                                    </div>
                                ) : days.length === 0 ? (
                                    <div className="p-16 text-center text-slate-400">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">No entries yet</p>
                                        <p className="text-sm mt-1">Add manually or trigger Shuri</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-8 py-5">Day</th>
                                                <th className="px-8 py-5">Theme</th>
                                                <th className="px-8 py-5">Topic</th>
                                                <th className="px-8 py-5">Agent</th>
                                                <th className="px-8 py-5">Status</th>
                                                <th className="px-8 py-5">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {days.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <p className="text-xs font-bold text-slate-400">{item.day}</p>
                                                        <p className="text-sm font-black text-slate-900">{item.date}</p>
                                                        <p className="text-xs text-slate-400">{item.time}</p>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-xs font-bold text-indigo-500">{item.theme}</span>
                                                    </td>
                                                    <td className="px-8 py-4 max-w-xs">
                                                        <p className="text-sm text-slate-700 line-clamp-2">{item.topic}</p>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-xs font-bold text-slate-600 capitalize px-2 py-1 bg-slate-100 rounded-lg">{item.agent}</span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className={`text-xs font-black px-3 py-1 rounded-full capitalize ${STATUS_COLORS[item.status] || STATUS_COLORS.pending}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => openEdit(i)}
                                                                className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100">
                                                                Edit
                                                            </button>
                                                            <button onClick={() => deleteEntry(i)}
                                                                className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg font-bold hover:bg-red-100">
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* CALENDAR VIEW */}
                        {tab === "calendar" && (
                            <div className="grid grid-cols-7 gap-3">
                                {DAYS.map(day => (
                                    <div key={day} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                        <div className="bg-indigo-600 px-3 py-2 text-center">
                                            <p className="text-xs font-black text-white uppercase tracking-widest">{day.slice(0,3)}</p>
                                        </div>
                                        <div className="p-2 space-y-2 min-h-32">
                                            {calendarMap[day]?.map((item: any, i: number) => (
                                                <div key={i}
                                                    onClick={() => openEdit(days.indexOf(item))}
                                                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-indigo-300 transition-all">
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase truncate">{item.theme}</p>
                                                    <p className="text-[11px] text-slate-700 line-clamp-2 mt-0.5">{item.topic}</p>
                                                    <div className="flex items-center justify-between mt-1.5">
                                                        <span className="text-[9px] font-bold text-slate-400 capitalize">{item.agent}</span>
                                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[item.status] || STATUS_COLORS.pending}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={openAdd}
                                                className="w-full p-1.5 rounded-xl border border-dashed border-slate-200 text-slate-300 hover:border-indigo-300 hover:text-indigo-400 transition-all text-center">
                                                <Plus className="w-3 h-3 mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recent Activity */}
                        {activity.length > 0 && (
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
                                <h2 className="text-lg font-black text-slate-900 mb-5">Recent Agent Activity</h2>
                                <div className="space-y-3">
                                    {activity.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-black text-indigo-600 capitalize">{(item.agent || "?")[0]}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-700 truncate">{item.message}</p>
                                                <p className="text-xs text-slate-400 capitalize">{item.agent} · {item.action}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Add/Edit Modal */}
                {showAdd && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAdd(false)}>
                        <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-slate-900">
                                    {editIdx !== null ? "Edit Entry" : "Add Entry"}
                                </h3>
                                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Day</label>
                                        <select value={form.day} onChange={e => setForm(f => ({...f, day: e.target.value}))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-400">
                                            {DAYS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Date</label>
                                        <input type="text" placeholder="e.g. Mar 4" value={form.date}
                                            onChange={e => setForm(f => ({...f, date: e.target.value}))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Theme</label>
                                    <input type="text" placeholder="e.g. Awareness Day" value={form.theme}
                                        onChange={e => setForm(f => ({...f, theme: e.target.value}))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Topic *</label>
                                    <textarea placeholder="What's the post about?" value={form.topic}
                                        onChange={e => setForm(f => ({...f, topic: e.target.value}))}
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Platform</label>
                                        <select value={form.platform} onChange={e => setForm(f => ({...f, platform: e.target.value}))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-400">
                                            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Time</label>
                                        <input type="text" placeholder="e.g. 10:00 AM IST" value={form.time}
                                            onChange={e => setForm(f => ({...f, time: e.target.value}))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Agent</label>
                                        <select value={form.agent} onChange={e => setForm(f => ({...f, agent: e.target.value}))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-400">
                                            {AGENTS.map(a => <option key={a}>{a}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Status</label>
                                        <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-400">
                                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAdd(false)}
                                    className="flex-1 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all">
                                    Cancel
                                </button>
                                <button onClick={saveEntry} disabled={saving || !form.topic.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all disabled:opacity-50">
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? "Saving..." : "Save Entry"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </SignedIn>
        </DashboardShell>
    );
}
