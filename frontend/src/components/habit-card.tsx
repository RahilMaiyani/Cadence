'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    Flame,
    MessageSquare,
    Dumbbell,
    BookOpen,
    Droplet,
    Code,
    Heart,
    Sun,
    Sparkles,
} from 'lucide-react';

export interface HabitItem {
    _id: string;
    title: string;
    description?: string;
    category: string;
    color: string;
    icon: string;
    currentStreak: number;
    longestStreak: number;
    isCompleted: boolean;
    log?: { note?: string; completedAt?: string } | null;
}

interface HabitCardProps {
    habit: HabitItem;
    onToggle: (habitId: string, note?: string) => Promise<void>;
    isToggling?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
    dumbbell: Dumbbell,
    'book-open': BookOpen,
    droplet: Droplet,
    code: Code,
    heart: Heart,
    sun: Sun,
    check: Check,
};

const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
    emerald: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
    },
    indigo: {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/20',
    },
    rose: {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
    },
    amber: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
    },
    cyan: {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/20',
    },
};

export function HabitCard({ habit, onToggle, isToggling }: HabitCardProps) {
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [note, setNote] = useState(habit.log?.note || '');

    const IconComponent = iconMap[habit.icon] || Sparkles;
    const color = colorStyles[habit.color] || colorStyles.emerald;

    const handleToggle = () => {
        onToggle(habit._id, note);
    };

    const handleNoteSave = () => {
        if (habit.isCompleted) {
            onToggle(habit._id, note);
        }
        setShowNoteInput(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNoteSave();
        } else if (e.key === 'Escape') {
            setShowNoteInput(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`
        group relative rounded-xl border p-4 backdrop-blur-sm transition-all duration-200
        ${habit.isCompleted
                    ? 'bg-zinc-900/20 border-zinc-800/50'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                }
      `}
        >
            <div className="flex items-center justify-between gap-4">
                {/* Left: Icon & Habit Information */}
                <div className="flex items-center gap-3.5 min-w-0">
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${color.bg} ${color.text} ${color.border}`}
                    >
                        <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                        <h3
                            className={`text-sm font-medium tracking-tight truncate transition-all duration-150 ${habit.isCompleted
                                ? 'text-zinc-500 line-through'
                                : 'text-zinc-100 group-hover:text-white'
                                }`}
                        >
                            {habit.title}
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                            {/* Streak Badge */}
                            <div
                                className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border ${habit.currentStreak > 0
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-semibold'
                                    : 'bg-zinc-800/60 text-zinc-500 border-zinc-800'
                                    }`}
                            >
                                <Flame
                                    className={`w-3 h-3 ${habit.currentStreak > 0 ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'}`}
                                />
                                <span>{habit.currentStreak}d</span>
                            </div>

                            {/* Note preview if attached */}
                            {habit.log?.note && !showNoteInput && (
                                <span className="text-[11px] text-zinc-400 truncate max-w-40 italic">
                                    &ldquo;{habit.log.note}&rdquo;
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Note toggle button */}
                    <button
                        onClick={() => setShowNoteInput(!showNoteInput)}
                        title="Add reflection note"
                        aria-label="Add reflection note"
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${habit.log?.note
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                            : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                            }`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={handleToggle}
                        disabled={isToggling}
                        aria-label={habit.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                        className={`
              w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 cursor-pointer
              ${habit.isCompleted
                                ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                                : 'bg-zinc-950/60 border-zinc-800 text-transparent hover:border-zinc-600 hover:text-zinc-600'
                            }
            `}
                    >
                        <motion.div
                            initial={false}
                            animate={{ scale: habit.isCompleted ? 1 : 0.7 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            <Check className={`w-4 h-4 ${habit.isCompleted ? 'stroke-3' : ''}`} />
                        </motion.div>
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {showNoteInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden pt-3 mt-3 border-t border-zinc-800/60"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Micro reflection... (Enter to save)"
                                className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-base sm:text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                autoFocus
                            />
                            <button
                                onClick={handleNoteSave}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-700/60 transition-colors cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}