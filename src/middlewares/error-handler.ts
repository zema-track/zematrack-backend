import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';
import { config } from '../config';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] = [];

  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((error: any) => ({
      field: error.path,
      message: error.message
    }));
  }
  // Mongoose cast errors
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    errors = [{ field: err.path, message: `Invalid ${err.path}` }];
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // unknown unexpected errors
  else {
    console.error('Unexpected error:', err);
  }

  const errorResponse = new ApiResponse(statusCode, null, message);
  
  // Add errors array if exists
  if (errors.length > 0) {
    (errorResponse as any).errors = errors;
  }

  // Add stack trace in development
  if (config.environment === 'development') {
    (errorResponse as any).stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};
