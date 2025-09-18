import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { logger, captureStartTime } from './config/logger';
import { errorHandler } from './middlewares/error-handler';
import routes from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// Middleware
app.use(captureStartTime);
app.use(logger);
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Zema Track API',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handler
app.use(errorHandler);

export default app;
