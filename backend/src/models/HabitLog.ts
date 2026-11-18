import mongoose, { Document, Schema, Model } from "mongoose";

export interface IHabitLog extends Document {
    userId: mongoose.Types.ObjectId,
    habitId: mongoose.Types.ObjectId,
    date: string;
    note?: string;
    completedAt: Date;
}

const habitlLogSchema = new Schema<IHabitLog>(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        habitId: {
            type: mongoose.Types.ObjectId,
            ref: "Habit",
            required: [true, "Habit ID is required"],
            index: true,
        },
        date: {
            type: String,
            required: [true, "Date string (YYYY-MM-DD) is required"]
        },
        note: {
            type: String,
            trim: true,
            maxlength: [500, "Note cannot exceed 500 characters"],
            default: ""
        },
        completedAt: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: false }
);

habitlLogSchema.index({ habitId: 1, date: 1 }, { unique: true });
habitlLogSchema.index({ userId: 1, date: 1 });

export const HabitLog: Model<IHabitLog> = mongoose.model<IHabitLog>("HabitLog", habitlLogSchema);