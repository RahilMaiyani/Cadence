'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Flame, CheckCircle2, Trophy, Target } from 'lucide-react';

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
                //     particleCount: 70,
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

    const isComplete = totalHabits > 0 && completedToday >= totalHabits;

    return (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-md mb-6 sm:mb-8">
            {/* Top Row: Title & Key Stat Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Today&apos;s Momentum</h2>
                        {isComplete && (
                            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> All Done
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 font-sans">
                        {totalHabits === 0
                            ? 'No habits active. Create your first routine below.'
                            : `${completedToday} of ${totalHabits} completed`}
                    </p>
                </div>

                {/* Quick Stats Badges */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start sm:self-auto font-mono text-[11px] sm:text-xs">
                    {/* Ratio Badge */}
                    <div className="bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 text-zinc-300">
                        <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-500" />
                        <span>{completedToday}/{totalHabits}</span>
                    </div>

                    {/* Rate Badge */}
                    <div className="bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span>{completionRate}%</span>
                    </div>

                    {/* Top Streak Badge */}
                    {topStreakHabit && topStreakHabit.streak > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 text-amber-400 font-bold" title={topStreakHabit.title}>
                            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                            <span>{topStreakHabit.streak}d</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative w-full h-2 sm:h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80">
                <div
                    style={{ width: `${completionRate}%` }}
                    className={`h-full transition-all duration-500 ease-out rounded-full ${isComplete
                        ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                        : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        }`}
                />
            </div>

            {weeklySparkline.length > 0 && (
                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                        7-Day History
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2">
                        {weeklySparkline.map((day) => {
                            const dayLetter = new Intl.DateTimeFormat('en-US', { weekday: 'narrow' }).format(
                                new Date(day.date)
                            );
                            const hasActivity = day.count > 0;

                            return (
                                <div key={day.date} className="flex flex-col items-center gap-0.5 sm:gap-1" title={`${day.date}: ${day.count} completed`}>
                                    <div
                                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center text-[9px] sm:text-[10px] font-mono transition-all border ${hasActivity
                                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                                            }`}
                                    >
                                        {day.count}
                                    </div>
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{dayLetter}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}