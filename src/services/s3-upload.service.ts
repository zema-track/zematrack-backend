import multer from 'multer';
import multerS3 from 'multer-s3';
import { Request } from 'express';
import AWSConfig from '../config/aws-config';
import { ApiError } from '../utils/api-error';
import path from 'path';
import crypto from 'crypto';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface FileUploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  originalName: string;
}

class S3UploadService {
  private aws: AWSConfig;
  private allowedMimeTypes: string[] = [
    'audio/mpeg', // .mp3
    'audio/wav',  // .wav
    'audio/mp4',  // .m4a
    'audio/aac',  // .aac
    'audio/ogg',  // .ogg
    'audio/flac', // .flac
    'audio/x-ms-wma' // .wma
  ];
  private maxFileSize: number = 50 * 1024 * 1024; // 50MB

  constructor() {
    this.aws = AWSConfig.getInstance();
  }

  // Generate unique filename
  private generateFileName(originalName: string): string {
    const extension = path.extname(originalName);
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(6).toString('hex');
    return `songs/${timestamp}-${randomBytes}${extension}`;
  }

  // File filter function
  private fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      const allowedTypes = this.allowedMimeTypes.join(', ');
      return cb(new ApiError(400, `Invalid file type. Allowed types: ${allowedTypes}`));
    }

    cb(null, true);
  };

  // Create multer upload middleware
  getUploadMiddleware() {
    return multer({
      storage: multerS3({
        s3: this.aws.s3,
        bucket: this.aws.getBucketName(),
        acl: 'public-read',
        key: (req: Request, file: Express.Multer.File, cb) => {
          const fileName = this.generateFileName(file.originalname);
          cb(null, fileName);
        },
        metadata: (req: Request, file: Express.Multer.File, cb) => {
          cb(null, {
            fieldName: file.fieldname,
            originalName: file.originalname,
            uploadedAt: new Date().toISOString()
          });
        }
      }),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: 1
      }
    });
  }

  // Upload single file directly to S3
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<FileUploadResult> {
    try {
      // Validate file type
      if (!this.allowedMimeTypes.includes(mimeType)) {
        throw ApiError.badRequest('Invalid file type');
      }

      // Validate file size
      if (buffer.length > this.maxFileSize) {
        throw ApiError.badRequest('File size too large');
      }

      const fileName = this.generateFileName(originalName);

      const upload = new Upload({
        client: this.aws.s3,
        params: {
          Bucket: this.aws.getBucketName(),
          Key: fileName,
          Body: buffer,
          ContentType: mimeType,
          ACL: 'public-read',
          Metadata: {
            originalName: originalName,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      const result = await upload.done();

      return {
        url: `https://${this.aws.getBucketName()}.s3.${process.env.AWS_REGION || 'sa-east-1'}.amazonaws.com/${fileName}`,
        key: fileName,
        bucket: this.aws.getBucketName(),
        size: buffer.length,
        originalName: originalName
      };

    } catch (error) {
      console.error('S3 upload error:', error);
      throw ApiError.internal('Failed to upload file to S3');
    }
  }
  // Delete file from S3
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.aws.getBucketName(),
        Key: key
      });

      await this.aws.s3.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw ApiError.internal('Failed to delete file from S3');
    }
  }

  // Get file info from S3
  async getFileInfo(key: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.aws.getBucketName(),
        Key: key
      });

      const result = await this.aws.s3.send(command);
      return result;
    } catch (error) {
      console.error('S3 head object error:', error);
      throw ApiError.notFound('File not found in S3');
    }
  }

  // Generate pre-signed URL for temporary access
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.aws.getBucketName(),
      Key: key
    });

    return await getSignedUrl(this.aws.s3, command, { expiresIn });
  }
  // Process uploaded file result from multer-s3
  processMulterFile(file: Express.Multer.File & { location?: string; key?: string }): FileUploadResult {
    if (!file.location || !file.key) {
      throw ApiError.internal('Invalid file upload result');
    }

    return {
      url: file.location,
      key: file.key,
      bucket: this.aws.getBucketName(),
      size: file.size,
      originalName: file.originalname
    };
  }
}

export default S3UploadService;
