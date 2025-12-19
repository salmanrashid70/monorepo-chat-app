
import { IUserRepository } from '../../../core/interfaces/user.repository.interface';
import { User } from '../../../core/entities/user.entity';
import { Email } from '../../../core/entities/email.vo';
import { Password } from '../../../core/entities/password.vo';
import { UserModel } from '../models/user.model';

export class SequelizeUserRepository implements IUserRepository {

    async save(user: User): Promise<User> {
        const exists = await UserModel.findByPk(user.getId());

        // Mapper: Domain -> Data
        const data = {
            id: user.getId(),
            email: user.getEmail().getValue(),
            displayName: user.getDisplayName(),
            passwordHash: user.getPassword().getValue(),
        };

        if (exists) {
            await exists.update(data);
        } else {
            await UserModel.create(data);
        }

        return user;
    }

    async findByEmail(email: Email): Promise<User | null> {
        const model = await UserModel.findOne({ where: { email: email.getValue() } });
        if (!model) return null;
        return this.toDomain(model);
    }

    async findById(id: string): Promise<User | null> {
        const model = await UserModel.findByPk(id);
        if (!model) return null;
        return this.toDomain(model);
    }

    private toDomain(model: UserModel): User {
        // Mapper: Data -> Domain
        return new User(
            model.id,
            new Email(model.email),
            model.displayName,
            new Password(model.passwordHash),
            model.createdAt,
            model.updatedAt
        );
    }
}
