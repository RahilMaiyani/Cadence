import mongoose, { Schema, Model, Document } from "mongoose";

export type HabitCategory =
    'FITNESS'
    | 'HEALTH'
    | 'PRODUCTIVITY'
    | 'LEARNING'
    | 'MINDFULNESS'
    | 'OTHER';

export interface IHabit extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: HabitCategory;
    color: string;
    icon: string;
    currentStreak: number;
    longestStreak: number;
    isArchived: boolean;
    lastCompletedDate: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const habitSchema = new Schema<IHabit>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "User ID is required"],
            index: true,
        },
        title: {
            type: String,
            required: [true, "Habit title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characers"],
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        category: {
            type: String,
            enum: ['FITNESS', 'HEALTH', 'PRODUCTIVITY', 'LEARNING', 'MINDFULNESS', 'OTHER'],
            default: "OTHER"
        },
        color: {
            type: String,
            default: 'emerald'
        },
        icon: {
            type: String,
            default: "check",
        },
        currentStreak: {
            type: Number,
            default: 0,
            min: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
            min: 0
        },
        lastCompletedDate: {
            type: String,
            default: null,
        },
        isArchived: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

habitSchema.index({ userId: 1, isArchived: 1 });

export const Habit: Model<IHabit> = mongoose.model<IHabit>("Habit", habitSchema);