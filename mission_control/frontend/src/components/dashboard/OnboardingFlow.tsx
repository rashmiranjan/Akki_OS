"use client";
import { getLocalAuthToken } from '@/auth/localAuth';
import React, { useState } from 'react';
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Briefcase,
    Target,
    Trophy,
    History,
    MessageCircle,
    ChevronRight
} from 'lucide-react';

const QUESTIONS = [
    {
        id: 'do',
        question: "What do you do?",
        description: "Tell Jarvis about your product, service, or unique selling proposition.",
        icon: Briefcase,
        placeholder: "I build AI agents for real estate brokers..."
    },
    {
        id: 'customer',
        question: "Who is your ideal customer?",
        description: "Define their role, pain points, and demographics.",
        icon: Target,
        placeholder: "Founders of Series A startups who struggle with hiring..."
    },
    {
        id: 'stage',
        question: "What stage are you at?",
        description: "Building, early traction, growing, or scaling?",
        icon: Trophy,
        placeholder: "Launched product 2 months ago, have 10 beta users..."
    },
    {
        id: 'background',
        question: "What is your background?",
        description: "Your story, frustrations, and what you believe in.",
        icon: History,
        placeholder: "Spent 10 years in sales, hated the inefficient manual entry..."
    },
    {
        id: 'communication',
        question: "How do you communicate?",
        description: "Describe your tone, humor, length, and style.",
        icon: MessageCircle,
        placeholder: "Direct, slightly witty, data-driven, and concise..."
    }
];

export const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isFinishing, setIsFinishing] = useState(false);

    const totalSteps = QUESTIONS.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const currentQ = QUESTIONS[currentStep];
    const Icon = currentQ.icon;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = async () => {
        setIsFinishing(true);

        try {
            const token = sessionStorage.getItem('mc_local_auth_token') || '';
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agents/trigger`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    agentName: 'jarvis',
                    command: 'initialize_phase_0',
                    context: answers
                })
            });
        } catch (err) {
            console.error("Onboarding trigger failed", err);
        }

        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    if (isFinishing) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-xl">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Setting up Akki OS</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    Jarvis is now parsing your intent and initializing Fury for market scan...
                </p>
                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping [animation-delay:0.4s]" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                <div
                    className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1 px-2 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold tracking-widest uppercase">
                        Onboarding
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                        Step {currentStep + 1} of {totalSteps}
                    </span>
                </div>
                <div className="text-xs font-bold text-slate-300">AKKI OS v1.0</div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">{currentQ.question}</h2>
                        <p className="text-slate-500 mt-1">{currentQ.description}</p>
                    </div>
                </div>

                <textarea
                    autoFocus
                    className="w-full h-40 p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/30 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all duration-200 text-lg text-slate-800 placeholder:text-slate-300 resize-none"
                    placeholder={currentQ.placeholder}
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                />

                <div className="flex items-center justify-between pt-6">
                    <button
                        onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
                        className={`text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
                    >
                        Go Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!answers[currentQ.id]}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-[0] disabled:opacity-50 transition-all"
                    >
                        {currentStep === totalSteps - 1 ? 'Launch Akki OS' : 'Next Question'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

