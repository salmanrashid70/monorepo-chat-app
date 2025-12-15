/**
 * Domain Interface: TokenProvider
 * Defines the contract for token generation operations
 */
export interface ITokenProvider {
    generateAccessToken(payload: object): string;
    generateRefreshToken(payload: object): string;
    getRefreshTokenExpiry(refreshToken: string): Date;
    verifyRefreshToken<TPayload extends object = any>(refreshToken: string): TPayload;
}

