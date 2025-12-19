import { User } from '../entities/user.entity';
import { Email } from '../entities/email.vo';

export interface IUserRepository {
    save(user: User): Promise<User>;
    findByEmail(email: Email): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}
