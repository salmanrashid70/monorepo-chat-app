import { Password } from '../entities/password.vo';

export interface IPasswordService {
    hash(password: Password): Promise<string>;
    compare(plain: Password, hashed: string): Promise<boolean>;
}
