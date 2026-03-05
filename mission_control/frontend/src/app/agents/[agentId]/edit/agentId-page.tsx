"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { getLocalAuthToken } from "@/auth/localAuth";
import { Bot, Activity, Clock, Zap, Settings, ArrowLeft, Trash2, Play, Send, User } from "lucide-react";
import { Markdown } from "@/components/atoms/Markdown";

type Agent = {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'online' | 'busy' | 'offline';
  capabilities: string[];
};

type Message = {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
};

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params?.agentId as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchData = async () => {
    try {
      const token = getLocalAuthToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const agentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agents`, { headers });
      const agentData = await agentRes.json();
      if (agentData.success) {
        const found = agentData.agents.find((a: any) => a.id === agentId);
        setAgent(found);
      }

      const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/history?agentId=${agentId}`, { headers });
      const historyData = await historyRes.json();

      if (historyData.success && historyData.history && historyData.history.messages && historyData.history.messages.length > 0) {
        const mapped = historyData.history.messages.map((m: any, i: number) => ({
          id: `m-${i}-${m.timestamp || Date.now()}`,
          sender: m.role === 'user' ? 'user' : 'agent',
          text: m.text || m.content || '',
          timestamp: m.timestamp || new Date().toISOString()
        }));
        setMessages(mapped);
      } else {
        setMessages([{
          id: 'welcome',
          sender: 'agent',
          text: `Hello! I am ${agentId}. How can I help?`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error("Failed to fetch agent details", err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncHistory = async () => {
    try {
      const token = getLocalAuthToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/history?agentId=${agentId}`, { headers });
      const historyData = await historyRes.json();

      if (historyData.success && historyData.history && historyData.history.messages) {
        const mapped = historyData.history.messages.map((m: any, i: number) => ({
          id: `m-${i}-${m.timestamp || Date.now()}`,
          sender: m.role === 'user' ? 'user' : 'agent',
          text: m.text || m.content || '',
          timestamp: m.timestamp || new Date().toISOString()
        }));
        setMessages(prev => mapped.length > prev.length ? mapped : prev);
      }
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchData();
      const interval = setInterval(syncHistory, 5000);
      return () => clearInterval(interval);
    }
  }, [agentId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageText = input.trim();
    if (!messageText || isSending) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const token = getLocalAuthToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ agentId, message: messageText })
      });
      const data = await res.json();

      if (data.success && data.payload?.response) {
        const agentMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: data.payload.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, agentMsg]);
        setTimeout(syncHistory, 1000);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 bg-slate-50 min-h-screen p-8 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/agents')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cabinet
            </button>
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 transition-all shadow-sm">
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 bg-white rounded-[40px] animate-pulse border border-slate-100" />
          ) : !agent ? (
            <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm flex-1">
              <h3 className="text-2xl font-black text-slate-900">Agent not found</h3>
              <p className="text-slate-500 mt-2">The agent you're looking for doesn't exist.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10 text-center">
                    <div className="p-5 bg-indigo-50 rounded-[28px] inline-flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Bot className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-1">{agent.name}</h1>
                    <p className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-6">{agent.role}</p>
                    <div className="flex items-center justify-center gap-2 mb-8">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-500">online</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">{agent.description}</p>
                    <button className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all active:scale-95">
                      <Zap className="w-4 h-4 fill-current" />
                      View Skills
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-col bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">Direct Channel</h3>
                      <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Powered by OpenClaw</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-4 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'}`}>
                          {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-5 rounded-[28px] shadow-sm ${msg.sender === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                          <Markdown content={msg.text} variant="basic" />
                          <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-40 ${msg.sender === 'user' ? 'text-white text-right' : 'text-slate-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="flex gap-4 items-center animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="px-6 py-3 bg-white border border-slate-100 rounded-full flex gap-1">
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-8 bg-white border-t border-slate-50">
                  <form onSubmit={handleSendMessage} className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Ask ${agent?.name || 'Agent'} anything...`}
                      className="w-full pl-6 pr-20 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-slate-900 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isSending}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-slate-900 transition-all disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
