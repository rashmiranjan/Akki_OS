"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Cpu,
    Zap,
    Search,
    Lightbulb,
    PenTool,
    Share2,
    MessageSquare,
    BarChart3,
    Calendar,
    Image as ImageIcon,
    Play
} from 'lucide-react';
import { useAuth } from "@/auth/clerk";

const AGENTS = [
    { id: 'jarvis', name: 'Jarvis', role: 'Orchestrator', icon: Cpu, color: 'text-blue-600' },
    { id: 'fury', name: 'Fury', role: 'Autonomous Researcher', icon: Search, color: 'text-red-600' },
    { id: 'shuri', name: 'Shuri', role: 'Content Strategist', icon: Calendar, color: 'text-orange-600' },
    { id: 'oracle', name: 'Oracle', role: 'Ideation Brain', icon: Lightbulb, color: 'text-yellow-600' },
    { id: 'loki', name: 'Loki', role: 'Chief Writer', icon: PenTool, color: 'text-emerald-600' },
    { id: 'atlas', name: 'Atlas', role: 'Distributor', icon: Share2, color: 'text-indigo-600' },
    { id: 'echo', name: 'Echo', role: 'Engagement Agent', icon: MessageSquare, color: 'text-pink-600' },
    { id: 'pulse', name: 'Pulse', role: 'Performance Analytics', icon: BarChart3, color: 'text-violet-600' },
    { id: 'vision', name: 'Vision', role: 'Visual Generator', icon: ImageIcon, color: 'text-teal-600' },
];

export const AgentStatusPanel = () => {
    const { getToken, isSignedIn } = useAuth();
    const [agents, setAgents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [triggering, setTriggering] = useState<string | null>(null);

    const fetchAgents = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agents`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setAgents(data.agents);
            }
        } catch (err) {
            console.error("Failed to fetch agents", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isSignedIn) {
            fetchAgents();
        }
    }, [isSignedIn]);

    const handleTrigger = async (agentId: string) => {
        setTriggering(agentId);
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agents/trigger`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ agentName: agentId, command: 'manual_trigger' })
            });

            if (response.ok) {
                console.log(`${agentId} triggered successfully`);
            }
        } catch (error) {
            console.error('Trigger failed', error);
        } finally {
            setTimeout(() => setTriggering(null), 1000); // UI feedback delay
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Activity className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Agent Cabinet</h2>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Gateway Connected
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
                    ))
                ) : agents.map((agent) => {
                    const localInfo = AGENTS.find(a => a.id === agent.id) || { icon: Cpu, color: 'text-slate-600' };
                    const Icon = localInfo.icon;
                    const status = agent.status || 'online';

                    return (
                        <div
                            key={agent.id}
                            className="group flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform ${localInfo.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-slate-800 leading-none mb-1 truncate">{agent.name}</h3>
                                    <p className="text-xs text-slate-500 truncate">{agent.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-end mr-1">
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${status === 'online' ? 'text-green-500' :
                                        status === 'busy' ? 'text-amber-500' : 'text-slate-400'
                                        }`}>
                                        {status}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleTrigger(agent.id)}
                                    disabled={triggering === agent.id}
                                    className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-50 transition-all"
                                    title="Manual Trigger"
                                >
                                    <Play className={`w-3 h-3 ${triggering === agent.id ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

