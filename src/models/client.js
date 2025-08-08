import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
class Cliente extends Model {
    id;
    nombre;
    correo;
    contraseña;
    rol;
}
Cliente.init({
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
        defaultValue: "cliente",
    },
}, {
    sequelize,
    modelName: "Cliente",
    tableName: "clientes",
    timestamps: false,
});
export default Cliente;
//# sourceMappingURL=client.js.map