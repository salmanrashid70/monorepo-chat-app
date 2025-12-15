import { Transaction } from 'sequelize';
import { User } from '../entities/User';

/**
 * Domain Interface: UserRepository
 */
export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    create(user: User, transaction?: Transaction): Promise<User>;
    findById(id: string): Promise<User | null>;
}
