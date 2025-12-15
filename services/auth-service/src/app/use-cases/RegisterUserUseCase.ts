import { injectable, inject } from 'tsyringe';
import { ConflictError } from '@chatapp/common';
import { User } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { ITransactionManager } from '@/domain/database/ITransactionManager';
import { IPasswordHasher } from '@/domain/repositories/IPasswordHasher';
import { IEventPublisher } from '@/domain/events/IEventPublisher';
import { RegisterUserDTO } from '../dtos/RegisterUserDTO';
import { AuthResponse, UserData } from '../dtos/AuthResponse';
import { randomUUID } from 'crypto';
import { AuthTokenService } from '../services/AuthTokenService';

/**
 * Application Layer: RegisterUserUseCase
 */
@injectable()
export class RegisterUserUseCase {
    constructor(
        @inject('IUserRepository') private readonly userRepository: IUserRepository,
        @inject('ITransactionManager') private readonly transactionManager: ITransactionManager,
        @inject('IPasswordHasher') private readonly passwordHasher: IPasswordHasher,
        @inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
        @inject(AuthTokenService) private readonly authTokenService: AuthTokenService,
    ) { }

    async execute(input: RegisterUserDTO): Promise<AuthResponse> {
        // Check for existing user by email
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new ConflictError('Email already in use');
        }

        // Hash password
        const passwordHash = await this.passwordHasher.hash(input.password);

        // Create user entity
        const user = new User(
            randomUUID(),
            input.email,
            input.displayName,
            passwordHash,
            new Date(),
            new Date()
        );

        // Atomic persistence: create user, generate tokens and store refresh token in a single transaction
        const result = await this.transactionManager.executeInTransaction(async (transaction) => {
            const createdUser = await this.userRepository.create(user, transaction);

            const tokens = await this.authTokenService.rotateTokensForUser(createdUser, transaction);

            return { createdUser, ...tokens };
        });

        // Publish UserRegistered event after successful commit
        await this.eventPublisher.publish('UserRegistered', {
            userId: result.createdUser.id,
            email: result.createdUser.email,
            displayName: result.createdUser.displayName,
        });

        // Map to response format 
        const userData: UserData = {
            id: result.createdUser.id,
            email: result.createdUser.email,
            displayName: result.createdUser.displayName,
            createdAt: result.createdUser.createdAt.toISOString(),
            updatedAt: result.createdUser.updatedAt.toISOString(),
        };

        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: userData,
        };
    }
}
