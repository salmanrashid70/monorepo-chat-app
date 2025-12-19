
export class RefreshToken {
    constructor(
        private readonly tokenId: string,
        private readonly userId: string,
        private readonly expiresAt: Date,
        private readonly createdAt: Date = new Date()
    ) { }

    public getTokenId(): string {
        return this.tokenId;
    }

    public getUserId(): string {
        return this.userId;
    }

    public getExpiresAt(): Date {
        return this.expiresAt;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public isExpired(): boolean {
        return this.expiresAt < new Date();
    }
}   