import { Router } from 'express';
import SongController from '../controllers/song.controller';
import UploadMiddleware from '../middlewares/upload.middleware';

const router = Router();
const songController = new SongController();
const uploadMiddleware = new UploadMiddleware();

// Routes
router.post(
  '/',
  uploadMiddleware.uploadSingle('audio'),
  uploadMiddleware.handleUploadError,
  songController.createSong
);

export default router;
