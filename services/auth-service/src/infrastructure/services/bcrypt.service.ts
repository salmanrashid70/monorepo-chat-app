
import bcrypt from 'bcrypt';
import { IPasswordService } from '../../core/interfaces/password.service.interface';
import { Password } from '../../core/entities/password.vo';

export class BcryptPasswordService implements IPasswordService {
    private readonly SALT_ROUNDS = 12;

    async hash(password: Password): Promise<string> {
        return bcrypt.hash(password.getValue(), this.SALT_ROUNDS);
    }

    async compare(plain: Password, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain.getValue(), hashed);
    }
}
