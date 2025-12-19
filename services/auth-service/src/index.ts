import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB, sequelize } from './infrastructure/database/connection';
import { configureContainer } from './main/di/tsyringe.container';
import { createAuthRouter } from './infrastructure/http/routes/auth.routes';
import { errorHandler } from './infrastructure/http/middlewares/error.middleware';
import { performanceMiddleware } from './infrastructure/http/middlewares/performance.middleware';
import { AuthController } from './infrastructure/http/controllers/auth.controller';
import { DI_TOKENS } from './main/di/tokens';
import { IMessageBroker } from './core/interfaces/message-broker.interface';
import { Server } from 'http';
import { env } from './main/config/env';
import { NotFoundError } from '@chatapp/common';
import { LoggerService } from './infrastructure/services/logger.service';

dotenv.config();

const app = express();
const port = env.AUTH_SERVICE_PORT;

let server: Server;
let messageBroker: IMessageBroker;
let logger: LoggerService;

async function bootstrap() {
    try {
        // Configure Dependencies (Tsyringe)
        const container = configureContainer();
        logger = container.resolve<LoggerService>(DI_TOKENS.Logger);

        // Initialize Database
        await connectDB();

        // Connect Message Broker
        messageBroker = container.resolve<IMessageBroker>(DI_TOKENS.MessageBroker);

        try {
            if ('connect' in messageBroker && typeof (messageBroker as any).connect === 'function') {
                await (messageBroker as any).connect();
            }
        } catch (e) {
            logger.warn('RabbitMQ connection failed at startup, will retry on publish or continue without logging events.', e);
        }

        // Middleware
        app.use(helmet());
        app.use(cors({
            origin: '*',
            credentials: true
        }));
        app.use(express.json());
        app.use(cookieParser());
        app.use(performanceMiddleware());


        // Routes
        const authController = container.resolve<AuthController>(DI_TOKENS.AuthController);
        const authRouter = createAuthRouter(authController);
        app.use('/api/auth', authRouter);

        app.use('', (): Promise<void> => {
            throw new NotFoundError('Route not found');
        });

        // Error Handling
        app.use(errorHandler);

        // Start Server
        server = app.listen(port, () => {
            logger.info(`Auth Service running at http://localhost:${port}`);
        });

    } catch (error) {
        logger.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
}

async function gracefulShutdown(signal: string) {
    // Use console if logger not yet initialized
    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    const shutdownTimeout = setTimeout(() => {
        logger.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
    }, 10000); // 10 second timeout

    try {
        // 1. Stop accepting new connections
        if (server) {
            await new Promise<void>((resolve, reject) => {
                server.close((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            logger.info('HTTP server closed.');
        }

        // 2. Close message broker connection
        if (messageBroker && 'close' in messageBroker && typeof (messageBroker as any).close === 'function') {
            await (messageBroker as any).close();
            logger.info('Message broker connection closed.');
        }

        // 3. Close database connection
        await sequelize.close();
        logger.info('Database connection closed.');

        clearTimeout(shutdownTimeout);
        logger.info('Graceful shutdown complete.');
        process.exit(0);
    } catch (error) {
        logger.error(`Error during graceful shutdown: ${error}`);
        clearTimeout(shutdownTimeout);
        process.exit(1);
    }
}

// Register signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


bootstrap();
