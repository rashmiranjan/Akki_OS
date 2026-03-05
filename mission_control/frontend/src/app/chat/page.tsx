"use client";
import { useState, useRef, useEffect } from "react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedIn, SignedOut, useAuth } from "@/auth/clerk";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { Send, Bot, User, RefreshCw } from "lucide-react";

const AGENTS = ["jarvis", "main", "loki", "fury", "echo", "shuri", "oracle", "pulse", "atlas", "vision"];

type Message = { role: "user" | "agent"; text: string; time: string };

export default function ChatPage() {
    const { getToken } = useAuth();
    const [selectedAgent, setSelectedAgent] = useState("jarvis");
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const currentMessages = messages[selectedAgent] || [];

    useEffect(() => {
        loadHistory(selectedAgent);
    }, [selectedAgent]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedAgent]);

    const loadHistory = async (agentId: string) => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/history?agentId=${agentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.history) && data.history.length > 0) {
                const mapped: Message[] = data.history.map((h: any) => ({
                    role: h.role === "user" ? "user" : "agent",
                    text: h.content || h.message || h.text || "",
                    time: h._creationTime
                        ? new Date(h._creationTime).toLocaleTimeString()
                        : new Date().toLocaleTimeString()
                }));
                setMessages(prev => ({ ...prev, [agentId]: mapped }));
            }
        } catch (e) { }
    };

    const addMessage = (agentId: string, msg: Message) => {
        setMessages(prev => ({
            ...prev,
            [agentId]: [...(prev[agentId] || []), msg]
        }));
    };

    const replaceThinking = (agentId: string, text: string) => {
        setMessages(prev => {
            const msgs = [...(prev[agentId] || [])];
            const idx = msgs.findLastIndex(m => m.text.startsWith("⏳"));
            if (idx !== -1) {
                msgs[idx] = { role: "agent", text, time: new Date().toLocaleTimeString() };
            } else {
                msgs.push({ role: "agent", text, time: new Date().toLocaleTimeString() });
            }
            return { ...prev, [agentId]: msgs };
        });
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const text = input.trim();
        const time = new Date().toLocaleTimeString();

        addMessage(selectedAgent, { role: "user", text, time });
        setInput("");
        setLoading(true);

        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ agentId: selectedAgent, message: text })
            });
            const data = await res.json();
            const runId = data?.payload?.runId;

            addMessage(selectedAgent, {
                role: "agent",
                text: "⏳ Thinking...",
                time: new Date().toLocaleTimeString()
            });

            if (runId) {
                pollForReply(runId, selectedAgent);
            }
        } catch (e: any) {
            replaceThinking(selectedAgent, "❌ Error: " + e.message);
            setLoading(false);
        }
    };

    const pollForReply = async (runId: string, agentId: string) => {
        let attempts = 0;
        const maxAttempts = 24;

        const poll = async () => {
            attempts++;
            try {
                const token = await getToken();
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/history?agentId=${agentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();

                if (data.success && Array.isArray(data.history)) {
                    // Find agent reply with matching runId
                    const reply = data.history.find(
                        (h: any) => h.runId === runId && h.role !== "user"
                    );

                    if (reply) {
                        const replyText = reply.content || reply.text || reply.message || "";
                        if (replyText && replyText !== "⏳ Thinking...") {
                            replaceThinking(agentId, replyText);
                            setLoading(false);
                            return;
                        }
                    }
                }
            } catch (e) { }

            if (attempts < maxAttempts) {
                setTimeout(poll, 3000);
            } else {
                replaceThinking(agentId, "⚠️ No reply received — check OpenClaw dashboard.");
                setLoading(false);
            }
        };

        setTimeout(poll, 3000);
    };

    return (
        <DashboardShell>
            <SignedOut>
                <SignedOutPanel message="Sign in to chat with agents." forceRedirectUrl="/login" />
            </SignedOut>
            <SignedIn>
                <DashboardSidebar />
                <main className="flex-1 flex bg-slate-50 min-h-screen">
                    <div className="w-48 bg-white border-r border-slate-200 p-4 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Agents</p>
                        {AGENTS.map(agent => (
                            <button key={agent} onClick={() => setSelectedAgent(agent)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${selectedAgent === agent ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
                                <Bot className="inline w-3 h-3 mr-2 opacity-60" />{agent}
                                {(messages[agent] || []).length > 0 && (
                                    <span className="ml-1 text-[10px] text-indigo-400 font-bold">
                                        {(messages[agent] || []).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col max-h-screen">
                        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 capitalize">{selectedAgent}</p>
                                    <p className="text-xs text-green-500 font-medium">● Online via OpenClaw</p>
                                </div>
                            </div>
                            <button onClick={() => loadHistory(selectedAgent)}
                                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-all">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {currentMessages.length === 0 && (
                                <div className="text-center text-slate-400 mt-20">
                                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-semibold">Start a conversation with {selectedAgent}</p>
                                    <p className="text-sm mt-1">Messages go directly to OpenClaw Gateway</p>
                                </div>
                            )}
                            {currentMessages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    {msg.role === "agent" && (
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-3.5 h-3.5 text-indigo-600" />
                                        </div>
                                    )}
                                    <div className={`max-w-lg px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"}`}>
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-indigo-200" : "text-slate-400"}`}>{msg.time}</p>
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User className="w-3.5 h-3.5 text-slate-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <Bot className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                                    </div>
                                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="bg-white border-t border-slate-200 p-4">
                            <div className="flex gap-3 items-center bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50">
                                <input
                                    className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                                    placeholder={`Message ${selectedAgent}...`}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                    disabled={loading}
                                />
                                <button onClick={sendMessage} disabled={loading || !input.trim()}
                                    className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-40">
                                    <Send className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 text-center mt-2">Enter to send · Polling reply every 3s</p>
                        </div>
                    </div>
                </main>
            </SignedIn>
        </DashboardShell>
    );
}
