import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
class Barra extends Model {
    id;
    nombre;
    correo;
    contraseña;
    rol;
}
Barra.init({
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
        defaultValue: "barra",
    },
}, {
    sequelize,
    modelName: "Barra",
    tableName: "barras",
    timestamps: false,
});
export default Barra;
//# sourceMappingURL=barra.js.map