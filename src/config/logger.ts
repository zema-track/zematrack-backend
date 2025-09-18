import morgan from 'morgan';
import { Request, Response } from 'express';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req: Request, res: Response) => {
  const startTime = res.locals.startTime || Date.now();
  return `${Date.now() - startTime}ms`;
});

// Custom token for timestamp
morgan.token('timestamp', () => {
  return new Date().toISOString();
});

// Custom token for request ID
morgan.token('request-id', (req: Request) => {
  return req.headers['x-request-id'] as string || 'N/A';
});

// Development format
const developmentFormat = morgan(
  ':timestamp [:request-id] :method :url :status :response-time-ms - :user-agent',
  {
    skip: (req: Request, res: Response) => {
      return req.url.includes('/health') || req.url.includes('/favicon');
    }
  }
);

// Production format
const productionFormat = morgan(
  ':timestamp [:request-id] :remote-addr :method :url :status :res[content-length] :response-time-ms ":user-agent"',
  {
    skip: (req: Request, res: Response) => {
      return req.url.includes('/health') || req.url.includes('/favicon');
    }
  }
);

// Combined format with custom fields
const combinedFormat = morgan(
  ':timestamp [:request-id] :remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms'
);

// Middleware to capture start time
export const captureStartTime = (req: Request, res: Response, next: Function) => {
  res.locals.startTime = Date.now();
  next();
};

export const logger = process.env.NODE_ENV === 'production' 
  ? productionFormat 
  : developmentFormat;

export const detailedLogger = combinedFormat;
