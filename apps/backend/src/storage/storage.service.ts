import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string | undefined;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('storage.endpoint');
    const region = this.configService.get<string>('storage.region') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('storage.accessKey') || '';
    const secretAccessKey = this.configService.get<string>('storage.secretKey') || '';

    this.s3 = new S3Client({
      region,
      ...(endpoint && { endpoint }),
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true, // Required for MinIO compatibility
    });

    this.bucket = this.configService.get<string>('storage.bucket') || 'daily-english-lab';
    this.publicUrl = this.configService.get<string>('storage.publicUrl');
  }

  async uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    this.logger.log(`Uploaded file: ${key}`);
    return this.publicUrl ? `${this.publicUrl}/${this.bucket}/${key}` : key;
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`Deleted file: ${key}`);
  }
}
