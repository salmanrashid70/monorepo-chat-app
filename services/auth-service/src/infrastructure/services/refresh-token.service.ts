import { IRefreshTokenRepository } from '../database/repositories/refresh-token.repository';
import { inject, injectable } from 'tsyringe';
import { DI_TOKENS } from '../../main/di/tokens';
import { RefreshToken } from '@/core/entities/refreshToken.entity';
import { IRefreshTokenService } from '@/core/interfaces/refreshToken.service.interface';


@injectable()
export class RefreshTokenService implements IRefreshTokenService {
    constructor(
        @inject(DI_TOKENS.RefreshTokenRepository) private readonly repository: IRefreshTokenRepository
    ) { }

    async generate(userId: string): Promise<RefreshToken> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const tokenId = crypto.randomUUID();
        const refreshToken = new RefreshToken(tokenId, userId, expiresAt);
        await this.repository.save(refreshToken);
        return refreshToken;
    }

    async find(tokenId: string, userId: string): Promise<RefreshToken | null> {
        const record = await this.repository.find(tokenId, userId);
        if (!record) return null;
        return record;
    }

    async revoke(token: string): Promise<void> {
        await this.repository.revoke(token);
    }
}

