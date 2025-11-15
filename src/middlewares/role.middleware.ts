export const requireRole = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: "No tienes permisos" });
    }
    next();
  };
};
