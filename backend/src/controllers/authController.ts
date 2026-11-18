import { Request, Response } from "express";
import { User } from "../models/User";
import { generateTokenAndSetCookie } from "../utils/token";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, timezone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "An account with this email is already registered",
            });
            return;
        }

        const user = await User.create({
            name,
            email,
            password,
            timezone: timezone || 'UTC',
        });

        generateTokenAndSetCookie(res, user._id);

        res.status(200).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                timezone: user.timezone,
                createdAt: user.createdAt,
            },
        });
    }
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
            error: err,
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        generateTokenAndSetCookie(res, user._id);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                timezone: user.timezone,
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: "Server error during login",
            error: err,
        });
    }
}

export const logout = (req: Request, res: Response): void => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', "", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 0
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

export const getMe = (req: Request, res: Response): void => {
    const user = req.user;
    if (!user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }
    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            timezone: user.timezone,
            createdAt: user.createdAt,
        },
    });
};