import { Model } from "sequelize";
import type { UserBaseAttributes } from "./UserBase.js";
declare class SuperAdmin extends Model<UserBaseAttributes> implements UserBaseAttributes {
    id: string;
    nombre: string;
    correo: string;
    contraseña: string;
    rol: string;
}
export default SuperAdmin;
//# sourceMappingURL=superAdmin.d.ts.map