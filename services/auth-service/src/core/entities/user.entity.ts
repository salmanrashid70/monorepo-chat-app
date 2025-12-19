import { Email } from './email.vo';
import { Password } from './password.vo';

export class User {
    constructor(
        private readonly id: string,
        private readonly email: Email,
        private readonly displayName: string,
        private readonly password: Password,
        private readonly createdAt: Date = new Date(),
        private readonly updatedAt: Date = new Date()
    ) { }

    public getId(): string {
        return this.id;
    }

    public getEmail(): Email {
        return this.email;
    }

    public getDisplayName(): string {
        return this.displayName;
    }

    public getPassword(): Password {
        return this.password;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
