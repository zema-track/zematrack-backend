import { DatabaseService } from '../utils/database-service';
import { ApiError } from '../utils/api-error';
import S3UploadService from './s3-upload.service';
import {
  ISong, ISongCreate, Song, ISongUpdate,
  ISongFilter, ISongStats, ISongDocument
} from '../models';

class SongService {
  private s3Service: S3UploadService;

  constructor() {
    this.s3Service = new S3UploadService();
  }

  // Create a new song
  async createSong(songData: ISongCreate): Promise<ISong> {
    try {
      // Validate required fields
      const { title, artist, album, genre } = songData;
      if (!title || !artist || !album || !genre) {
        throw ApiError.badRequest('Title, artist, album, and genre are required');
      }

      const song = await DatabaseService.create<ISong>(Song, songData);
      return song;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal('Failed to create song');
    }
  }

}


export default SongService;
