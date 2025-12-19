import { createLogger, Logger } from '@chatapp/common';

export class LoggerService {
    private logger: Logger;

    constructor() {
        this.logger = createLogger({
            name: 'auth-service'
        });
    }

    info(message: string, meta?: any) {
        if (meta) {
            this.logger.info(meta, message);
        } else {
            this.logger.info(message);
        }
    }

    error(message: string, meta?: any) {
        if (meta) {
            this.logger.error(meta, message);
        } else {
            this.logger.error(message);
        }
    }

    warn(message: string, meta?: any) {
        if (meta) {
            this.logger.warn(meta, message);
        } else {
            this.logger.warn(message);
        }
    }
}
