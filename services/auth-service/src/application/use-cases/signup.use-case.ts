
import { inject, injectable } from 'tsyringe';
import { User } from '../../core/entities/user.entity';
import { Email } from '../../core/entities/email.vo';
import { Password } from '../../core/entities/password.vo';
import { IUserRepository } from '../../core/interfaces/user.repository.interface';
import { IPasswordService } from '../../core/interfaces/password.service.interface';
import { IMessageBroker } from '../../core/interfaces/message-broker.interface';
import { UserAlreadyExistsError } from '../../core/errors/domain.errors';
import { SignUpDTO, AuthResponse } from '../dtos/auth.dtos';
import { randomUUID } from 'crypto';
import { DI_TOKENS } from '../../main/di/tokens';
import { LoggerService } from '../../infrastructure/services/logger.service';
import { IJwtTokenService } from '@/core/interfaces/jwtToken.service.interface';
import { IRefreshTokenService } from '@/core/interfaces/refreshToken.service.interface';

@injectable()
export class SignUpUseCase {
    constructor(
        @inject(DI_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(DI_TOKENS.PasswordService) private readonly passwordService: IPasswordService,
        @inject(DI_TOKENS.MessageBroker) private readonly messageBroker: IMessageBroker,
        @inject(DI_TOKENS.RefreshTokenService) private readonly refreshTokenService: IRefreshTokenService,
        @inject(DI_TOKENS.TokenService) private readonly tokenService: IJwtTokenService,
        @inject(DI_TOKENS.Logger) private readonly logger: LoggerService
    ) { }

    async execute(dto: SignUpDTO): Promise<AuthResponse> {
        const email = new Email(dto.email);
        const password = new Password(dto.password);

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new UserAlreadyExistsError(dto.email);
        }

        const hashedPassword = await this.passwordService.hash(password);

        const newUser = new User(
            randomUUID(),
            email,
            dto.displayName,
            new Password(hashedPassword)
        );

        await this.userRepository.save(newUser);

        // Generate Tokens
        const accessToken = this.tokenService.signAccessToken({ sub: newUser.getId(), email: newUser.getEmail().getValue() });
        const createRefreshToken = await this.refreshTokenService.generate(newUser.getId());

        const refreshToken = this.tokenService.signRefreshToken({ sub: newUser.getId(), tokenId: createRefreshToken.getTokenId() });

        // Publish Event
        await this.messageBroker.publish('auth.events', {
            event: 'UserCreated',
            data: {
                userId: newUser.getId(),
                email: newUser.getEmail().getValue(),
                timestamp: new Date()
            }
        });

        // Log
        this.logger.info('User signed up successfully', { userId: newUser.getId() });

        return {
            accessToken,
            refreshToken,
            user: {
                id: newUser.getId(),
                email: newUser.getEmail().getValue(),
                displayName: newUser.getDisplayName(),
                createdAt: newUser.getCreatedAt(),
                updatedAt: newUser.getUpdatedAt()
            }
        };
    }
}

