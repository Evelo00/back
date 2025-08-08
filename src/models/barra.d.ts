import { Model } from "sequelize";
import type { UserBaseAttributes } from "./UserBase.js";
declare class Barra extends Model<UserBaseAttributes> implements UserBaseAttributes {
    id: string;
    nombre: string;
    correo: string;
    contraseña: string;
    rol: string;
}
export default Barra;
//# sourceMappingURL=barra.d.ts.map