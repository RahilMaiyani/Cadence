import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { User } from "../models/User";

interface JwtPayload {
    userId: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization?.split(" ")[1];
        }

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Authentication required. Please log in."
            });
            return;
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({
                success: false,
                message: "User for this token doesn't exist"
            });
            return;
        }

        req.user = user;
        next();

    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Your session has expired. Please log in again.',
            });
            return;
        }
        res.status(401).json({
            success: false,
            message: 'Invalid authentication token.',
        });
    }
};