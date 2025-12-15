import { injectable, inject } from 'tsyringe';
import { IRefreshTokenRepository } from '@/domain/repositories/IRefreshTokenRepository';
import { ITokenProvider } from '@/domain/repositories/ITokenProvider';
import { User } from '@/domain/entities/User';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

/**
 * Application Service: AuthTokenService
 */
@injectable()
export class AuthTokenService {
    constructor(
        @inject('IRefreshTokenRepository') private readonly refreshTokenRepository: IRefreshTokenRepository,
        @inject('ITokenProvider') private readonly tokenProvider: ITokenProvider,
    ) { }

    /**
     * Generates a new access/refresh token pair for the given user,
     */
    async rotateTokensForUser(user: User, transaction?: any): Promise<TokenPair> {
        await this.refreshTokenRepository.deleteByUserId(user.id, transaction);

        const tokenPayload = {
            id: user.id,
            email: user.email,
        };

        const accessToken = this.tokenProvider.generateAccessToken(tokenPayload);

        const refreshToken = this.tokenProvider.generateRefreshToken(tokenPayload);
        const expiresAt = this.tokenProvider.getRefreshTokenExpiry(refreshToken);

        await this.refreshTokenRepository.save(user.id, refreshToken, expiresAt, transaction);

        return { accessToken, refreshToken };
    }
}


