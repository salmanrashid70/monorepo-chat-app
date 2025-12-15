import { Options } from 'sequelize';

export interface DatabaseConfig {
    database: string;
    username: string;
    password?: string;
    rootPassword?: string;
    host: string;
    port: number;
    dialect: 'mysql';
    pool?: Options['pool'];
    logging?: boolean | ((sql: string) => void);
}

