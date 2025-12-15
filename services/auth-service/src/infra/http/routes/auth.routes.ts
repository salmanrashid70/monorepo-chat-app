import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { validateRequest } from '@chatapp/common';
import { AuthController } from '@/infra/http/controllers/AuthController';
import { IRoute } from '@/interfaces/IRoute';
import { loginValidationSchema, registerValidationSchema } from '../validators/AuthValidator';

/**
 * Infrastructure Layer: AuthRoutes
 * Registers auth endpoints with validation middleware
 */
@injectable()
export class AuthRoutes implements IRoute {
    public path = '/api/users';
    public router: Router = Router();

    constructor(@inject(AuthController) private authController: AuthController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Register endpoint with validation
        this.router.post(
            '/signup',
            validateRequest(registerValidationSchema),
            this.authController.signup
        );

        this.router.post(
            '/signin',
            validateRequest(loginValidationSchema),
            this.authController.signin
        );

        // TODO: Implement these with their respective use cases
        // this.router.post('/signout', this.authController.signout);
        // this.router.get('/currentuser', this.authController.currentUser);
    }
}

