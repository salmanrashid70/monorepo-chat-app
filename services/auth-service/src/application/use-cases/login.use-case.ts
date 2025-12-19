
import { inject, injectable } from 'tsyringe';
import { Email } from '../../core/entities/email.vo';
import { Password } from '../../core/entities/password.vo';
import { IUserRepository } from '../../core/interfaces/user.repository.interface';
import { IPasswordService } from '../../core/interfaces/password.service.interface';
import { IMessageBroker } from '../../core/interfaces/message-broker.interface';
import { InvalidCredentialsError } from '../../core/errors/domain.errors';
import { LoginDTO, AuthResponse } from '../dtos/auth.dtos';
import { DI_TOKENS } from '../../main/di/tokens';
import { LoggerService } from '../../infrastructure/services/logger.service';
import { IJwtTokenService } from '@/core/interfaces/jwtToken.service.interface';
import { IRefreshTokenService } from '@/core/interfaces/refreshToken.service.interface';

@injectable()
export class LoginUseCase {
    constructor(
        @inject(DI_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(DI_TOKENS.PasswordService) private readonly passwordService: IPasswordService,
        @inject(DI_TOKENS.TokenService) private readonly tokenService: IJwtTokenService,
        @inject(DI_TOKENS.MessageBroker) private readonly messageBroker: IMessageBroker,
        @inject(DI_TOKENS.RefreshTokenService) private readonly refreshTokenService: IRefreshTokenService,
        @inject(DI_TOKENS.Logger) private readonly logger: LoggerService
    ) { }

    async execute(dto: LoginDTO): Promise<AuthResponse> {
        try {
            const email = new Email(dto.email);
            const password = new Password(dto.password);

            const user = await this.userRepository.findByEmail(email);

            if (!user) {
                await this.publishAuthFailed(dto.email, 'UserNotFound');
                throw new InvalidCredentialsError();
            }

            const isValid = await this.passwordService.compare(password, user.getPassword().getValue());
            if (!isValid) {
                await this.publishAuthFailed(dto.email, 'InvalidPassword');
                throw new InvalidCredentialsError();
            }

            const accessToken = this.tokenService.signAccessToken({
                sub: user.getId(),
                email: user.getEmail().getValue()
            });

            const createRefreshToken = await this.refreshTokenService.generate(user.getId());
            const refreshToken = createRefreshToken.getTokenId();

            await this.messageBroker.publish('auth.events', {
                event: 'UserLoggedIn',
                data: {
                    userId: user.getId(),
                    email: user.getEmail().getValue(),
                    timestamp: new Date()
                }
            });

            this.logger.info('User logged in successfully', { userId: user.getId() });

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

        } catch (error) {
            if (error instanceof InvalidCredentialsError) {
                throw error;
            }
            throw error;
        }
    }

    private async publishAuthFailed(email: string, reason: string) {
        await this.messageBroker.publish('auth.events', {
            event: 'AuthFailed',
            data: {
                email,
                reason,
                timestamp: new Date()
            }
        });
    }
}

