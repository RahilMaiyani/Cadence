import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    timezone: string;
    createdAt: Date;
    updatedtAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, 'Name must be atleast 2 characters long'],
            maxlength: [50, 'Name cannor exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide valid email."],
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, "Password must valid length"],
            select: false,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
    },
    { timestamps: true },
);

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);