import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { logger, captureStartTime } from './config/logger';
import { errorHandler } from "./middlewares/error-handler";
import routes from './routes';

const app: Application = express();

// Middleware
app.use(captureStartTime);
app.use(logger);

const allowedOrigins = (process.env.ORIGIN_URLS || "").split(',').filter(origin => origin.trim() !== "");
// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.use(helmet());
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
