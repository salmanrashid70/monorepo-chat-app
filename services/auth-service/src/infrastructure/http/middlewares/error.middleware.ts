
import { Request, Response, NextFunction } from 'express';
import { UserAlreadyExistsError, InvalidCredentialsError, DomainError } from '../../../core/errors/domain.errors';
import { AppError } from '@chatapp/common';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Only log if 500 or unknown
    if (!(err instanceof AppError) && !(err instanceof DomainError)) {
        console.error(err);
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ errors: err.serializeErrors() });
        return;
    }

    if (err instanceof SyntaxError) {
        res.status(400).json({ error: 'Invalid JSON' });
        return;
    }

    // Legacy/Domain Error handling (mapping to simple JSON)
    if (err instanceof UserAlreadyExistsError) {
        res.status(409).json({ error: err.message });
        return;
    }

    if (err instanceof InvalidCredentialsError) {
        res.status(401).json({ error: err.message });
        return;
    }

    if (err instanceof DomainError) {
        res.status(400).json({ error: err.message });
        return;
    }

    res.status(500).json({ error: 'Internal Server Error' });
};
