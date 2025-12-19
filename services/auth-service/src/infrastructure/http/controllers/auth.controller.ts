
import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { SignUpUseCase } from '../../../application/use-cases/signup.use-case';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { SignUpDTO, LoginDTO, RefreshTokenDTO } from '../../../application/dtos/auth.dtos';

import { env } from '../../../main/config/env';
import { DI_TOKENS } from '@/main/di/tokens';
import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token.use-case';

@injectable()
export class AuthController {
    constructor(
        @inject(DI_TOKENS.SignUpUseCase) private readonly signUpUseCase: SignUpUseCase,
        @inject(DI_TOKENS.LoginUseCase) private readonly loginUseCase: LoginUseCase,
        @inject(DI_TOKENS.RefreshTokenUseCase) private readonly refreshTokenUseCase: RefreshTokenUseCase
    ) { }

    async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: SignUpDTO = req.body;
            const result = await this.signUpUseCase.execute(dto);

            this.setCookies(res, result.accessToken, result.refreshToken);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: LoginDTO = req.body;
            const result = await this.loginUseCase.execute(dto);

            this.setCookies(res, result.accessToken, result.refreshToken);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Extract from cookies first, fallback to body
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }

            const dto: RefreshTokenDTO = { refreshToken };
            const result = await this.refreshTokenUseCase.execute(dto);

            this.setCookies(res, result.accessToken, result.refreshToken);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15m
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
        });
    }
}
