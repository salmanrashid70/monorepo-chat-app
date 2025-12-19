
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../connection';

export class RefreshTokenModel extends Model {
    declare id: string;
    declare userId: string;
    declare tokenId: string;
    declare expiresAt: Date;
    declare createdAt: Date;
    declare updatedAt: Date;
}

RefreshTokenModel.init({
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

