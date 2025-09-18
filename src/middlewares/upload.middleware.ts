import { Request, Response, NextFunction } from 'express';
import S3UploadService from '../services/s3-upload.service';
import multer from 'multer';

class UploadMiddleware {
  private s3Service: S3UploadService;

  constructor() {
    this.s3Service = new S3UploadService();
  }

  parseOnly = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } 
  }).single('audio');

  // Single file upload middleware
  uploadSingle(fieldName: string) {
    const upload = this.s3Service.getUploadMiddleware();
    return upload.single(fieldName);
  }

  // Multiple files upload middleware
  uploadMultiple(fieldName: string, maxCount: number = 10) {
    const upload = this.s3Service.getUploadMiddleware();
    return upload.array(fieldName, maxCount);
  }

  // Multiple fields upload middleware
  uploadFields(fields: { name: string; maxCount?: number }[]) {
    const upload = this.s3Service.getUploadMiddleware();
    return upload.fields(fields);
  }

  // Error handling middleware for multer errors
  handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 50MB.',
        });
      }
      
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded.',
        });
      }
      
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.',
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || 'File upload error',
      });
    }
    
    next();
  };
}

export default UploadMiddleware;
