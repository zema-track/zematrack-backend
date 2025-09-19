
import mongoose, { Schema, Document, Model } from 'mongoose';

export enum Genre {
  POP = "Pop",
  ROCK = "Rock",
  METAL = "Metal",
  HIP_HOP = "Hip-Hop",
  RNB_SOUL = "R&B/Soul",
  ELECTRONIC = "Electronic",
  JAZZ = "Jazz",
  BLUES = "Blues",
  COUNTRY_FOLK = "Country/Folk",
  REGGAE_SKA = "Reggae/Ska",
  LATIN_WORLD = "Latin/World",
  CLASSICAL = "Classical",
  OTHER = "Other"
}


export interface ISong {
  title: string;
  artist: string;
  album?: string;
  genre: Genre;
  duration?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ISongCreate {
  title: string;
  artist: string;
  album?: string;
  genre: Genre;
  duration?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ISongUpdate {
  title?: string;
  artist?: string;
  album?: string;
  genre?: Genre;
  duration?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ISongFilter {
  genre?: Genre;
  artist?: string;
  album?: string;
  title?: string;
  search?: string;
}

export interface IStatsFilter {
  startDate?: Date;
  endDate?: Date;
  genre?: Genre;
  artist?: string;
  album?: string;
}

export interface ISongStats {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  songsByGenre: Record<Genre, number>;
  artistStats: Array<{
    artist: string;
    totalSongs: number;
    totalAlbums: number;
  }>;
  albumStats: Array<{
    album: string;
    artist: string;
    totalSongs: number;
  }>;
}

export interface ISongDocument extends ISong, Document {}

const songSchema = new Schema<ISongDocument>(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
      maxlength: [100, 'Artist name cannot exceed 100 characters']
    },
    album: {
      type: String,
      trim: true,
      maxlength: [200, 'Album name cannot exceed 200 characters']
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: {
        values: Object.values(Genre),
        message: 'Invalid genre. Must be one of: ' + Object.values(Genre).join(', ')
      }
    },
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
      default: 0
    },
    fileUrl: {
      type: String,
      trim: true
    },
    fileName: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number,
      min: [0, 'File size cannot be negative']
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
songSchema.index({ artist: 1, album: 1 });
songSchema.index({ genre: 1 });
songSchema.index({ createdAt: -1 });
songSchema.index({ deletedAt: 1 });

// Index fields commonly used in search
songSchema.index({ title: 1 });
songSchema.index({ artist: 1 });
songSchema.index({ album: 1 });

export const Song = mongoose.model<ISongDocument>('Song', songSchema);
