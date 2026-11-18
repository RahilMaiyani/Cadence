import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be atleast 2 characters long")
        .max(50, "Name cannot exceed 50 characters")
        .trim(),
    email: z
        .string()
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password is too long"),
    timezone: z.string()
        .optional()
        .default("UTC"),
});

export const loginSchema = z.object({
    email: z
        .string()
        .toLowerCase()
        .trim(),
    password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>