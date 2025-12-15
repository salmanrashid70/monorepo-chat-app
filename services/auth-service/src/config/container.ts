import 'reflect-metadata';
import { container, DependencyContainer } from 'tsyringe';
import { env } from './env';
import { DatabaseConfig } from '@/infra/database/DatabaseConfig';
import { SequelizeConnector } from '@/infra/database/SequelizeConnector';
import { SequelizeModelInitializer } from '@/infra/database/SequelizeModelInitializer';
import { SequelizeUserRepository } from '@/infra/database/repositories/SequelizeUserRepository';
import { SequelizeRefreshTokenRepository } from '@/infra/database/repositories/SequelizeRefreshTokenRepository';
import { SequelizeTransactionManager } from '@/infra/database/SequelizeTransactionManager';
import { BcryptPasswordHasher } from '@/infra/security/BcryptPasswordHasher';
import { JwtTokenProvider } from '@/infra/security/JwtTokenProvider';
import { EventPublisher } from '@/infra/events/EventPublisher';
import { RegisterUserUseCase } from '@/app/use-cases/RegisterUserUseCase';
import { AuthRoutes } from '@/infra/http/routes/auth.routes';
import { HealthRoutes } from '@/infra/http/routes/health.routes';
import { DI_TOKENS } from './diTokens';
import { AuthTokenService } from '@/app/services/AuthTokenService';
import { LoginUserUseCase } from '@/app/use-cases/LoginUserUseCase';
import { RefreshTokenUseCase } from '@/app/use-cases/RefreshTokenUseCase';

/**
 * Creates and configures the database configuration
 */
const createDatabaseConfig = (): DatabaseConfig => ({
    database: env.MYSQL_DATABASE,
    username: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    rootPassword: env.MYSQL_ROOT_PASSWORD,
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false
});

/**
 * Registers all application dependencies in the DI container
 */
export const registerDependencies = (): DependencyContainer => {
    // Register configuration values (instances)
    container.registerInstance(DI_TOKENS.Port, env.AUTH_SERVICE_PORT);
    container.registerInstance(DI_TOKENS.DatabaseConfig, createDatabaseConfig());

    // Register database dependencies as singletons
    container.registerSingleton(DI_TOKENS.DatabaseConnector, SequelizeConnector);
    container.registerSingleton(DI_TOKENS.ModelInitializer, SequelizeModelInitializer);
    container.registerSingleton(DI_TOKENS.TransactionManager, SequelizeTransactionManager);

    // Register repositories as singletons
    container.registerSingleton(DI_TOKENS.UserRepository, SequelizeUserRepository);
    container.registerSingleton(DI_TOKENS.RefreshTokenRepository, SequelizeRefreshTokenRepository);

    // Register domain services as singletons
    container.registerSingleton(DI_TOKENS.PasswordHasher, BcryptPasswordHasher);
    container.registerSingleton(DI_TOKENS.TokenProvider, JwtTokenProvider);
    container.registerSingleton(DI_TOKENS.EventPublisher, EventPublisher);

    // Register application services / use cases as singletons (class token)
    container.registerSingleton(AuthTokenService);
    container.registerSingleton(RegisterUserUseCase);
    container.registerSingleton(LoginUserUseCase);
    container.registerSingleton(RefreshTokenUseCase);

    // Register routes (register multiple classes under the same token so injectAll('Routes') returns both)
    container.register(DI_TOKENS.Routes, { useClass: AuthRoutes });
    container.register(DI_TOKENS.Routes, { useClass: HealthRoutes });

    return container;
};

/**
 * Gets the configured DI container
 */
export const getContainer = (): DependencyContainer => {
    return container;
};

