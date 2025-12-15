/**
 * Domain Entity: User
 * Pure business entity 
 */
export class User {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly displayName: string,
        public readonly passwordHash: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }
}
