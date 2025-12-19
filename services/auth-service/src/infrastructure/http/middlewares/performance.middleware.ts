
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { DI_TOKENS } from '../../../main/di/tokens';
import { IMessageBroker } from '../../../core/interfaces/message-broker.interface';
import { LoggerService } from '../../../infrastructure/services/logger.service';

export interface PerformanceData {
    method: string;
    path: string;
    statusCode: number;
    duration_ms: number;
    timestamp: Date;
    userId?: string;
}

export const performanceMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();

        // Capture original end to hook into response completion
        const originalEnd = res.end;

        res.end = function (this: Response, ...args: any[]) {
            const duration = Date.now() - startTime;

            // Get dependencies from container
            const messageBroker = container.resolve<IMessageBroker>(DI_TOKENS.MessageBroker);
            const logger = container.resolve<LoggerService>(DI_TOKENS.Logger);

            const performanceData: PerformanceData = {
                method: req.method,
                path: req.originalUrl || req.path,
                statusCode: res.statusCode,
                duration_ms: duration,
                timestamp: new Date(),
                userId: (req as any).userId // If auth middleware sets this
            };

            // Publish to logging queue (fire and forget)
            messageBroker.publish('api.metrics', {
                event: 'ApiPerformance',
                data: performanceData
            }).catch(() => { /* swallow errors */ });

            // Log locally
            logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);

            // Call original end
            return originalEnd.apply(this, args as any);
        } as any;

        next();
    };
};
