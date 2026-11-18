import { Request, Response } from "express";
import { success } from "zod";
import { Habit } from "../models/Habit";
import { HabitLog } from "../models/HabitLog";

export const getHabits = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        const targetDate = (req.query.date as string || new Date().toISOString().split("T")[0]);

        const habits = await Habit.find({ userId, isArchived: false }).sort({
            createdAt: -1,
        });

        const logs = await HabitLog.find({
            userId,
            date: targetDate,
        });

        const logMap = new Map<string, { note: string; completedAt: Date }>();
        logs.forEach((log) => {
            logMap.set(log.habitId.toString(), {
                note: log.note || "",
                completedAt: log.completedAt,
            });
        });

        const habitsWithStatus = habits.map((habit) => {
            const logInfo = logMap.get(habit._id.toString());
            return {
                ...habit.toObject(),
                isCompleted: !!logInfo,
                log: logInfo || null,
            };
        });

        res.status(200).json({
            success: true,
            count: habitsWithStatus.length,
            date: targetDate,
            habit: habitsWithStatus,
        });
    }
    catch (err) {
        console.error('getHabits error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch habits' });
    }
};