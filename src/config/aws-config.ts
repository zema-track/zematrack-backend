import AWS from 'aws-sdk';
import { ApiError } from '../utils/api-error';

class AWSConfig {
  private static instance: AWSConfig;
  public s3: AWS.S3;

  private constructor() {
    // Configure AWS
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'sa-east-1'
    });

    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME
      }
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
