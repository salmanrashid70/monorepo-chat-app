import { injectable } from 'tsyringe';
import { IEventPublisher } from '@/domain/events/IEventPublisher';
import { logger } from '@/utils/logger';

/**
 * Infrastructure Layer: EventPublisher
 * Implements domain event publishing
 * Currently uses console logging as a stub implementation
 * Can be extended to use RabbitMQ message brokers
 */
@injectable()
export class EventPublisher implements IEventPublisher {
    async publish(eventName: string, payload: object): Promise<void> {
        // Stub implementation: log the event
        // In production, this would publish to a message broker (RabbitMQ, Kafka, etc.)
        logger.info({ eventName, payload }, 'Domain event published');

        // TODO: Implement actual event publishing to message broker
        // Example:
        // await this.messageBroker.publish(eventName, payload);
    }
}
