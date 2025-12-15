import http from 'http';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from '@chatapp/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { IDatabaseConnector } from './domain/database/IDatabaseConnector';
import { IModelInitializer } from './domain/database/IModelInitializer';
import { injectable, inject, injectAll } from 'tsyringe';
import { IRoute } from './interfaces/IRoute';

export interface IApplication {
  start(): Promise<void>;
  stop(): Promise<void>;
}

@injectable()
export class Application implements IApplication {
  private readonly app: express.Application;
  private server: http.Server | null = null;
  private readonly port: number;
  private readonly databaseConnector: IDatabaseConnector;
  private readonly modelInitializer: IModelInitializer;
  private readonly routes: IRoute[];

  constructor(
    @inject('port') port: number,
    @inject('DatabaseConnector') databaseConnector: IDatabaseConnector,
    @inject('ModelInitializer') modelInitializer: IModelInitializer,
    @injectAll('Routes') routes: IRoute[]
  ) {
    this.app = express();
    this.port = port;
    this.databaseConnector = databaseConnector;
    this.modelInitializer = modelInitializer;
    this.routes = routes;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  public async start(): Promise<void> {
    try {
      await this.databaseConnector.connect();
      await this.modelInitializer.initialize();

      this.server = this.app.listen(this.port, () => {
        logger.info(`Application is running on port ${this.port}`);
      });
    } catch (error) {
      logger.error(`Failed to start application: ${error}`);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          this.server!.close((err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
      await this.databaseConnector.disconnect();
    } catch (error) {
      logger.error({ error }, `Failed to stop application`);
      throw error;
    }
  }

  private initializeMiddlewares(): void {
    logger.info('Initializing middlewares...');

    this.app.use(helmet());
    this.app.use(cors({
      origin: "*",
      credentials: true
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(): void {
    logger.info('Initializing routes...');

    this.routes.forEach(route => {
      this.app.use(route.path, route.router);
    });

    // Handle Not Found Routes via centralized error handling
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      next(new NotFoundError(`Route not found: ${req.method} ${req.url}`));
    });
  }

  private initializeErrorHandling(): void {
    logger.info('Initializing error handling...');
    this.app.use(errorHandler);
  }
}
