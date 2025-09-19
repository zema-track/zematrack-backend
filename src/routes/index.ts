import { Router, Request, Response } from 'express';
import songRoutes from './song.routes';
import { ApiResponse } from '../utils/api-response';

const router = Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
  const response = ApiResponse.success({
    status: 'OK',
    uptime: process.uptime()
  }, 'Service is healthy');
  
  res.json(response);
});

// API routes
router.use('/songs', songRoutes);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


export default router;
