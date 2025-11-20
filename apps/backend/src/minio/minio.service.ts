import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = this.configService.get<string>('MINIO_PORT');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL');
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');
    const bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');

    if (!endPoint || !port || !accessKey || !secretKey || !bucketName) {
      throw new Error('Minio configuration environment variables are missing.');
    }

    this.bucketName = bucketName;

    this.minioClient = new Minio.Client({
      endPoint,
      port: +port,
      useSSL: useSSL === 'true',
      accessKey,
      secretKey,
    });

    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1'); // Default region
      console.log(`Minio bucket '${this.bucketName}' created.`);
    } else {
      console.log(`Minio bucket '${this.bucketName}' already exists.`);

      let policy;
      try {
        policy = await this.minioClient.getBucketPolicy(this.bucketName);
        // oxlint-disable-next-line no-unused-vars
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        policy = null;
      }
      if (!policy) {
        const policy = `
            {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Principal": { "AWS": ["*"] },
                  "Action": ["s3:GetObject"],
                  "Resource": ["arn:aws:s3:::${this.bucketName}*"]
                }
              ]
            }`;
        void this.minioClient.setBucketPolicy(this.bucketName, policy);
      }
    }
  }

  async uploadFile(
    objectName: string,
    filePath: string,
    metaData: Minio.ItemBucketMetadata,
  ) {
    return this.minioClient.fPutObject(
      this.bucketName,
      objectName,
      filePath,
      metaData,
    );
  }

  async upload(
    objectName: string,
    buffer: Buffer,
    metaData: Minio.ItemBucketMetadata,
  ) {
    return this.minioClient.putObject(
      this.bucketName,
      objectName,
      buffer,
      buffer.length,
      metaData,
    );
  }

  getFileUrl(objectName: string): string {
    // Minio client does not directly provide a public URL.
    // You might need to construct it based on your Minio server's public endpoint
    // or use presigned URLs for temporary access.
    // For simplicity, we'll construct a direct URL assuming Minio is publicly accessible.
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = this.configService.get<string>('MINIO_PORT');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL');
    const protocol = useSSL === 'true' ? 'https' : 'http';
    return `${protocol}://${endPoint}:${port}/${this.bucketName}/${objectName}`;
  }

  async deleteFile(objectName: string) {
    return this.minioClient.removeObject(this.bucketName, objectName);
  }
}
