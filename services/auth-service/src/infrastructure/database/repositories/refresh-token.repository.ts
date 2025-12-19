import { RefreshTokenModel } from '../models/refresh-token.model';
import { RefreshToken } from '@/core/entities/refreshToken.entity';

export interface IRefreshTokenRepository {
    save(token: RefreshToken): Promise<void>;
    find(tokenId: string, userId: string): Promise<RefreshToken | null>;
    revoke(tokenId: string): Promise<void>;
}

export class SequelizeRefreshTokenRepository implements IRefreshTokenRepository {
    async save(token: RefreshToken): Promise<void> {
        await RefreshTokenModel.create({
            tokenId: token.getTokenId(),
            userId: token.getUserId(),
            expiresAt: token.getExpiresAt()
        });
    }

    async find(tokenId: string, userId: string): Promise<RefreshToken | null> {
        const record = await RefreshTokenModel.findOne({ where: { tokenId, userId } });

        if (!record) return null;
        return this.toDomain(record);
    }

    async revoke(tokenId: string): Promise<void> {
        await RefreshTokenModel.destroy({ where: { tokenId } });
    }

    private toDomain(model: RefreshTokenModel): RefreshToken {
        return new RefreshToken(
            model.tokenId,
            model.userId,
            model.expiresAt,
            model.createdAt
        );
    }
}
