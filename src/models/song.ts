
import mongoose, { Schema, Document } from 'mongoose';


export interface ISong {
  title: string;
  artist: string;
  album?: string;
  genre: string;
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
  genre: string;
  duration?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ISongUpdate {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  duration?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ISongFilter {
  genre?: string;
  artist?: string;
  album?: string;
  search?: string;
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
      trim: true,
      maxlength: [50, 'Genre cannot exceed 50 characters']
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

export const Song = mongoose.model<ISongDocument>('Song', songSchema);
