import { Request, Response } from "express";
import { Habit } from "../models/Habit";
import { HabitLog } from "../models/HabitLog";
import { success } from "zod";
import { getYesterday } from "../utils/date";

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

export const createHabit = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const { title, description, category, color, icon } = req.body;

        const habit = await Habit.create({
            userId,
            title,
            description,
            category,
            color,
            icon,
        });

        res.status(200).json({
            success: true,
            message: "Habit created successfully",
            habit,
        });
    }
    catch (err) {
        console.error("Create Habit error:", err);
        res.status(500).json({ success: false, message: "Failed to create habit" })
    }
}

export const updateHabit = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const habit = await Habit.findOneAndUpdate(
            { _id: id, userId },
            { $set: req.body },
            { returnDocument: 'after', runValidators: true }
        );

        if (!habit) {
            res.status(404).json({ success: false, message: "Habit not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Habit updated successfully",
            habit,
        });
    }
    catch (err) {
        console.error("Update Habit error:", err);
        res.status(500).json({ success: false, message: "Failed to update habit" })
    }
}

export const deleteHabit = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const habit = await Habit.findOneAndUpdate(
            { _id: id, userId },
            { $set: { isArchived: true } },
            { returnDocument: 'after' },
        );

        if (!habit) {
            res.status(404).json({
                success: false,
                message: "Habit not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Habit archived successfully",
        });
    }
    catch (err) {
        console.error("Delete habit error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to archive habit"
        })
    }
}

export const toggleHabit = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { date, note } = req.body;
        const userId = req.user?._id;

        const habit = await Habit.findOne({ _id: id, userId });
        if (!habit) {
            res.status(404).json({ success: false, message: "Habit not found" });
            return;
        }

        const existingLog = await HabitLog.findOne({
            habitId: habit._id,
            date,
        });

        if (existingLog) {
            await HabitLog.findByIdAndDelete(existingLog._id);

            if (habit.lastCompletedDate === date) {
                const latestRemainingLog = await HabitLog.findOne({
                    habitId: habit._id,
                }).sort({ date: -1 });

                if (!latestRemainingLog) {
                    habit.currentStreak = 0;
                    habit.lastCompletedDate = null;
                }
                else {
                    const yesterday = getYesterday(date);
                    if (latestRemainingLog.date === yesterday) {
                        habit.currentStreak = Math.max(0, habit.currentStreak - 1);
                    }
                    else {
                        habit.currentStreak = 1;
                    }
                    habit.lastCompletedDate = latestRemainingLog.date;
                }
            }

            await habit.save();

            res.status(200).json({
                success: true,
                message: "Habit unchecked",
                isCompleted: false,
                currentStreak: habit.currentStreak,
                longestStreak: habit.longestStreak,
            });
            return;
        }

        const log = await HabitLog.create({
            userId,
            habitId: habit._id,
            date,
            note: note || "",
            completedAt: new Date(),
        });

        const yesterday = getYesterday(date);

        if (habit.lastCompletedDate === yesterday) {
            habit.currentStreak += 1;
        }
        else if (habit.lastCompletedDate === date) { }
        else {
            habit.currentStreak = 1;
        }

        habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
        habit.lastCompletedDate = date;

        await habit.save();

        res.status(200).json({
            success: true,
            message: "Habit completed!",
            isCompleted: true,
            currentStreak: habit.currentStreak,
            longestStreak: habit.longestStreak,
            log: {
                note: log.note,
                completedAt: log.completedAt,
            },
        });
    }
    catch (err) {
        console.error("Toggle Habit error: ", err);
        res.status(500).json({
            success: false,
            message: "Failed to toggle habit",
        });
    }
}