import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '@chatapp/common';
import { registerSchema, loginSchema } from '../validators/auth.validator';

export const createAuthRouter = (authController: AuthController): Router => {
    const router = Router();

    router.post('/signup', validateRequest(registerSchema), authController.signUp.bind(authController));
    router.post('/signin', validateRequest(loginSchema), authController.signIn.bind(authController));
    router.post('/refresh', authController.refreshToken.bind(authController));
    router.post('/signout', authController.signOut.bind(authController));

    return router;
};
