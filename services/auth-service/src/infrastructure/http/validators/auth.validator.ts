
import { z } from '@chatapp/common';

export const registerSchema = {
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be at most 50 characters'),
    })
};

export const loginSchema = {
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
    })
};

