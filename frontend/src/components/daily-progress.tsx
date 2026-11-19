'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Trophy, CheckCircle2 } from 'lucide-react';

interface DailyProgressProps {
    totalHabits: number;
    completedToday: number;
    completionRate: number;
    topStreakHabit?: {
        title: string;
        streak: number;
        color: string;
    } | null;
    weeklySparkline?: Array<{ date: string; count: number }>;
}

export function DailyProgress({
    totalHabits,
    completedToday,
    completionRate,
    topStreakHabit,
    weeklySparkline = [],
}: DailyProgressProps) {
    const hasTriggeredConfetti = useRef(false);

    useEffect(() => {
        if (totalHabits > 0 && completedToday === totalHabits) {
            if (!hasTriggeredConfetti.current) {
                // confetti({
                //     particleCount: 80,
                //     spread: 60,
                //     origin: { y: 0.6 },
                //     colors: ['#10b981', '#34d399', '#6ee7b7', '#3b82f6'],
                // });
                hasTriggeredConfetti.current = true;
            }
        } else {
            hasTriggeredConfetti.current = false;
        }
    }, [completedToday, totalHabits]);

    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completionRate / 100) * circumference;

    return (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl mb-8 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                className="stroke-slate-800"
                                strokeWidth="6"
                                fill="transparent"
                            />
                            {/* Active Progress Fill */}
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                className="stroke-emerald-400 transition-all duration-700 ease-out"
                                strokeWidth="6"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </svg>

                        {/* Percentage Text in Center */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                            <span className="text-sm font-bold text-white">{completionRate}%</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white tracking-tight">Daily Momentum</h2>
                            {completionRate === 100 && (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" /> Done
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {totalHabits === 0
                                ? 'No habits created yet. Click "New Habit" to start.'
                                : `${completedToday} of ${totalHabits} habits completed today`}
                        </p>

                        {/* Top streak highlight */}
                        {topStreakHabit && topStreakHabit.streak > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-amber-400">
                                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                                <span>
                                    Top Streak: <strong className="text-white">{topStreakHabit.title}</strong> ({topStreakHabit.streak} days)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Last 7 Days Mini Sparkline */}
                {weeklySparkline.length > 0 && (
                    <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                            Last 7 Days
                        </span>
                        <div className="flex items-end gap-1.5 h-10">
                            {weeklySparkline.map((day) => {

                                const dayLetter = new Intl.DateTimeFormat('en-US', { weekday: 'narrow' }).format(
                                    new Date(day.date)
                                );
                                const maxCount = Math.max(...weeklySparkline.map((d) => d.count), totalHabits || 1);
                                const heightPercent = maxCount > 0 ? Math.max(15, Math.round((day.count / maxCount) * 100)) : 15;
                                return (
                                    <div key={day.date} className="flex flex-col items-center gap-1 group">
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            title={`${day.date}: ${day.count} completed`}
                                            className={`w-3.5 rounded-t-sm transition-all ${(day.count > 0)
                                                ? 'bg-emerald-400/80 group-hover:bg-emerald-300'
                                                : 'bg-slate-800 group-hover:bg-slate-700'
                                                }`}
                                        />
                                        <span className="text-[10px] font-mono text-slate-500">{dayLetter}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}