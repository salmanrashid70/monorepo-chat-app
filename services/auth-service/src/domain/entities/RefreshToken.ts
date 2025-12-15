/**
 * Domain Entity: RefreshToken
 * Represents a persisted refresh token in the system, independent of any ORM.
 */
export class RefreshToken {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly tokenId: string,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    /**
     * Indicates whether this refresh token is expired at the time of check.
     */
    isExpired(at: Date = new Date()): boolean {
        return this.expiresAt.getTime() <= at.getTime();
    }
}


