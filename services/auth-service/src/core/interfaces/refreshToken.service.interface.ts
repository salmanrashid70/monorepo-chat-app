import { RefreshToken } from "../entities/refreshToken.entity";

export interface IRefreshTokenService {
    generate(userId: string): Promise<RefreshToken>;
    find(tokenId: string, userId: string): Promise<RefreshToken | null>;
    revoke(token: string): Promise<void>;
}