'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/api';
import { Calendar, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeatmapDay {
    date: string;
    count: number;
}

interface HeatmapResponse {
    success: boolean;
    rangeDays: number;
    startDate: string;
    data: HeatmapDay[];
}

interface DateDetailsResponse {
    success: boolean;
    date: string;
    count: number;
    habits: Array<{
        habitID: string;
        title: string;
        category: string;
        color: string;
        icon: string;
        note: string;
        completedAt?: string;
    }>;
}

interface DynamicHeatmapProps {
    initialData?: {
        rangeDays: number;
        data: HeatmapDay[];
    };
}

export function DynamicHeatmap({ initialData }: DynamicHeatmapProps) {
    const [range, setRange] = useState<30 | 90 | 365>(30);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Auto-fallback: if screen is resized below 1024px (lg breakpoint) and range is 365, fall back to 90D
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && range === 365) {
                setRange(90);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [range]);

    // 1. Fetch heatmap count data for the chosen range
    const { data: heatmapResponse } = useQuery<HeatmapResponse>({
        queryKey: ['heatmap', range],
        queryFn: () => apiRequest<HeatmapResponse>(`/analytics/heatmap?days=${range}`),
        initialData:
            initialData && initialData.rangeDays === range
                ? {
                    success: true,
                    rangeDays: initialData.rangeDays,
                    startDate: '',
                    data: initialData.data,
                }
                : undefined,
        staleTime: 60 * 1000,
    });

    // 2. Lazy fetch drill-down details when a date tile is selected
    const { data: dateDetails, isFetching: isDetailsLoading } = useQuery<DateDetailsResponse>({
        queryKey: ['date-details', selectedDate],
        queryFn: () => apiRequest<DateDetailsResponse>(`/analytics/date/${selectedDate}`),
        enabled: !!selectedDate,
        staleTime: 30 * 1000,
    });

    // 3. Fast O(1) lookup map of date -> count
    const countMap = useMemo(() => {
        const map = new Map<string, number>();
        if (heatmapResponse?.data) {
            heatmapResponse.data.forEach((item) => {
                map.set(item.date, item.count);
            });
        }
        return map;
    }, [heatmapResponse]);

    // 4. Generate calendar grid aligned by weeks (Sun -> Sat)
    const calendarWeeks = useMemo(() => {
        const today = new Date();
        const daysArray: Array<{ date: string; count: number; isToday: boolean; dayOfWeek: number }> =
            [];

        for (let i = range - 1; i >= 0; i--) {
            const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
            d.setUTCDate(d.getUTCDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const isToday = i === 0;

            daysArray.push({
                date: dateStr,
                count: countMap.get(dateStr) || 0,
                isToday,
                dayOfWeek: d.getUTCDay(),
            });
        }

        // Group into 7-day columns (weeks)
        const weeks: typeof daysArray[] = [];
        let currentWeek: typeof daysArray = [];

        // Pad leading days of the first week
        if (daysArray.length > 0) {
            const firstDayOfWeek = daysArray[0].dayOfWeek;
            for (let p = 0; p < firstDayOfWeek; p++) {
                currentWeek.push({
                    date: `pad-start-${p}`,
                    count: -1,
                    isToday: false,
                    dayOfWeek: p,
                });
            }
        }

        daysArray.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }, [range, countMap]);

    const totalRangeCheckIns = useMemo(() => {
        if (!heatmapResponse?.data) return 0;
        return heatmapResponse.data.reduce((acc, curr) => acc + curr.count, 0);
    }, [heatmapResponse]);

    const getCellColor = (count: number, isSelected: boolean) => {
        if (count === -1) return 'opacity-0 pointer-events-none';
        if (isSelected) return 'bg-emerald-400 ring-2 ring-emerald-300 ring-offset-2 ring-offset-zinc-950';

        if (count === 0) {
            return 'bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-600';
        }
        if (count === 1) {
            return 'bg-emerald-950/80 border border-emerald-800/50 hover:border-emerald-600';
        }
        if (count === 2) {
            return 'bg-emerald-700/70 border border-emerald-600/60 hover:border-emerald-400';
        }
        return 'bg-emerald-500 border border-emerald-400 hover:brightness-110 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    };

    const formatDateLabel = (dateStr: string) => {
        try {
            const [y, m, d] = dateStr.split('-').map(Number);
            const date = new Date(Date.UTC(y, m - 1, d));
            return date.toLocaleDateString('en-US', {
                timeZone: 'UTC',
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const isYearView = range === 365;
    const cellSizeClass = isYearView ? 'w-3 h-3 rounded-xs' : 'w-3.5 h-3.5 rounded-[3px]';
    const gridGapClass = isYearView ? 'gap-1' : 'gap-1.5';

    return (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5 backdrop-blur-sm mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-sm font-semibold tracking-tight text-white">Consistency Matrix</h2>
                        <span className="text-[11px] font-mono text-zinc-500">
                            ({totalRangeCheckIns} check-in{totalRangeCheckIns !== 1 ? 's' : ''})
                        </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                        Click any active day to inspect completed habits and reflections.
                    </p>
                </div>

                {/* Range Selector */}
                <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
                    {([30, 90, 365] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => {
                                setRange(r);
                                setSelectedDate(null);
                            }}
                            className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer ${r === 365 ? 'hidden lg:inline-flex' : 'inline-flex'
                                } ${range === r
                                    ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            {r === 365 ? '1 Year' : `${r}D`}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Heatmap */}
            <div className="overflow-x-auto pb-2 scrollbar-none touch-pan-x -mx-2 px-2 sm:mx-0 sm:px-0">
                <div className={`flex ${gridGapClass} min-w-max`}>
                    {calendarWeeks.map((week, weekIdx) => (
                        <div key={weekIdx} className={`flex flex-col ${gridGapClass}`}>
                            {week.map((day) => {
                                const isSelected = selectedDate === day.date;
                                return (
                                    <button
                                        key={day.date}
                                        disabled={day.count <= 0}
                                        onClick={() => setSelectedDate(isSelected ? null : day.date)}
                                        title={
                                            day.count >= 0
                                                ? `${formatDateLabel(day.date)}: ${day.count} completed`
                                                : undefined
                                        }
                                        className={`
                                            ${cellSizeClass} transition-all duration-150 relative group
                                            ${getCellColor(day.count, isSelected)}
                                            ${day.count > 0 ? 'cursor-pointer' : 'cursor-default'}
                                        `}
                                    >
                                        {/* Dot for today */}
                                        {day.isToday && (
                                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Heatmap Legend */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mt-3 pt-3 border-t border-zinc-800/60">
                <span>Recent activity</span>
                <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <span className="w-3 h-3 rounded-xs bg-zinc-900 border border-zinc-800" />
                    <span className="w-3 h-3 rounded-xs bg-emerald-950/80 border border-emerald-800/50" />
                    <span className="w-3 h-3 rounded-xs bg-emerald-700/70 border border-emerald-600/60" />
                    <span className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-400" />
                    <span>More</span>
                </div>
            </div>

            {/* 4. Lazy Date Drill-Down Drawer */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-zinc-800"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-xs font-semibold text-zinc-200">
                                    {formatDateLabel(selectedDate)}
                                </h3>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                                    {dateDetails?.count ?? 0} completed
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {isDetailsLoading ? (
                            <div className="py-4 text-center text-xs text-zinc-500 font-mono">
                                Loading day breakdown...
                            </div>
                        ) : dateDetails?.habits && dateDetails.habits.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {dateDetails.habits.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 flex flex-col gap-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-xs font-medium text-zinc-200">{item.title}</span>
                                            </div>
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                                                {item.category}
                                            </span>
                                        </div>

                                        {item.note && (
                                            <p className="text-[11px] text-zinc-400 italic bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                                                &ldquo;{item.note}&rdquo;
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-500 py-2">No completed habit logs on this date.</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}