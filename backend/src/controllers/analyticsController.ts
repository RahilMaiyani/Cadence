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
                $lookup: {
                    from: 'habits',
                    localField: 'habitId',
                    foreignField: "_id",
                    as: "habitInfo",
                },
            },
            {
                $unwind: '$habitInfo',
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 },
                    habits: {
                        $push: {
                            habitId: "$habitId",
                            title: "$habitInfo.title",
                            color: "$habitInfo.color",
                            note: "$note",
                            completedAt: '$completedAt',
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1,
                    habits: 1,
                }
            },
            {
                $sort: {
                    date: 1
                }
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