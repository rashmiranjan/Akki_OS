"use client";
import { setLocalAuthToken } from "@/auth/localAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Verify Gateway Token against backend
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/users/me`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.ok) {
                setLocalAuthToken(token);
                router.push("/dashboard");
            } else {
                setError("Invalid Gateway Token. Check your .env file.");
            }
        } catch {
            setError("Cannot reach backend. Is it running?");
        }

        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md space-y-8 rounded-2xl bg-white/5 backdrop-blur-xl p-10 shadow-2xl border border-white/10">
                {/* Logo */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-3xl">🦅</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Akki OS</h1>
                    <p className="text-sm text-slate-400">Your Autonomous Brand Operating System</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Gateway Token
                        </label>
                        <input
                            type="password"
                            required
                            autoFocus
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter your gateway password..."
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-slate-500">
                            Same token you set during <code className="text-indigo-400">install.bat</code> setup
                        </p>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="w-full flex justify-center items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-4 text-sm font-semibold text-white disabled:opacity-50 transition-all duration-200 shadow-lg shadow-indigo-500/25"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Verifying...
                            </>
                        ) : (
                            "Enter OS →"
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 pt-2">
                    Akki OS · Personal Branding Operating System
                </p>
            </div>
        </div>
    );
}
