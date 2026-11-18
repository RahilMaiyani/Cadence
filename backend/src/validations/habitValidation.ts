import { z } from 'zod';

export const createHabitSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title cannot exceed 100 characters")
        .trim(),
    description: z.string().max(500).optional().default(""),
    category: z
        .enum(['FITNESS', 'HEALTH', 'PRODUCTIVITY', 'LEARNING', 'MINDFULNESS', 'OTHER'])
        .optional()
        .default('OTHER'),
    color: z.string().optional().default('emerald'),
    icon: z.string().optional().default('check'),
});

export const updateHabitSchema = createHabitSchema.partial();

export const toggleHabitSchema = z.object({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type ToggleHabitInput = z.infer<typeof toggleHabitSchema>;