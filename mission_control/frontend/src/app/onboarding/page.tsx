"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/clerk";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { Bot, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";

const STEPS = [
  {
    id: "name",
    question: "Aapka naam kya hai?",
    subtitle: "Main aapko isi naam se jaanunga",
    placeholder: "e.g. Chirag Goyal",
    type: "text",
    field: "name",
  },
  {
    id: "niche",
    question: "Aap kya build kar rahe ho?",
    subtitle: "Apna product ya project describe karo",
    placeholder: "e.g. AI-powered personal branding OS for founders",
    type: "text",
    field: "niche",
  },
  {
    id: "audience",
    question: "Aapka target audience kaun hai?",
    subtitle: "Aap kiske liye content banate ho?",
    placeholder: "e.g. Tech founders, SaaS builders, startup CTOs",
    type: "text",
    field: "audience",
  },
  {
    id: "goal",
    question: "Content se aapka main goal kya hai?",
    subtitle: "Aap kya achieve karna chahte ho?",
    placeholder: "e.g. Build authority in AI space, get inbound leads",
    type: "text",
    field: "goal",
  },
  {
    id: "tone",
    question: "Aapki writing style kaisi hai?",
    subtitle: "Apna voice describe karo",
    options: [
      { value: "bold-direct", label: "Bold & Direct", emoji: "âš¡" },
      { value: "educational", label: "Educational", emoji: "ðŸ“š" },
      { value: "storytelling", label: "Storytelling", emoji: "ðŸ“–" },
      { value: "conversational", label: "Conversational", emoji: "ðŸ’¬" },
      { value: "analytical", label: "Analytical", emoji: "ðŸ“Š" },
      { value: "inspirational", label: "Inspirational", emoji: "ðŸš€" },
    ],
    type: "select",
    field: "tone",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.onboarding?.completed && data.profile?.name) {
        router.replace("/dashboard");
      }
    } catch (e) { }
    finally { setChecking(false); }
  };

  const current = STEPS[step];
  const value = answers[current?.field] || "";

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          context: {
            ...answers,
            platforms: ["linkedin"],
            painPoints: [answers.goal, answers.niche].filter(Boolean),
            voiceProfile: { tone: answers.tone, style: answers.tone },
          }
        })
      });
      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 3000);
    } catch (e) {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-center px-4">
      <div className="space-y-6">
        <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mx-auto">
          <Check className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black">Welcome, {answers.name?.split(" ")[0]}! ðŸŽ‰</h1>
        <p className="text-slate-400">Your agents are being briefed. Redirecting to dashboard...</p>
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Akki OS Setup</h1>
          <p className="text-slate-400 mt-1 text-sm">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-indigo-500" : "bg-slate-800"
              }`} />
          ))}
        </div>

        {/* Question Card */}
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Question {step + 1}</span>
            </div>
            <h2 className="text-2xl font-black text-white">{current.question}</h2>
            <p className="text-slate-400 mt-1 text-sm">{current.subtitle}</p>
          </div>

          {current.type === "text" ? (
            <input
              autoFocus
              type="text"
              value={value}
              onChange={e => setAnswers(prev => ({ ...prev, [current.field]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && value.trim() && handleNext()}
              placeholder={current.placeholder}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {current.options?.map(opt => (
                <button key={opt.value} onClick={() => setAnswers(prev => ({ ...prev, [current.field]: opt.value }))}
                  className={`p-4 rounded-2xl border text-left transition-all ${value === opt.value
                      ? "border-indigo-500 bg-indigo-600/20 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                    }`}>
                  <span className="text-2xl block mb-1">{opt.emoji}</span>
                  <span className="text-sm font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-700 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button onClick={handleNext} disabled={!value.trim() || loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {step === STEPS.length - 1 ? "Launch Akki OS ðŸš€" : "Continue"}
                {step < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

