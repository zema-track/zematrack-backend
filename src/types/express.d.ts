import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File & {
        location?: string;
        key?: string;
      };
    }
  }
}
