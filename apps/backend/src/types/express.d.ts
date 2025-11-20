// src/types/express.d.ts
import { User } from '@clerk/backend';

declare module 'express' {
  interface Request {
    user?: User;
  }
}
