import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { config } from "../../config/env.js";
import type { IStorageProvider, StoredFileResult } from "./storage.interface.js";

export class S3StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = config.s3Bucket;

    this.client = new S3Client({
      region: config.s3Region,
      endpoint: config.s3Endpoint || undefined, // Used for Cloudflare R2 / MinIO
      credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = "receipts"
  ): Promise<StoredFileResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${folder}-${crypto.randomUUID()}${ext}`;
    const key = `${folder}/${filename}`;

    let bodyBuffer: Buffer;
    if (file.buffer) {
      bodyBuffer = file.buffer;
    } else if (file.path) {
      bodyBuffer = await fs.readFile(file.path);
      // Clean up local temp file after reading
      await fs.unlink(file.path).catch(() => {});
    } else {
      throw new Error("File content is not available for S3 upload");
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: bodyBuffer,
      ContentType: file.mimetype,
    });

    await this.client.send(command);

    // Generate initial signed URL valid for 15 minutes
    const url = await this.getSignedUrl(key, 900);

    return {
      key,
      url,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  /**
   * Generates a time-limited presigned GET URL for authorized viewing (SRS §10.2 & §10.3)
   */
  async getSignedUrl(key: string, expiresInSeconds: number = 900): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}

