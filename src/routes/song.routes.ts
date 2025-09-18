import { Router } from 'express';
import SongController from '../controllers/song.controller';
import UploadMiddleware from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { songSchema } from '../validators/song.validator';

const router = Router();

const songController = new SongController();
const uploadMiddleware = new UploadMiddleware();

// Routes
router.post(
  '/',
  validate(songSchema),
  uploadMiddleware.uploadSingle('audio'),
  uploadMiddleware.handleUploadError,
  songController.createSong
);

export default router;
