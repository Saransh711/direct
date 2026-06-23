import type { Role } from '../common/roles';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      authUser?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
