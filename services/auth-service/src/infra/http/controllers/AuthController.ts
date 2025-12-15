import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { RegisterUserUseCase } from '@/app/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '@/app/use-cases/LoginUserUseCase';
import { RegisterUserDTO } from '@/app/dtos/RegisterUserDTO';
import { AuthResponse } from '@/app/dtos/AuthResponse';
import { env } from '@/config/env';
import { LoginUserDTO } from '@/app/dtos/LoginUserDTO';

/**
 * Infrastructure Layer: AuthController
 */
@injectable()
export class AuthController {
    constructor(
        @inject(RegisterUserUseCase) private readonly registerUserUseCase: RegisterUserUseCase,
        @inject(LoginUserUseCase) private readonly loginUserUseCase: LoginUserUseCase,
    ) { }

    /**
     * Register User Endpoint
     * Request body is already validated by middleware
     * Returns AuthResponse format exactly as specified
     */
    signup = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // Request body is already validated by middleware
            const input: RegisterUserDTO = req.body as RegisterUserDTO;

            // Execute use case
            const response: AuthResponse = await this.registerUserUseCase.execute(input);

            // Set refresh token cookie
            res.cookie('refreshToken', response.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            // Return response exactly as specified (AuthResponse format)
            return res.status(201).json(response);
        } catch (error) {
            return next(error);
        }
    };

    /**
     * Login User Endpoint
     * Request body is already validated by middleware
     * Returns AuthResponse format exactly as specified
     */
    signin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const input: LoginUserDTO = req.body as LoginUserDTO;

            const response: AuthResponse = await this.loginUserUseCase.execute(input);

            res.cookie('refreshToken', response.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            return res.status(200).json(response);
        } catch (error) {
            return next(error);
        }
    }

    signout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const userId = (req as any).currentUser?.id || req.body.userId;
            // TODO: Implement signout use case
            res.clearCookie('refreshToken');
            return res.status(200).send({});
        } catch (error) {
            return next(error);
        }
    };

    currentUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        // This will be implemented with a middleware that verifies the JWT
        // and attaches the user to the request.
        // For now, just return null if not defined.
        return res.status(200).json({ currentUser: (req as any).currentUser || null });
    };
}

