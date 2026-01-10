import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        rol: string;
        email?: string;
      };
    }
  }
}

declare const app: import("express").Express;
export default app;