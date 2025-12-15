// Centralized DI tokens to avoid scattered magic strings
export const DI_TOKENS = {
    Port: 'port',
    DatabaseConfig: 'DatabaseConfig',
    DatabaseConnector: 'DatabaseConnector',
    ModelInitializer: 'ModelInitializer',
    TransactionManager: 'ITransactionManager',
    UserRepository: 'IUserRepository',
    RefreshTokenRepository: 'IRefreshTokenRepository',
    PasswordHasher: 'IPasswordHasher',
    TokenProvider: 'ITokenProvider',
    EventPublisher: 'IEventPublisher',
    Routes: 'Routes'
};
