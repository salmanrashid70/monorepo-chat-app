/**
 * Domain Interface: EventPublisher
 * Defines the contract for publishing domain events
 */
export interface IEventPublisher {
    publish(eventName: string, payload: object): Promise<void>;
}
