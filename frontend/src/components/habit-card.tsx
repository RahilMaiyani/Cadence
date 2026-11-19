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

const colorStyles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    emerald: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/20',
    },
    indigo: {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/20',
        glow: 'shadow-indigo-500/20',
    },
    rose: {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        glow: 'shadow-rose-500/20',
    },
    amber: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        glow: 'shadow-amber-500/20',
    },
    cyan: {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/20',
        glow: 'shadow-cyan-500/20',
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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        bg-slate-900/50 border rounded-2xl p-4 transition-all duration-200 backdrop-blur-sm
        ${habit.isCompleted
                    ? 'border-slate-800 bg-slate-900/30'
                    : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                }
      `}
        >
            <div className="flex items-center justify-between gap-4">
                {/* Left: Icon & Habit Information */}
                <div className="flex items-center gap-3.5 min-w-0">
                    <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${color.bg} ${color.text} ${color.border}`}
                    >
                        <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                        <h3
                            className={`text-sm font-semibold tracking-tight truncate transition-all ${habit.isCompleted ? 'text-slate-500 line-through' : 'text-white'
                                }`}
                        >
                            {habit.title}
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                            {/* Streak Badge */}
                            <div
                                className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border ${habit.currentStreak > 0
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold'
                                    : 'bg-slate-800/60 text-slate-500 border-slate-800'
                                    }`}
                            >
                                <Flame className={`w-3 h-3 ${habit.currentStreak > 0 ? 'fill-amber-400' : ''}`} />
                                <span>{habit.currentStreak}d</span>
                            </div>

                            {/* Note indicator if one exists */}
                            {habit.log?.note && !showNoteInput && (
                                <span className="text-[11px] text-slate-400 truncate max-w-[160px] italic">
                                    "{habit.log.note}"
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions (Note Button & Checkmark) */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Note Toggle Button */}
                    <button
                        onClick={() => setShowNoteInput(!showNoteInput)}
                        title="Add a reflection note"
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${habit.log?.note
                            ? 'bg-slate-800 border-slate-700 text-slate-300'
                            : 'border-transparent text-slate-600 hover:text-slate-400 hover:bg-slate-800/50'
                            }`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    {/* Animated Checkbox Button */}
                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={`
              w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer
              ${habit.isCompleted
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-950/60 border-slate-800 text-transparent hover:border-slate-600 hover:text-slate-600'
                            }
            `}
                    >
                        <Check
                            className={`w-5 h-5 transition-transform duration-200 ${habit.isCompleted ? 'scale-100 stroke-[3]' : 'scale-75'
                                }`}
                        />
                    </motion.button>
                </div>
            </div>

            {/* Expandable Micro-Note Input Drawer */}
            <AnimatePresence>
                {showNoteInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-3 mt-3 border-t border-slate-800/60"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="What did you accomplish today? (Optional)"
                                className="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                            />
                            <button
                                onClick={handleNoteSave}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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