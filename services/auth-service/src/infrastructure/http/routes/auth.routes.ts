import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '@chatapp/common';
import { registerSchema, loginSchema } from '../validators/auth.validator';

export const createAuthRouter = (authController: AuthController): Router => {
    const router = Router();

    router.post('/signup', validateRequest(registerSchema), authController.signUp.bind(authController));
    router.post('/login', validateRequest(loginSchema), authController.login.bind(authController));
    router.post('/refresh', authController.refreshToken.bind(authController));

    return router;
};
