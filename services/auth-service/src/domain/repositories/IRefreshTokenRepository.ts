import { RefreshToken } from '@/domain/entities/RefreshToken';

export interface IRefreshTokenRepository {
    save(userId: string, token: string, expiresAt: Date, transaction?: any): Promise<RefreshToken>;
    deleteByUserId(userId: string, transaction?: any): Promise<void>;
    findByToken(token: string): Promise<RefreshToken | null>;
}
