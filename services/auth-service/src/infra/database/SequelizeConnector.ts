import { Sequelize } from 'sequelize';
import { injectable, inject } from 'tsyringe';
import { IDatabaseConnector } from '@/domain/database/IDatabaseConnector';
import { DatabaseConfig } from './DatabaseConfig';
import { logger } from '@/utils/logger';

@injectable()
export class SequelizeConnector implements IDatabaseConnector {
    private sequelize: Sequelize;
    private config: DatabaseConfig;
    private connected: boolean = false;

    constructor(@inject('DatabaseConfig') config: DatabaseConfig) {
        this.config = config;
        this.sequelize = new Sequelize(
            this.config.database,
            this.config.username,
            this.config.password,
            {
                host: this.config.host,
                port: this.config.port,
                dialect: this.config.dialect,
                logging: this.config.logging ?? false,
                pool: this.config.pool || {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
            }
        );
    }

    public getSequelize(): Sequelize {
        return this.sequelize;
    }

    public async connect(): Promise<void> {
        try {
            await this.sequelize.authenticate();
            this.connected = true;
            logger.info(`${this.config.dialect} Connection has been established successfully.`);
        } catch (error) {
            this.connected = false;
            logger.error({ error }, 'Unable to connect to the database:');
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this.sequelize.close();
            this.connected = false;
            logger.info(`${this.config.dialect} Connection closed successfully.`);
        } catch (error) {
            logger.error({ error }, 'Error closing the database connection:');
            throw error;
        }
    }

    public isConnected(): boolean {
        return this.connected;
    }
}

