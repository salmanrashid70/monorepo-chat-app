import { injectable, inject } from 'tsyringe';
import { IRefreshTokenRepository } from '@/domain/repositories/IRefreshTokenRepository';
import { ITokenProvider } from '@/domain/repositories/ITokenProvider';
import { ITransactionManager } from '@/domain/database/ITransactionManager';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { AuthResponse } from '../dtos/AuthResponse';
import { AuthenticationError, NotFoundError } from '@chatapp/common';
import { AuthTokenService } from '../services/AuthTokenService';

@injectable()
export class RefreshTokenUseCase {
    constructor(
        @inject('IRefreshTokenRepository') private readonly refreshTokenRepository: IRefreshTokenRepository,
        @inject('ITokenProvider') private readonly tokenProvider: ITokenProvider,
        @inject('ITransactionManager') private readonly transactionManager: ITransactionManager,
        @inject('IUserRepository') private readonly userRepository: IUserRepository,
        @inject(AuthTokenService) private readonly authTokenService: AuthTokenService,
    ) { }

    async execute(refreshToken: string): Promise<AuthResponse> {
        // Verify signature and extract payload
        let payload: any;
        try {
            payload = this.tokenProvider.verifyRefreshToken(refreshToken);
        } catch (err) {
            throw new AuthenticationError('Invalid refresh token');
        }

        // Ensure token exists in DB
        const stored = await this.refreshTokenRepository.findByToken(refreshToken);
        if (!stored) {
            throw new AuthenticationError('Refresh token not found');
        }

        // Check expiry
        if (stored.isExpired()) {
            // remove expired token
            await this.refreshTokenRepository.deleteByUserId(stored.userId);
            throw new AuthenticationError('Refresh token expired');
        }

        // Load user
        const user = await this.userRepository.findById(payload.id || stored.userId);
        if (!user) throw new NotFoundError('User not found');

        // Rotate tokens inside a transaction
        const result = await this.transactionManager.executeInTransaction(async (transaction) => {
            const tokens = await this.authTokenService.rotateTokensForUser(user, transaction);
            return tokens;
        });

        const userData = {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };

        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: userData,
        };
    }
}
