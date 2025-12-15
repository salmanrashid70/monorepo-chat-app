import { z } from "@chatapp/common";

export const registerValidationSchema = {
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        displayName: z.string().min(1, 'Display name is required'),
    })
};

export const loginValidationSchema = {
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
    })
}