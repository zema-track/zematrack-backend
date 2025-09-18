import { Request, Response, NextFunction } from 'express';
import SongService from '../services/song.service';
import S3UploadService, { FileUploadResult } from '../services/s3-upload.service';
import { ApiResponse, ApiResponseWithPagination } from '../utils/api-response';
import { ApiError } from '../utils/api-error';
import { ISongCreate, ISongUpdate, ISongFilter } from '../models';

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
      if (!req.file || !req.file.location) {
        throw ApiError.badRequest('Audio file is required');
      }

      // Process the uploaded file
      const fileResult = this.s3Service.processMulterFile(req.file);

      const songData: ISongCreate = {
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        genre: genre.trim(),
        duration: duration ? parseInt(duration) : undefined,
        fileUrl: fileResult.url,
        fileName: fileResult.originalName,
        fileSize: fileResult.size
      };

      const song = await this.songService.createSong(songData);

      const response = ApiResponse.created(song, 'Song created successfully');
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

}

export default SongController;
