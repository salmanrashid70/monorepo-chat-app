import 'reflect-metadata'; // Required for tsyringe
import { env } from '../config/env';
import { container } from 'tsyringe';
import { SequelizeUserRepository } from '../../infrastructure/database/repositories/user.repository';
import { BcryptPasswordService } from '../../infrastructure/services/bcrypt.service';
import { JwtTokenService } from '../../infrastructure/services/jwt.service';
import { RabbitMQMessageBroker } from '../../infrastructure/services/rabbitmq.broker';
import { LoggerService } from '../../infrastructure/services/logger.service';
import { SignUpUseCase } from '../../application/use-cases/signup.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { AuthController } from '../../infrastructure/http/controllers/auth.controller';
import { SequelizeRefreshTokenRepository } from '@/infrastructure/database/repositories/refresh-token.repository';
import { DI_TOKENS } from './tokens';
import { RefreshTokenService } from '@/infrastructure/services/refresh-token.service';
import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token.use-case';
import { SignOutUseCase } from '@/application/use-cases/signout.use-case';

export const configureContainer = () => {
    // Infrastructure Services
    container.register(DI_TOKENS.Logger, { useClass: LoggerService });

    container.register(DI_TOKENS.UserRepository, { useClass: SequelizeUserRepository });
    container.register(DI_TOKENS.RefreshTokenService, { useClass: RefreshTokenService });
    container.register(DI_TOKENS.RefreshTokenRepository, { useClass: SequelizeRefreshTokenRepository });
    container.register(DI_TOKENS.PasswordService, { useClass: BcryptPasswordService });

    // Factory for services requiring config
    container.register(DI_TOKENS.TokenService, { useClass: JwtTokenService });

    container.register(DI_TOKENS.MessageBroker, {
        useValue: new RabbitMQMessageBroker(
            env.RABBITMQ_URL,
            container.resolve(DI_TOKENS.Logger),
        )
    });


    // Use Cases (Auto-wirable if they use @inject)
    container.register(DI_TOKENS.SignUpUseCase, { useClass: SignUpUseCase });
    container.register(DI_TOKENS.LoginUseCase, { useClass: LoginUseCase });
    container.register(DI_TOKENS.RefreshTokenUseCase, { useClass: RefreshTokenUseCase });
    container.register(DI_TOKENS.SignOutUseCase, { useClass: SignOutUseCase });

    // Controllers
    container.register(DI_TOKENS.AuthController, { useClass: AuthController });

    return container;
};
