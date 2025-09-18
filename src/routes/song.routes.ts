import { Router } from 'express';
import SongController from '../controllers/song.controller';
import UploadMiddleware from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { songSchema, songUpdateSchema } from '../validators/song.validator';
import { SongStatsController } from '../controllers/songStats.controller';

const router = Router();

const songController = new SongController();
const uploadMiddleware = new UploadMiddleware();
const songStatsController = new SongStatsController();
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

// route for getting song statistics
router.get(
  '/stats',
  songStatsController.getStats
);

// route for getting a single song by id
router.get(
  '/:id',
  songController.getSongById
)

// route for updating a song
router.patch(
  '/:id',
  validate(songUpdateSchema),
  songController.updateSong
)

// route for deleting a song
router.delete(
  '/:id',
  songController.deleteSong
);

export default router;
