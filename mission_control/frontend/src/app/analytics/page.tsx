"use client";

import React from "react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedIn, SignedOut } from "@/auth/clerk";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { BarChart3, TrendingUp, Users, MessageSquare, Heart, Share2, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";

const STATS = [
    { label: "Total Impressions", value: "842.5K", change: "+14.2%", positive: true, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Profile Visits", value: "12,402", change: "+8.1%", positive: true, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Engagement", value: "48.2K", change: "-2.4%", positive: false, icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Inbound Leads", value: "34", change: "+21.5%", positive: true, icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
];

export default function AnalyticsPage() {
    return (
        <DashboardShell>
            <SignedOut>
                <SignedOutPanel message="Sign in to view your Engagement Analytics." forceRedirectUrl="/analytics" />
            </SignedOut>

            <SignedIn>
                <DashboardSidebar />
                <main className="flex-1 bg-slate-50 min-h-screen p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                                Engagement <BarChart3 className="w-8 h-8 text-indigo-600" />
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg">Performance tracking across your personal brand ecosystem.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {STATS.map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`flex items-center gap-0.5 text-xs font-black ${stat.positive ? 'text-green-500' : 'text-rose-500'}`}>
                                            {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {stat.change}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                                    Growth Trajectory
                                </h3>
                                <div className="h-64 w-full bg-slate-50 rounded-3xl flex items-center justify-center border border-dashed border-slate-200">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <BarChart3 className="w-6 h-6 text-indigo-300" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">Interactive Chart Mockup</p>
                                        <p className="text-[10px] text-slate-300">Shuri is processing real-time data...</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-indigo-600" />
                                    Platform Distribution
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { platform: "LinkedIn", value: 65, color: "bg-[#0077b5]" },
                                        { platform: "X (Twitter)", value: 25, color: "bg-black" },
                                        { platform: "Substack", value: 10, color: "bg-[#ff6719]" },
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-700">{item.platform}</span>
                                                <span className="text-sm font-black text-slate-900">{item.value}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                                    style={{ width: `${item.value}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white p-10 rounded-[40px] relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 max-w-xl text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/30 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                        <Sparkles className="w-3 h-3" /> AI Insight
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black">Your Tuesday "Hot Take" posts are performing 4.2x better than average.</h3>
                                    <p className="text-slate-400 text-lg">Should Fury scanned for more divergent topics for next week's Tuesday slot?</p>
                                </div>
                                <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all transition-all active:scale-95 whitespace-nowrap shadow-xl shadow-white/5">
                                    Approve Strategic Pivot
                                </button>
                            </div>
                            <TrendingUp className="absolute top-[-40px] right-[-40px] w-64 h-64 text-white/5 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                        </div>
                    </div>
                </main>
            </SignedIn>
        </DashboardShell>
    );
}
