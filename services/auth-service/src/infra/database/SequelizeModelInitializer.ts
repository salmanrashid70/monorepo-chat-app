import { injectable, inject } from 'tsyringe';
import { IModelInitializer } from '@/domain/database/IModelInitializer';
import { SequelizeConnector } from './SequelizeConnector';
import { initializeModels } from './models';
import { logger } from '@/utils/logger';

@injectable()
export class SequelizeModelInitializer implements IModelInitializer {
    constructor(
        @inject(SequelizeConnector) private connector: SequelizeConnector
    ) { }

    async initialize(): Promise<void> {
        try {
            const sequelize = this.connector.getSequelize();
            initializeModels(sequelize);

            // Sync models with database (use with caution in production)
            await sequelize.sync();
            logger.info('Database models initialized successfully.');
        } catch (error) {
            logger.error({ error }, 'Failed to initialize database models:');
            throw error;
        }
    }
}

