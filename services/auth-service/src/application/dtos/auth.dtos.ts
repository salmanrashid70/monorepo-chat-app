export interface SignUpDTO {
    email: string;
    password: string;
    displayName: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface RefreshTokenDTO {
    refreshToken: string;
}

export interface UserData {
    id: string;
    email: string;
    displayName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
    user: UserData;
}
