export interface IDatabaseConnector {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
}

