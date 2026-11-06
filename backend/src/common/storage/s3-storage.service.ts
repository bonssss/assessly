import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import os from "os";
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

  private sanitizeFolder(folder: string): string {
    return folder === "resources" ? "resources" : "receipts";
  }

  private sanitizeExtension(originalname: string): string {
    const rawExt = path.extname(originalname || "").toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    return allowed.includes(rawExt) ? rawExt : ".bin";
  }

  private getSafeSourcePath(sourcePath: string): string {
    const safeFilename = path.basename(sourcePath);
    const sourceDir = path.dirname(path.resolve(sourcePath));
    const safeResolved = path.resolve(sourceDir, safeFilename);

    const allowedRoots = [
      path.resolve(process.cwd(), "uploads"),
      path.resolve(os.tmpdir()),
      path.resolve("/tmp"),
    ];

    const isContained = allowedRoots.some(
      (root) => safeResolved.startsWith(root + path.sep) || safeResolved === root
    );

    if (!isContained) {
      throw new Error("Security exception: Invalid source file path location.");
    }

    return safeResolved;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = "receipts"
  ): Promise<StoredFileResult> {
    const safeFolder = this.sanitizeFolder(folder);
    const safeExt = this.sanitizeExtension(file.originalname);
    const safeFilename = `${safeFolder}-${crypto.randomUUID()}${safeExt}`;
    const key = `${safeFolder}/${path.basename(safeFilename)}`;

    let bodyBuffer: Buffer;
    if (file.buffer) {
      bodyBuffer = file.buffer;
    } else if (file.path) {
      const safeSourcePath = this.getSafeSourcePath(file.path);
      bodyBuffer = await fs.readFile(safeSourcePath);
      // Clean up local temp file after reading
      await fs.unlink(safeSourcePath).catch(() => {});
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
    const safeFolder = this.sanitizeFolder(key.split("/")[0] || "receipts");
    const safeFilename = path.basename(key);
    const safeKey = `${safeFolder}/${safeFilename}`;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: safeKey,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
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
