import { injectable } from 'tsyringe';
import bcrypt from 'bcrypt';
import { IPasswordHasher } from '@/domain/repositories/IPasswordHasher';

/**
 * Infrastructure Layer: BcryptPasswordHasher
 * Implements password hashing using bcrypt
 */
@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
    private readonly saltRounds = 10;

    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}

