import { injectable } from 'tsyringe';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserCredentials } from '@/infra/database/models';

/**
 * Infrastructure Layer: SequelizeUserRepository
 * Maps Sequelize models to domain entities
 */
@injectable()
export class SequelizeUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const userModel = await UserCredentials.findOne({
            where: { email }
        });

        if (!userModel) {
            return null;
        }

        // Map Sequelize model to domain entity
        return new User(
            userModel.id,
            userModel.email,
            userModel.displayName,
            userModel.passwordHash,
            userModel.createdAt,
            userModel.updatedAt
        );
    }

    async create(user: User): Promise<User> {
        const userModel = await UserCredentials.create({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            passwordHash: user.passwordHash,
            createdAt: user.createdAt,
        });

        // Map Sequelize model back to domain entity
        return new User(
            userModel.id,
            userModel.email,
            userModel.displayName,
            userModel.passwordHash,
            userModel.createdAt,
            userModel.updatedAt
        );
    }

    async findById(id: string): Promise<User | null> {
        const userModel = await UserCredentials.findByPk(id);
        if (!userModel) return null;

        return new User(
            userModel.id,
            userModel.email,
            userModel.displayName,
            userModel.passwordHash,
            userModel.createdAt,
            userModel.updatedAt
        );
    }
}

