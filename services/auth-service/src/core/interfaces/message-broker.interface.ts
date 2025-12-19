export interface IMessageBroker {
    publish(queue: string, message: any): Promise<void>;
}
