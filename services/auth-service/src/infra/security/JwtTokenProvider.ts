import { injectable } from 'tsyringe';
import { ITokenProvider } from '@/domain/repositories/ITokenProvider';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env';

/**
 * Infrastructure Layer: JwtTokenProvider
 * Implements token generation using JWT
 */
@injectable()
export class JwtTokenProvider implements ITokenProvider {
    generateAccessToken(payload: object): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        } as SignOptions);
    }

    generateRefreshToken(payload: object): string {
        return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        } as SignOptions);
    }

    getRefreshTokenExpiry(refreshToken: string): Date {
        const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
        return decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now());
    }

    verifyRefreshToken<TPayload extends object = any>(refreshToken: string): TPayload {
        return jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TPayload;
    }
}

