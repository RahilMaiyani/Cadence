'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { DailyProgress } from '@/components/daily-progress';
import { HabitCard, HabitItem } from '@/components/habit-card';
import { CreateHabitModal } from '@/components/create-habit-modal';
import { Plus, Loader2, Sparkles } from 'lucide-react';
import { DynamicHeatmap } from '@/components/dynamic-heatmap';

interface DashboardResponse {
  success: boolean;
  date: string;
  summary: {
    totalHabits: number;
    completedToday: number;
    completionRate: number;
    isPerfectDay: boolean;
    topStreakHabit?: {
      title: string;
      streak: number;
      color: string;
      icon: string;
    } | null;
    totalCheckInsLifetime: number;
    weeklySparkline: Array<{ date: string; count: number }>;
  };
  habits: HabitItem[];
  heatmap: {
    rangeDays: number;
    data: Array<{ date: string; count: number }>;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isAuthLoading, router]);

  const { data, isLoading } = useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: () => apiRequest<DashboardResponse>('/analytics/dashboard'),
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ habitId, note }: { habitId: string; note?: string }) => {
      const today = new Date().toISOString().split('T')[0];
      return apiRequest(`/habits/${habitId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ date: today, note }),
      });
    },
    onMutate: async ({ habitId }) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });

      const previousDashboard = queryClient.getQueryData<DashboardResponse>(['dashboard']);

      if (previousDashboard) {
        const updatedHabits = previousDashboard.habits.map((h) => {
          if (h._id === habitId) {
            const nextCompleted = !h.isCompleted;
            return {
              ...h,
              isCompleted: nextCompleted,
              currentStreak: nextCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
            };
          }
          return h;
        });

        const completedCount = updatedHabits.filter((h) => h.isCompleted).length;
        const total = updatedHabits.length;

        queryClient.setQueryData<DashboardResponse>(['dashboard'], {
          ...previousDashboard,
          habits: updatedHabits,
          summary: {
            ...previousDashboard.summary,
            completedToday: completedCount,
            completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
          },
        });
      }

      return { previousDashboard };
    },
    onError: (err, variables, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // 4. Create Habit Mutation
  const createMutation = useMutation({
    mutationFn: (habitData: { title: string; category: string; color: string; icon: string }) =>
      apiRequest('/habits', {
        method: 'POST',
        body: JSON.stringify(habitData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isAuthLoading || (isLoading && !data)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <span className="text-xs font-mono tracking-wider uppercase">Loading Cadence...</span>
      </div>
    );
  }

  const habits = data?.habits || [];
  const summary = data?.summary || {
    totalHabits: 0,
    completedToday: 0,
    completionRate: 0,
    isPerfectDay: false,
    topStreakHabit: null,
    totalCheckInsLifetime: 0,
    weeklySparkline: [],
  };

  // Filter habits by category if selected
  const filteredHabits =
    selectedCategory === 'ALL'
      ? habits
      : habits.filter((h) => h.category === selectedCategory);

  const categories = ['ALL', 'FITNESS', 'HEALTH', 'PRODUCTIVITY', 'LEARNING', 'MINDFULNESS', 'OTHER'];


  return (
    <div className="min-h-screen bg-black opacity-92 text-slate-100 pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-8">
        {/* 1. Daily Progress & Momentum Banner */}
        <DailyProgress
          totalHabits={summary.totalHabits}
          completedToday={summary.completedToday}
          completionRate={summary.completionRate}
          topStreakHabit={summary.topStreakHabit}
          weeklySparkline={summary.weeklySparkline}
        />

        {/* 2. Checklist Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Today&apos;s Habits</h1>
            <p className="text-xs text-slate-400 mt-0.5">Stay consistent. Every rep counts.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Habit</span>
          </button>
        </div>

        {/* 3. Category Filter Tabs */}
        {habits.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* 4. Habits List */}
        {filteredHabits.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">No habits found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {habits.length === 0
                ? 'You haven’t forged any habits yet. Start with one simple routine.'
                : 'No habits match the selected category filter.'}
            </p>
            {habits.length === 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                + Create your first habit
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onToggle={(habitId, note) => toggleMutation.mutateAsync({ habitId, note })}
                isToggling={toggleMutation.isPending}
              />
            ))}
          </div>
        )}

        <DynamicHeatmap />

      </main>

      {/* 5. Create Habit Modal */}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(habitData) => createMutation.mutateAsync(habitData)}
      />
    </div>
  );
}