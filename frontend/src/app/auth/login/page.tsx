'use client';

import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login(email, password);
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['heatmap'] });
            router.push("/");
        }
        catch (err: any) {
            setError(err.message || "Failed to Login")
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative z-10">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-white tracking-tight">Login to your account</h1>
                <p className="text-sm text-slate-400 mt-1">Start building unshakeable consistency today.</p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Email Address
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Login...</span>
                        </>
                    ) : (
                        <>
                            <span>Login</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Register
                </Link>
            </p>
        </div>
    );
}