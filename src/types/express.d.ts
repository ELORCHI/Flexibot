// src/types/express.d.ts
import 'express';

declare global {
  namespace Express {
    interface Request {
      isAuthenticated: () => boolean;
      user?: {
        id: string;
        username: string;
        avatar?: string;
        discriminator: string;
        email?: string;
      } | null;
    }
  }
}
