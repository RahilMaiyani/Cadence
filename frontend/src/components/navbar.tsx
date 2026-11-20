'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Flame, LogOut, User as UserIcon } from 'lucide-react';

export function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    const formattedToday = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    }).format(new Date());

    return (
        <header className="border-b border-slate-800/80 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Flame className="w-5 h-5 fill-emerald-500/20" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white font-sans">Cadence</span>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-slate-800" />


                    <span className="hidden sm:inline-block text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                        {formattedToday}
                    </span>
                </div>


                <div className="flex items-center gap-3">
                    {user && (
                        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-xl">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-200">{user.name}</span>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        title="Log out"
                        className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}