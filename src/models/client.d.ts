import { Model } from "sequelize";
import type { UserBaseAttributes } from "./UserBase.js";
declare class Cliente extends Model<UserBaseAttributes> implements UserBaseAttributes {
    id: string;
    nombre: string;
    correo: string;
    contraseña: string;
    rol: string;
}
export default Cliente;
//# sourceMappingURL=client.d.ts.map