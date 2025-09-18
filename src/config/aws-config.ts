import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

class AWSConfig {
  private static instance: AWSConfig;
  public s3: S3Client;

  private constructor() {
    // Configure AWS S3 Client
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'sa-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.validateConfig();
  }

  static getInstance(): AWSConfig {
    if (!AWSConfig.instance) {
      AWSConfig.instance = new AWSConfig();
    }
    return AWSConfig.instance;
  }

  private validateConfig() {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('AWS_ACCESS_KEY_ID is required');
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS_SECRET_ACCESS_KEY is required');
    }
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET_NAME is required');
    }
  }

  getBucketName(): string {
    return process.env.AWS_S3_BUCKET_NAME!;
  }
}

export default AWSConfig;
