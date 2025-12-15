import { injectable, inject } from 'tsyringe';
import { Transaction } from 'sequelize';
import { ITransactionManager } from '@/domain/database/ITransactionManager';
import { SequelizeConnector } from './SequelizeConnector';
import { logger } from '@/utils/logger';

@injectable()
export class SequelizeTransactionManager implements ITransactionManager {
    constructor(
        @inject(SequelizeConnector) private connector: SequelizeConnector
    ) {}

    async executeInTransaction<T>(
        callback: (transaction: Transaction) => Promise<T>
    ): Promise<T> {
        const sequelize = this.connector.getSequelize();
        const transaction = await sequelize.transaction();

        try {
            const result = await callback(transaction);
            await transaction.commit();
            return result;
        } catch (error) {
            await transaction.rollback();
            logger.error({ error }, 'Transaction rolled back due to error');
            throw error;
        }
    }
}

