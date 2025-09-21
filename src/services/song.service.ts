import { ApiError } from '../utils/api-error';
import S3UploadService from './s3-upload.service';
import {
  ISong, ISongCreate, Song, ISongUpdate, ISongDocument,
  ISongFilter, IStatsFilter, ISongStats, Genre
} from '../models';

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class SongService {
  private s3Service: S3UploadService;

  constructor() {
    this.s3Service = new S3UploadService();
  }

  // Create a new song
  async createSong(songData: ISongCreate): Promise<ISong> {
    try {
      const song = await Song.create(songData);
      return song;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw ApiError.conflict(`${field} already exists`);
      }
      throw ApiError.internal('Failed to create song');
    }
  }

  // Get all songs with filtering and pagination
  async getSongs(
    filter: ISongFilter = {},
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<PaginatedResult<ISong>> {
    try {
      // Build filter object
      const Filter: any = { };

      // Genre filter
      if (filter.genre) {
        Filter.genre = new RegExp(filter.genre, 'i');
      }

      // Artist filter
      if (filter.artist) {
        Filter.artist = new RegExp(filter.artist, 'i');
      }

      // Album filter
      if (filter.album) {
        Filter.album = new RegExp(filter.album, 'i');
      }

      // Title filter
      if (filter.title) {
        Filter.title = new RegExp(filter.title, 'i');
      }

      // Search across multiple fields with partial matching
      if (filter.search) {
        const searchRegex = new RegExp(filter.search, 'i');
        Filter.$or = [
          { title: searchRegex },
          { artist: searchRegex },
          { album: searchRegex }
        ];
      }

      // Sort configuration
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Pagination
      const skip = (page - 1) * limit;
      const actualLimit = Math.min(limit, 100);
      const actualPage = Math.max(page, 1);

      // Execute both queries in parallel
      const [songs, total] = await Promise.all([
        Song.find(Filter)
          .sort(sort)
          .skip(skip)
          .limit(actualLimit)
          .exec(),
        Song.countDocuments(Filter)
      ]);

      const pages = Math.ceil(total / actualLimit);

      return {
        items: songs,
        total,
        page: actualPage,
        limit: actualLimit,
        pages,
        hasNext: actualPage < pages,
        hasPrev: actualPage > 1
      };
    } catch (error) {
      throw ApiError.internal('Failed to fetch songs');
    }
  }

  // Get single song by ID
  async getSongById(id: string): Promise<ISong> {
    try {
      const song = await Song.findById(id);
      if (!song) throw ApiError.notFound('Song not found');
      return song as ISong;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal('Failed to fetch song');
    }
  }

  // Update song
  async updateSong(id: string, updateData: ISongUpdate): Promise<ISong> {
    try {
      // prepare update data
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([key, value]) => {
          if (value === undefined) return false;
          if (typeof value === 'string' && value.trim().length === 0) return false;
          return true;
        })
      );

      if (Object.keys(cleanUpdateData).length === 0) {
        throw ApiError.badRequest('No valid update data provided');
      }

      const song = await Song.findByIdAndUpdate(id, cleanUpdateData, { new: true });
      if (!song) throw ApiError.notFound('Song not found');
      return song as ISong;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal('Failed to update song');
    }
  }

// Delete song (soft delete)
async deleteSong(id: string): Promise<{ _id: typeof id }> {
  try {
    // get the song to check if it has a file URL
    const song = await this.getSongById(id);

    // delete file from S3
    if (song.fileUrl) {
      try {
        const url = new URL(song.fileUrl);
        const key = url.pathname.substring(1);
        await this.s3Service.deleteFile(key);
      } catch (s3Error) {
        throw ApiError.internal('Failed to delete file from S3');
      }
    }

    await Song.findByIdAndDelete(id);
    return { _id: id };

  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Failed to delete song');
  }
}

}

export default SongService;
