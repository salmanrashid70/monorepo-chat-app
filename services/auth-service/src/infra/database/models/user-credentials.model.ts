import { Sequelize, Optional, Model, DataTypes } from "sequelize";

export interface UserCredentialsAttributes {
    id: string;
    email: string;
    displayName: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export type UserCredentialsCreationAttributes = Optional<
    UserCredentialsAttributes,
    'id' | 'createdAt' | 'updatedAt'
>

export class UserCredentials extends
    Model<UserCredentialsAttributes, UserCredentialsCreationAttributes>
    implements UserCredentialsAttributes {
    declare id: string;
    declare email: string;
    declare displayName: string;
    declare passwordHash: string;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const initUserCredentials = (sequelize: Sequelize): void => {
    UserCredentials.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'user_credentials'
    });
};

