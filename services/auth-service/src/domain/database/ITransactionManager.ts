export interface ITransactionManager {
    /**
     * Executes a function within a database transaction.
     * If the function throws an error, the transaction is rolled back.
     * 
     * @param callback Function to execute within the transaction
     * @returns The result of the callback function
     */
    executeInTransaction<T>(callback: (transaction: any) => Promise<T>): Promise<T>;
}

