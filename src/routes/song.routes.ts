import { Router } from 'express';
import SongController from '../controllers/song.controller';
import UploadMiddleware from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { songSchema } from '../validators/song.validator';

const router = Router();

const songController = new SongController();
const uploadMiddleware = new UploadMiddleware();

// Routes for creating a song
router.post(
  '/',
  uploadMiddleware.parseOnly, 
  validate(songSchema),
  songController.createSong
);

// route for getting all songs
router.get(
  '/',
  songController.getSongs
)

// route for getting a single song by id
router.get(
  '/:id',
  songController.getSongById
)

export default router;
