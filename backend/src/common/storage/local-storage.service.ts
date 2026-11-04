import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { IStorageProvider, StoredFileResult } from "./storage.interface.js";

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), "uploads");
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = "receipts"
  ): Promise<StoredFileResult> {
    const targetDir = path.join(this.baseDir, folder);
    await fs.mkdir(targetDir, { recursive: true });

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${folder}-${crypto.randomUUID()}${ext}`;
    const targetPath = path.join(targetDir, filename);

    if (file.path) {
      // If multer already wrote a temp file, move it
      await fs.rename(file.path, targetPath);
    } else if (file.buffer) {
      // If multer memory storage
      await fs.writeFile(targetPath, file.buffer);
    }

    const key = `${folder}/${filename}`;
    const endpointPrefix = folder === "resources" ? "/api/v1/resources/files" : "/api/v1/payments/receipts";

    return {
      key,
      url: `${endpointPrefix}/${encodeURIComponent(filename)}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async getSignedUrl(key: string, _expiresInSeconds: number = 900): Promise<string> {
    // For local driver, points to the local download/preview API endpoint
    const filename = path.basename(key);
    const folder = key.split("/")[0] || "receipts";
    const endpointPrefix = folder === "resources" ? "/api/v1/resources/files" : "/api/v1/payments/receipts";
    return `${endpointPrefix}/${encodeURIComponent(filename)}`;
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}


