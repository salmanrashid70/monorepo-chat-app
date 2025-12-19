import { AccessTokenPayload, RefreshTokenPayload } from '@/infrastructure/services/jwt.service';

export interface IJwtTokenService {
    signAccessToken(payload: AccessTokenPayload): string;
    signRefreshToken(payload: RefreshTokenPayload): string;
    verifyRefreshToken(token: string): RefreshTokenPayload; // Can be stricter with a TokenPayload VO or interface
}
