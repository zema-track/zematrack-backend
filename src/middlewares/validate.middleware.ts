import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';
import { ApiError } from '../utils/api-error';

export const validate = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      const validationErrors = (error as any).errors ? (error as any).errors : [];
      const msg = validationErrors.map((err: any) => err.path + ' ' + err.message).join(', ');
      next(new ApiError(400, `${msg}`, error as any));
    }
  };
};
