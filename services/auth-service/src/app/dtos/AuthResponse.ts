/**
 * Register API Response Contracts
 * Must match exactly as specified
 */
export interface UserData {
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
    user: UserData;
}
