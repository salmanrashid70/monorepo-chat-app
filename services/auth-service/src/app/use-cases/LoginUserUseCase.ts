import { ITransactionManager } from '@/domain/database/ITransactionManager';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { injectable, inject } from 'tsyringe';
import { LoginUserDTO } from '../dtos/LoginUserDTO';
import { AuthResponse } from '../dtos/AuthResponse';
import { AuthenticationError, NotFoundError } from '@chatapp/common';
import { IPasswordHasher } from '@/domain/repositories/IPasswordHasher';
import { AuthTokenService } from '../services/AuthTokenService';

/**
 * Application Layer: LoginUserUseCase
 */
@injectable()
export class LoginUserUseCase {
    constructor(
        @inject('IUserRepository') private readonly userRepository: IUserRepository,
        @inject('ITransactionManager') private readonly transactionManager: ITransactionManager,
        @inject('IPasswordHasher') private readonly passwordHasher: IPasswordHasher,
        @inject(AuthTokenService) private readonly authTokenService: AuthTokenService,
    ) { }

    async execute(input: LoginUserDTO): Promise<AuthResponse> {
        // Check user is already registered or not
        const existingUser = await this.userRepository.findByEmail(input.email);

        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        // Verify password
        const isPasswordValid = await this.passwordHasher.compare(input.password, existingUser.passwordHash);

        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid email or password.');
        }

        // Create tokens and persist refresh token atomically
        const result = await this.transactionManager.executeInTransaction(async (transaction) => {
            const tokens = await this.authTokenService.rotateTokensForUser(existingUser, transaction);
            return tokens;
        });

        const userData = {
            id: existingUser.id,
            email: existingUser.email,
            displayName: existingUser.displayName,
            createdAt: existingUser.createdAt.toISOString(),
            updatedAt: existingUser.updatedAt.toISOString(),
        };

        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: userData,
        } as AuthResponse;
    }
}