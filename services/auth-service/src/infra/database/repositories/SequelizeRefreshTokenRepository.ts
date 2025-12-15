import { injectable } from 'tsyringe';
import { IRefreshTokenRepository } from '@/domain/repositories/IRefreshTokenRepository';
import { RefreshToken as RefreshTokenModel } from '@/infra/database/models';
import { RefreshToken } from '@/domain/entities/RefreshToken';
import { Transaction } from 'sequelize';

@injectable()
export class SequelizeRefreshTokenRepository implements IRefreshTokenRepository {
    async save(userId: string, token: string, expiresAt: Date, transaction?: Transaction): Promise<RefreshToken> {
        const model = await RefreshTokenModel.create<RefreshTokenModel>({
            userId,
            tokenId: token,
            expiresAt,
        }, { transaction });

        return new RefreshToken(
            model.id,
            model.userId,
            model.tokenId,
            model.expiresAt,
            model.createdAt,
            model.updatedAt,
        );
    }

    async deleteByUserId(userId: string, transaction?: Transaction): Promise<void> {
        await RefreshTokenModel.destroy({
            where: { userId },
            transaction
        });
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        const model = await RefreshTokenModel.findOne({ where: { tokenId: token } });

        if (!model) return null;

        return new RefreshToken(
            model.id,
            model.userId,
            model.tokenId,
            model.expiresAt,
            model.createdAt,
            model.updatedAt,
        );
    }
}
