import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { IRoute } from '@/interfaces/IRoute';
import { IDatabaseConnector } from '@/domain/database/IDatabaseConnector';

/**
 * Simple health-check route
 * Path: /health
 */
@injectable()
export class HealthRoutes implements IRoute {
    public path = '/health';
    public router: Router = Router();

    constructor(@inject('DatabaseConnector') private dbConnector: IDatabaseConnector) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', async (_req: Request, res: Response) => {
            const dbStatus = this.dbConnector.isConnected() ? 'up' : 'down';

            return res.status(200).json({
                status: 'ok',
                uptime: process.uptime(),
                db: dbStatus,
                timestamp: new Date().toISOString(),
            });
        });
    }
}
