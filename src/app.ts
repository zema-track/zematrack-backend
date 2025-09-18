import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { logger, captureStartTime } from './config/logger';
import { errorHandler } from './middlewares/error-handler';

const app: Application = express();

// Middleware
app.use(captureStartTime);
app.use(logger);
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Error handler
app.use(errorHandler);

export default app;
