import { Sequelize } from "sequelize";
import { UserCredentials, initUserCredentials } from "./user-credentials.model";
import { RefreshToken, initRefreshToken } from "./refresh-token.model";

export { UserCredentials, RefreshToken };
export { type UserCredentialsAttributes, type UserCredentialsCreationAttributes } from "./user-credentials.model";
export { type RefreshTokenAttributes, type RefreshTokenCreationAttributes } from "./refresh-token.model";

export const initializeModels = (sequelize: Sequelize): void => {
    initUserCredentials(sequelize);
    initRefreshToken(sequelize);
};

