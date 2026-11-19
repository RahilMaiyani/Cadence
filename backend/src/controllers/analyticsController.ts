import { Request, Response } from "express";
import { getDaysAgo } from "../utils/date";
import { HabitLog } from "../models/HabitLog";
import mongoose from "mongoose";
import { Habit } from "../models/Habit";

export const getHeatmap = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const requestedDays = parseInt(req.query.days as string, 10) || 30;

        const days = Math.min(Math.max(requestedDays, 7), 365);
        const startDate = getDaysAgo(days);

        const heatmap = await HabitLog.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId.toString()),
                    date: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1,
                }
            },
            {
                $sort: { date: 1 },
            },
        ]);

        res.status(200).json({
            success: true,
            rangeDays: days,
            startDate,
            data: heatmap,
        });
    }
    catch (err) {
        console.log("Error while generating heatmap");
        res.status(500).json({
            success: false,
            message: "Failed to generate heatmap",
        });
    }
}

export const getDateDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.params;
        const userId = req.user!._id;

        const logs = await HabitLog.find({ userId, date }).populate(
            {
                path: "habitId",
                select: "title category color icon"
            }
        );

        const completedHabits = logs.map((log: any) => ({
            habitID: log.habitId?._id,
            title: log.habitId?.title || "Unknown Habit",
            category: log.habitId?.category,
            color: log.habitId?.color || 'emerald',
            icon: log.habitId?.icon,
            note: log.note || "",
            completedAt: log.completedAt,
        }));

        res.status(200).json({
            success: true,
            date,
            count: completedHabits.length,
            habits: completedHabits,
        });

    }
    catch (err) {
        console.error("getDateDetails error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch date details"
        });
    }
};

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
        const heatmapDays = parseInt(req.query.days as string, 10) || 30;
        const heatmapStartDate = getDaysAgo(heatmapDays);
        const last7DaysStart = getDaysAgo(6, targetDate); // For 7-day sparkline

        const [
            activeHabits,
            todayLogs,
            topStreakHabit,
            totalCheckInsLifetime,
            weeklyLogs,
            heatmapData,
        ] = await Promise.all([
            // 1. All active habits
            Habit.find({ userId, isArchived: false }).sort({ createdAt: -1 }),

            // 2. Today's completed logs
            HabitLog.find({ userId, date: targetDate }),

            // 3. Top streak habit
            Habit.findOne({ userId, isArchived: false })
                .sort({ currentStreak: -1 })
                .select('title currentStreak color icon'),

            // 4. Lifetime check-ins
            HabitLog.countDocuments({ userId }),

            // 5. Last 7 days check-ins (for mini weekly bar chart)
            HabitLog.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId.toString()),
                        date: { $gte: last7DaysStart, $lte: targetDate },
                    },
                },
                {
                    $group: {
                        _id: '$date',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            // 6. Lean Heatmap counts
            HabitLog.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId.toString()),
                        date: { $gte: heatmapStartDate },
                    },
                },
                {
                    $group: {
                        _id: '$date',
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        count: 1,
                    },
                },
                { $sort: { date: 1 } },
            ]),
        ]);

        const todayLogMap = new Map<string, { note: string; completedAt: Date }>();
        todayLogs.forEach((log) => {
            todayLogMap.set(log.habitId.toString(), {
                note: log.note || '',
                completedAt: log.completedAt,
            });
        });

        const habitsWithStatus = activeHabits.map((habit) => {
            const logInfo = todayLogMap.get(habit._id.toString());
            return {
                ...habit.toObject(),
                isCompleted: !!logInfo,
                log: logInfo || null,
            };
        });

        // Compute progress stats
        const totalHabits = activeHabits.length;
        const completedToday = todayLogs.length;
        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

        const weeklyMap = new Map(weeklyLogs.map((item: any) => [item._id, item.count]));
        const weeklySparkline = [];
        for (let i = 6; i >= 0; i--) {
            const d = getDaysAgo(i, targetDate);
            weeklySparkline.push({
                date: d,
                count: weeklyMap.get(d) || 0,
            });
        }
        res.status(200).json({
            success: true,
            date: targetDate,
            summary: {
                totalHabits,
                completedToday,
                completionRate,
                isPerfectDay: totalHabits > 0 && completedToday >= totalHabits,
                topStreakHabit: topStreakHabit
                    ? {
                        title: topStreakHabit.title,
                        streak: topStreakHabit.currentStreak,
                        color: topStreakHabit.color,
                        icon: topStreakHabit.icon,
                    }
                    : null,
                totalCheckInsLifetime,
                weeklySparkline,
            },
            habits: habitsWithStatus,
            heatmap: {
                rangeDays: heatmapDays,
                data: heatmapData,
            },
        });
    } catch (error: any) {
        console.error('getDashboardData error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
    }
};

export const getHabitAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!._id;

        const requestedDays = parseInt(req.query.days as string, 10) || 90;
        const days = Math.min(Math.max(requestedDays, 7), 365);
        const startDate = getDaysAgo(days);

        const habit = await Habit.findOne({ _id: id, userId });
        if (!habit) {
            res.status(404).json({ success: false, message: 'Habit not found' });
            return;
        }

        const logs = await HabitLog.find({
            habitId: habit._id,
            userId,
            date: { $gte: startDate },
        }).sort({ date: 1 });

        const totalCompletionsAllTime = await HabitLog.countDocuments({
            habitId: habit._id,
            userId,
        });

        res.status(200).json({
            success: true,
            habit: {
                id: habit._id,
                title: habit.title,
                color: habit.color,
                icon: habit.icon,
                currentStreak: habit.currentStreak,
                longestStreak: habit.longestStreak,
                totalCompletions: totalCompletionsAllTime,
            },
            rangeDays: days,
            startDate,
            logs: logs.map((l) => ({
                date: l.date,
                note: l.note,
                completedAt: l.completedAt,
            })),
        });

    } catch (error: any) {
        console.error('getHabitAnalytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch habit analytics' });
    }
};

export const getSummaryStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];

        const totalHabits = await Habit.countDocuments({ userId, isArchived: false });

        const completedToday = await HabitLog.countDocuments({
            userId,
            date: targetDate,
        });

        const topStreakHabit = await Habit.findOne({ userId, isArchived: false })
            .sort({ currentStreak: -1 })
            .select('title currentStreak color');

        const totalCheckInsLifetime = await HabitLog.countDocuments({ userId });
        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

        res.status(200).json({
            success: true,
            date: targetDate,
            totalHabits,
            completedToday,
            completionRate,
            isPerfectDay: totalHabits > 0 && completedToday >= totalHabits,
            topStreakHabit: topStreakHabit
                ? {
                    title: topStreakHabit.title,
                    streak: topStreakHabit.currentStreak,
                    color: topStreakHabit.color,
                }
                : null,
            totalCheckInsLifetime,
        });
    } catch (error: any) {
        console.error('getSummaryStats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch summary stats' });
    }
};