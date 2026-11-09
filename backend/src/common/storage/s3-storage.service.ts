import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
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

  private sanitizeFolder(folder: string): string {
    return folder === "resources" ? "resources" : "receipts";
  }

  private sanitizeExtension(originalname: string): string {
    const rawExt = path.extname(originalname || "").toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    return allowed.includes(rawExt) ? rawExt : ".bin";
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = "receipts"
  ): Promise<StoredFileResult> {
    const safeFolder = this.sanitizeFolder(folder);
    const safeExt = this.sanitizeExtension(file.originalname);
    const safeFilename = `${safeFolder}-${crypto.randomUUID()}${safeExt}`;
    const safeTargetFilename = path.basename(safeFilename);
    const key = `${safeFolder}/${safeTargetFilename}`;

    const bodyBuffer = file.buffer || Buffer.alloc(0);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: bodyBuffer,
      ContentType: file.mimetype,
    });

    await this.client.send(command);

    // Generate initial signed URL valid for 15 minutes
    const url = await this.getSignedUrl(key, 900);

    const result = {
      key,
      url,
      mimeType: file.mimetype,
      size: bodyBuffer.length,
    };
    return result;
  }

  /**
   * Generates a time-limited presigned GET URL for authorized viewing (SRS §10.2 & §10.3)
   */
  async getSignedUrl(key: string, expiresInSeconds: number = 900): Promise<string> {
    const safeFolder = this.sanitizeFolder(key.split("/")[0] || "receipts");
    const safeFilename = path.basename(key);
    const safeKey = `${safeFolder}/${safeFilename}`;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: safeKey,
    });

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
    return signedUrl;
  }

  async deleteFile(key: string): Promise<void> {
    const safeFolder = this.sanitizeFolder(key.split("/")[0] || "receipts");
    const safeFilename = path.basename(key);
    const safeKey = `${safeFolder}/${safeFilename}`;

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: safeKey,
    });

    await this.client.send(command);
  }
}
