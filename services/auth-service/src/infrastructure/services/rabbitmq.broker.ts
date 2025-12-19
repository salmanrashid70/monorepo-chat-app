
import * as amqp from 'amqplib';
import { IMessageBroker } from '../../core/interfaces/message-broker.interface';
import { inject } from 'tsyringe';
import { DI_TOKENS } from '@/main/di/tokens';
import { LoggerService } from './logger.service';

export class RabbitMQMessageBroker implements IMessageBroker {
    private connection: any = null;
    private channel: any = null;

    constructor(private readonly url: string,
        @inject(DI_TOKENS.Logger) private readonly logger: LoggerService
    ) { }

    async connect(): Promise<void> {
        if (this.connection) return;
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            this.logger.info('Connected to RabbitMQ');
        } catch (error) {
            this.logger.error(`Failed to connect to RabbitMQ: ${error}`);
            throw error;
        }
    }

    async publish(queue: string, message: any): Promise<void> {
        if (!this.channel) {
            await this.connect();
        }
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not available');
        }

        try {
            await this.channel.assertQueue(queue, { durable: true });
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        } catch (error) {
            this.logger.error(`Error publishing to ${queue}: ${error}`);
        }
    }

    async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
    }
}
