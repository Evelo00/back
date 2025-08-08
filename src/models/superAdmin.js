import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
class SuperAdmin extends Model {
    id;
    nombre;
    correo;
    contraseña;
    rol;
}
SuperAdmin.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    contraseña: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rol: {
        type: DataTypes.STRING,
        defaultValue: "superadmin",
    },
}, {
    sequelize,
    modelName: "SuperAdmin",
    tableName: "superadmins",
    timestamps: false,
});
export default SuperAdmin;
//# sourceMappingURL=superAdmin.js.map