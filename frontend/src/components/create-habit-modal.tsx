'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Plus,
    Loader2,
    Dumbbell,
    BookOpen,
    Droplet,
    Code,
    Heart,
    Sun,
    Check,
} from 'lucide-react';

interface CreateHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (habitData: {
        title: string;
        category: string;
        color: string;
        icon: string;
    }) => Promise<void>;
}

const CATEGORIES = [
    'FITNESS',
    'HEALTH',
    'PRODUCTIVITY',
    'LEARNING',
    'MINDFULNESS',
    'OTHER',
];

const COLORS = [
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-400' },
    { id: 'red', label: 'Red', bg: 'bg-red-500' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
    { id: 'orange', label: 'Orange', bg: 'bg-orange-500' },
    { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
    { id: 'yellow', label: 'Yellow', bg: 'bg-yellow-500' },
];

const ICONS = [
    { id: 'dumbbell', icon: Dumbbell, label: 'Workout' },
    { id: 'heart', icon: Heart, label: 'Health' },
    { id: 'check', icon: Check, label: 'Generic' },
    { id: 'book-open', icon: BookOpen, label: 'Reading' },
    { id: 'sun', icon: Sun, label: 'Mindset' },
    { id: 'droplet', icon: Droplet, label: 'Water' },
    { id: 'code', icon: Code, label: 'Coding' },
];

export function CreateHabitModal({ isOpen, onClose, onCreate }: CreateHabitModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('PRODUCTIVITY');
    const [color, setColor] = useState('emerald');
    const [icon, setIcon] = useState('check');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await onCreate({ title, category, color, icon });
            setTitle('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="w-full max-w-md bg-zinc-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl relative z-10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white tracking-tight">Forge a New Habit</h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title Input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Habit Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Read 20 Pages, Morning Gym"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>


                            {/* Description Input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Description
                                </label>

                                <textarea
                                    // type="textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={500}
                                    placeholder="e.g. Read any self help book for 30min or at least 10 pages in a day at any time"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl max-h-66 min-h-20 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                                >
                                </textarea>
                            </div>

                            {/* Category Select */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Color Swatches */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Color Theme
                                </label>
                                <div className="flex items-center gap-3">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setColor(c.id)}
                                            className={`w-7 h-7 rounded-full ${c.bg} transition-all cursor-pointer ${color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Icon Picker */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Icon
                                </label>
                                <div className="grid grid-cols-7 gap-2">
                                    {ICONS.map((item) => {
                                        const IconComp = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setIcon(item.id)}
                                                className={`h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${icon === item.id
                                                    ? 'bg-slate-800 border-emerald-500/50 text-emerald-400'
                                                    : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                <IconComp className="w-4 h-4" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !title.trim()}
                                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        <span>Create Habit</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}