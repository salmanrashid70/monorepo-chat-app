/**
 * Application error types and classes
 */

export enum ErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
    BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
    NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    CONFLICT_ERROR = 'CONFLICT_ERROR',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
}

/**
 * Base application error class
 */
export class AppError extends Error {
    public readonly type: ErrorType;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly timestamp: Date;
    public readonly details?: Record<string, any>;

    constructor(
        type: ErrorType,
        message: string,
        statusCode: number,
        isOperational: boolean = true,
        details?: Record<string, any>
    ) {
        super(message);

        this.type = type;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date();
        this.details = details;

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }

    toJSON() {
        return {
            type: this.type,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            details: this.details,
        };
    }

    // Backward compatibility for services expecting serializeErrors
    serializeErrors(): { message: string; field?: string }[] {
        return [{ message: this.message, field: this.details?.field }];
    }
}

/**
 * BadRequest error - 400
 */
export class BadRequestError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super(ErrorType.BAD_REQUEST_ERROR, message, 400, true, details);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

/**
 * Validation error - 400
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super(ErrorType.VALIDATION_ERROR, message, 400, true, details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    // Override to support array of errors if details has them, or default behavior
    serializeErrors(): { message: string; field?: string }[] {
        if (this.details && Array.isArray(this.details.errors)) {
            return this.details.errors.map((err: any) => ({ message: err.message, field: err.field }));
        }
        return super.serializeErrors();
    }
}

/**
 * Authentication error - 401
 */
export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(ErrorType.AUTHENTICATION_ERROR, message, 401);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Authorization error - 403
 */
export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(ErrorType.AUTHORIZATION_ERROR, message, 403);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

/**
 * Not found error - 404
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(ErrorType.NOT_FOUND_ERROR, message, 404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Conflict error - 409
 */
export class ConflictError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super(ErrorType.CONFLICT_ERROR, message, 409, true, details);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

/**
 * Business logic error - 422
 */
export class BusinessLogicError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super(ErrorType.BUSINESS_LOGIC_ERROR, message, 422, true, details);
        Object.setPrototypeOf(this, BusinessLogicError.prototype);
    }
}

/**
 * Rate limit error - 429
 */
export class RateLimitError extends AppError {
    constructor(message: string = 'Rate limit exceeded') {
        super(ErrorType.RATE_LIMIT_ERROR, message, 429);
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * External service error - 502
 */
export class ExternalServiceError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super(ErrorType.EXTERNAL_SERVICE_ERROR, message, 502, true, details);
        Object.setPrototypeOf(this, ExternalServiceError.prototype);
    }
}

/**
 * Internal server error - 500
 */
export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error', details?: Record<string, any>) {
        super(ErrorType.INTERNAL_SERVER_ERROR, message, 500, false, details);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
