import 'reflect-metadata';
import { Application } from './app';
import { registerDependencies, getContainer } from './config';
import { logger } from './utils/logger';

const main = async () => {
    // Register all dependencies
    registerDependencies();

    // Resolve application from container
    const container = getContainer();
    const app = container.resolve(Application);

    try {
        // Start the application
        await app.start();

        // Shutdown the application
        const gracefullyShutdown = async () => {
            logger.info('Shutting down auth service gracefully...');
            await app.stop();
            process.exit(0);
        };

        // Register signal handlers for graceful shutdown
        process.on('SIGINT', gracefullyShutdown);
        process.on('SIGTERM', gracefullyShutdown);
    } catch (error) {
        logger.error({ error }, 'Application failed to start');
        process.exit(1);
    }
};

main();
