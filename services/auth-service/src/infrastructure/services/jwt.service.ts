
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/main/config/env';
import { IJwtTokenService } from '@/core/interfaces/jwtToken.service.interface';

export interface AccessTokenPayload {
    sub: string; // userId
    email: string;
}

export interface RefreshTokenPayload {
    sub: string; // userId
    tokenId: string;
}


export class JwtTokenService implements IJwtTokenService {
    // Generate Access Token
    signAccessToken(payload: AccessTokenPayload): string {
        return jwt.sign(
            payload,
            env.JWT_ACCESS_SECRET,
            { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions
        );
    }

    // Generate Refresh Token
    signRefreshToken(payload: RefreshTokenPayload): string {
        return jwt.sign(
            payload,
            env.JWT_REFRESH_SECRET,
            { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions
        );
    }

    // Verify Refresh Token
    verifyRefreshToken(token: string): RefreshTokenPayload {
        return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    }
}
