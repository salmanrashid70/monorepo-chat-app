import { DatabaseConfig } from '@/main/config/databaseConfig';
import { env } from '../../main/config/env';
import { Sequelize } from 'sequelize';
import { container } from 'tsyringe';
import { LoggerService } from '../services/logger.service';
import { DI_TOKENS } from '@/main/di/tokens';

const dbConfig: DatabaseConfig = {
    database: env.MYSQL_DATABASE,
    username: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    rootPassword: env.MYSQL_ROOT_PASSWORD,
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false
};

export const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password || dbConfig.rootPassword || '',
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        pool: dbConfig.pool,
        logging: dbConfig.logging,
    }
);

// Test connection function
export const connectDB = async () => {
    const logger = container.resolve<LoggerService>(DI_TOKENS.Logger);
    try {
        await sequelize.authenticate();
        logger.info('Database connection has been established successfully.');
        // Sync models (for dev/demo purposes - use migrations in prod)
        await sequelize.sync({ alter: true });
    } catch (error) {
        logger.error(`Unable to connect to the database: ${error}`);
        process.exit(1);
    }
};
