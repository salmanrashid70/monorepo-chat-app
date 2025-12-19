import 'dotenv/config';

import { createEnv, z } from '@chatapp/common';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    AUTH_SERVICE_PORT: z.coerce.number().int().min(0).max(65535).default(4000),

    MYSQL_HOST: z.string().min(1),
    MYSQL_PORT: z.coerce.number().int().min(0).max(65535).default(3306),
    MYSQL_USER: z.string().min(1),
    MYSQL_PASSWORD: z.string().min(1),
    MYSQL_DATABASE: z.string().min(1),
    MYSQL_ROOT_PASSWORD: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

    RABBITMQ_URL: z.string(),
    // INTERNAL_API_TOKEN: z.string().min(32),
});

type EnvType = z.infer<typeof envSchema>;

export const env: EnvType = createEnv(envSchema, {
    serviceName: 'auth-service',
});

export type Env = typeof env;
