import { inject, injectable } from "tsyringe";
import { AuthResponse, RefreshTokenDTO } from "../dtos/auth.dtos";
import { DI_TOKENS } from "@/main/di/tokens";
import { IUserRepository } from "@/core/interfaces/user.repository.interface";
import { AuthenticationError } from "@chatapp/common";
import { LoggerService } from "@/infrastructure/services/logger.service";
import { IJwtTokenService } from "@/core/interfaces/jwtToken.service.interface";
import { IRefreshTokenService } from "@/core/interfaces/refreshToken.service.interface";

@injectable()
export class RefreshTokenUseCase {
    constructor(
        @inject(DI_TOKENS.RefreshTokenService) private readonly refreshTokenService: IRefreshTokenService,
        @inject(DI_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(DI_TOKENS.TokenService) private readonly tokenService: IJwtTokenService,
        @inject(DI_TOKENS.Logger) private readonly logger: LoggerService
    ) { }

    async execute(dto: RefreshTokenDTO): Promise<AuthResponse> {
        // Verify incoming refresh token (returns userId if valid)
        const payload = this.tokenService.verifyRefreshToken(dto.refreshToken);

        // Fetch user
        const tokenRecord = await this.refreshTokenService.find(payload.tokenId, payload.sub);

        if (!tokenRecord) {
            throw new AuthenticationError('Invalid or expired refresh token');
        }

        if (tokenRecord.isExpired()) {
            // Revoke old refresh token
            await this.refreshTokenService.revoke(payload.tokenId);
            throw new AuthenticationError('Invalid or expired refresh token');
        }

        // Fetch user
        const user = await this.userRepository.findById(payload.sub);

        if (!user) {
            this.logger.error('User missing for refresh token', { userId: payload.sub });
            throw new AuthenticationError('User not found');
        }

        // Revoke old refresh token
        await this.refreshTokenService.revoke(payload.tokenId);

        // Generate new tokens
        const accessToken = this.tokenService.signAccessToken({ sub: user.getId(), email: user.getEmail().getValue() });
        const createRefreshToken = await this.refreshTokenService.generate(user.getId());

        const refreshToken = this.tokenService.signRefreshToken({ sub: user.getId(), tokenId: createRefreshToken.getTokenId() });

        this.logger.info('Token refreshed successfully', { userId: user.getId() });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.getId(),
                email: user.getEmail().getValue(),
                displayName: user.getDisplayName(),
                createdAt: user.getCreatedAt(),
                updatedAt: user.getUpdatedAt()
            }
        };
    }
}