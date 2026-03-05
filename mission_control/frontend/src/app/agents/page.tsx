"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { getLocalAuthToken } from "@/auth/localAuth";
import { Bot, Zap, Cpu, Play, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

type Agent = {
  id: string;
  name: string;
  emoji?: string;
  role: string;
  description: string;
  status: 'online' | 'offline' | 'busy';
  capabilities: string[];
};

const AGENTS: Agent[] = [
  { id: 'jarvis', name: 'Jarvis', role: 'Orchestrator', description: 'Parses intent, delegates tasks, and coordinates the agent network.', status: 'online', capabilities: ['Intent Parsing', 'Task Delegation', 'System Orchestration'] },
  { id: 'fury', name: 'Fury', role: 'Researcher', description: 'Autonomous web intel via Apify focusing on Reddit, LinkedIn, and X.', status: 'online', capabilities: ['Trend Detection', 'Market Research', 'Pain Point Extraction'] },
  { id: 'shuri', name: 'Shuri', role: 'Strategist', description: 'Develops 7-day content calendars and campaign planning.', status: 'online', capabilities: ['Strategic Planning', 'Content Calendaring', 'Campaign Management'] },
  { id: 'oracle', name: 'Oracle', role: 'Ideator', description: 'Creates hundreds of content ideas from research data.', status: 'online', capabilities: ['Brainstorming', 'Concept Generation', 'Trend Adaptation'] },
  { id: 'loki', name: 'Loki', role: 'Writer', description: 'Generates high-performance LinkedIn and X posts.', status: 'online', capabilities: ['Copywriting', 'Voice Adaptation', 'Platform Optimization'] },
  { id: 'vision', name: 'Vision', role: 'Visual Generator', description: 'Creates quote cards, diagrams, and video scripts.', status: 'online', capabilities: ['Visual Design', 'Diagramming', 'Creative Direction'] },
  { id: 'atlas', name: 'Atlas', role: 'Distributor', description: 'Schedules and publishes posts to social platforms.', status: 'online', capabilities: ['Auto-Publishing', 'Multi-Platform Sync', 'Scheduling'] },
  { id: 'echo', name: 'Echo', role: 'Engagement', description: 'Generates reply suggestions and hunts for conversations.', status: 'online', capabilities: ['Comment Analysis', 'Reply Generation', 'Social Listening'] },
  { id: 'pulse', name: 'Pulse', role: 'Analytics', description: 'Weekly performance analysis and auto-evolution insights.', status: 'online', capabilities: ['Performance Tracking', 'Growth Analytics', 'Strategy Refinement'] },
];

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const token = getLocalAuthToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (err) {
      console.error("Failed to fetch agents", err);
      setAgents(AGENTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleTrigger = async (agentId: string) => {
    try {
      const token = getLocalAuthToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agents/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ agentName: agentId, command: 'manual_trigger' })
      });
      if (res.ok) {
        alert(`${agentId} triggered! Check the Live Feed.`);
      }
    } catch (err) {
      console.error("Trigger failed", err);
    }
  };

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 bg-slate-50 min-h-screen p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
              Agent Cabinet <Cpu className="w-8 h-8 text-indigo-600" />
            </h1>
            <p className="text-slate-500 mt-2 text-lg">Manage and deploy your specialized autonomous workforce.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-white rounded-[32px] animate-pulse border border-slate-100" />
              ))
            ) : agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 flex items-center justify-center text-2xl">
                      <Bot className="w-6 h-6" />
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      online
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-1">{agent.name}</h3>
                  <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4">{agent.role}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 h-12 overflow-hidden">{agent.description}</p>

                  <div className="space-y-2 mb-8">
                    {agent.capabilities?.map((cap, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Zap className="w-3 h-3 text-indigo-500" />
                        {cap}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleTrigger(agent.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Deploy Agent
                    </button>
                    <button
                      onClick={() => router.push(`/agents/${agent.id}`)}
                      className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}