"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Linkedin,
    Twitter,
    Check,
    X,
    MoreVertical,
    Clock
} from 'lucide-react';
import { useAuth } from "@/auth/clerk";

export const DraftPanel = () => {
    const { getToken, isSignedIn } = useAuth();
    const [drafts, setDrafts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDrafts = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/drafts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setDrafts(data.items);
            }
        } catch (err) {
            console.error("Failed to fetch drafts", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isSignedIn) {
            fetchDrafts();
        }
    }, [isSignedIn]);

    const handleAction = async (id: string, newStatus: string) => {
        try {
            const token = await getToken();
            const res = await fetch(`/api/v1/drafts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setDrafts(prev => prev.filter(d => d.id !== id));
            }
        } catch (err) {
            console.error("Action failed", err);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl">
                        <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Pending Drafts</h2>
                        <p className="text-slate-400 text-xs font-medium">Approve agent generated posts</p>
                    </div>
                </div>
                <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                    {drafts.length}
                </span>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    Array(2).fill(0).map((_, i) => (
                        <div key={i} className="h-44 bg-slate-50 rounded-2xl animate-pulse" />
                    ))
                ) : drafts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Clock className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-bold">Queue is empty</p>
                        <p className="text-xs">Agents are scanning for trends...</p>
                    </div>
                ) : (
                    drafts.map((draft) => (
                        <div
                            key={draft.id}
                            className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${draft.platform === 'linkedin' ? 'bg-[#0077b5]/10 text-[#0077b5]' : 'bg-black/10 text-black'}`}>
                                        {draft.platform === 'linkedin' ? <Linkedin className="w-4 h-4" /> : <Twitter className="w-4 h-4" />}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                        Ready for {draft.platform}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                        By {draft.agent}
                                    </span>
                                </div>
                            </div>

                            <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium">
                                {draft.content}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase">Scheduled: Tomorrow</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAction(draft.id, 'rejected')}
                                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                        title="Reject"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(draft.id, 'approved')}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

