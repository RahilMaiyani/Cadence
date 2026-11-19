import { Flame } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Flame className="w-6 h-6 fill-emerald-500/20" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white font-sans">Cadence</span>
            </div>

            {children}
        </div>
    )
}