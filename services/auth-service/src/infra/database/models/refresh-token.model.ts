import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface RefreshTokenAttributes {
    id: string;
    userId: string;
    tokenId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type RefreshTokenCreationAttributes = Optional<
    RefreshTokenAttributes,
    'id' | 'createdAt' | 'updatedAt'
>

export class RefreshToken extends
    Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
    implements RefreshTokenAttributes {
    declare id: string;
    declare userId: string;
    declare tokenId: string;
    declare expiresAt: Date;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const initRefreshToken = (sequelize: Sequelize): void => {
    RefreshToken.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        tokenId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
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
        tableName: 'refresh_tokens'
    });
};

