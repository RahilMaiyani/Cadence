import { Response } from "express";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const generateTokenAndSetCookie = (
    res: Response,
    userId: mongoose.Types.ObjectId | string
): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured in environment variable");
    }

    const token = jwt.sign({ userId }, secret, {
        expiresIn: '7d',
    });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
}