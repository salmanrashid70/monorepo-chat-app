import { inject, injectable } from "tsyringe";
import { DI_TOKENS } from "@/main/di/tokens";
import { LoggerService } from "@/infrastructure/services/logger.service";
import { IJwtTokenService } from "@/core/interfaces/jwtToken.service.interface";
import { IRefreshTokenService } from "@/core/interfaces/refreshToken.service.interface";

@injectable()
export class SignOutUseCase {
    constructor(
        @inject(DI_TOKENS.RefreshTokenService) private readonly refreshTokenService: IRefreshTokenService,
        @inject(DI_TOKENS.TokenService) private readonly tokenService: IJwtTokenService,
        @inject(DI_TOKENS.Logger) private readonly logger: LoggerService
    ) { }

    async execute(refreshToken: string): Promise<void> {
        if (!refreshToken) {
            return;
        }

        try {
            // Verify token to get tokenId (ignoring expiration if we just want to revoke it, 
            // but for security we usually only revoke valid-ish tokens. 
            // However, if it's expired, it might already be gone or we just want to ensure it's gone.)
            // We'll wrap in try-catch because verify might throw if expired/invalid
            const payload = this.tokenService.verifyRefreshToken(refreshToken);

            if (payload && payload.tokenId) {
                await this.refreshTokenService.revoke(payload.tokenId);
                this.logger.info('Signout successful: Refresh token revoked', { userId: payload.sub, tokenId: payload.tokenId });
            }
        } catch (error) {
            // If token is invalid or expired, we can just ignore it for signout purposes
            // as the client is clearing their cookies anyway.
            this.logger.warn('Signout suspected with invalid/expired token', { error: (error as Error).message });
        }
    }
}
