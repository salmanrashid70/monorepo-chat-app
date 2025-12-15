import { Request, Response, NextFunction } from 'express';
import { AppError, InternalServerError, ValidationError, ZodError } from '@chatapp/common';
import { logger } from '@/utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json(err.toJSON());
        return;
    }

    if (err instanceof ZodError) {
        const issues = (err as any).issues || (err as any).errors;
        const validationError = new ValidationError('Validation failed', {
            errors: issues.map((e: any) => ({
                message: e.message,
                field: e.path.join('.'),
            })),
        });

        res.status(validationError.statusCode).json(validationError.toJSON());
        return;

    } else if (err instanceof SyntaxError) {
        const appError = new ValidationError("Invalid JSON object.");
        res.status(appError.statusCode).json(appError.toJSON());
        return;
    }

    // Handle unexpected errors
    logger.error({ err }, 'Unexpected error occurred');
    const internalError = new InternalServerError();
    res.status(internalError.statusCode).json(internalError.toJSON());
};
