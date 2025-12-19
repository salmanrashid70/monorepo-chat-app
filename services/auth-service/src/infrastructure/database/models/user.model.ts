
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../connection';

export class UserModel extends Model {
    declare id: string;
    declare email: string;
    declare displayName: string;
    declare passwordHash: string;
    declare createdAt: Date;
    declare updatedAt: Date;
}

UserModel.init({
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
