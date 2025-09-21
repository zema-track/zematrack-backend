import { Request, Response, NextFunction } from 'express';
import SongService from '../services/song.service';
import S3UploadService, { FileUploadResult } from '../services/s3-upload.service';
import { ApiResponse, ApiResponseWithPagination } from '../utils/api-response';
import { ApiError } from '../utils/api-error';
import { ISongCreate, ISongFilter, Genre } from '../models';

interface MulterRequest extends Request {
  file?: Express.Multer.File & { location?: string; key?: string };
}

class SongController {
  private songService: SongService;
  private s3Service: S3UploadService;

  constructor() {
    this.songService = new SongService();
    this.s3Service = new S3UploadService();
  }

  // Create song
  createSong = async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      const { title, artist, album, genre, duration } = req.body;

      // Check if file was uploaded(attached)
      if (!req.file) {
        throw ApiError.badRequest('Audio file is required');
      }

      // Upload file to S3
      const uploadResult: FileUploadResult = await this.s3Service.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      );

      const songData: ISongCreate = {
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        genre: genre.trim(),
        duration: duration ? parseInt(duration) : undefined,
        fileUrl: uploadResult.url,
        fileName: uploadResult.originalName,
        fileSize: uploadResult.size
      };

      const song = await this.songService.createSong(songData);

      const response = ApiResponse.created(song, 'Song created successfully');
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

   // Get all songs
  getSongs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        genre,
        artist,
        album,
        title,
        search
      } = req.query;

      const filter: ISongFilter = {};
      const genreValue = genre as string;
      if (genreValue && Object.values(Genre).includes(genreValue as Genre)) {
        filter.genre = genreValue as Genre;
      }
      if (artist) filter.artist = artist as string;
      if (album) filter.album = album as string;
      if (title) filter.title = title as string;
      if (search) filter.search = search as string;

      const result = await this.songService.getSongs(
        filter,
        parseInt(page as string),
        parseInt(limit as string),
        sortBy as string,
        sortOrder as 'asc' | 'desc'
      );

      const response = ApiResponseWithPagination.paginated(
        result.items,
        result.total,
        result.page,
        result.limit,
        'Songs retrieved successfully'
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Get single song by ID
  getSongById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const song = await this.songService.getSongById(id);
      const response = ApiResponse.success(song, 'Song retrieved successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Update song
  updateSong = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const song = await this.songService.updateSong(id, req.body);
      const response = ApiResponse.success(song, 'Song updated successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Delete song
  deleteSong = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deletedSongId = await this.songService.deleteSong(id);
      const response = ApiResponse.success(deletedSongId, 'Song deleted successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default SongController;
