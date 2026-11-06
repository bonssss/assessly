import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import type { IStorageProvider, StoredFileResult } from "./storage.interface.js";

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), "uploads");
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
    // Extract base name to eliminate any directory traversal sequences
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
    const targetDir = path.resolve(this.baseDir, safeFolder);
    await fs.mkdir(targetDir, { recursive: true });

    const safeExt = this.sanitizeExtension(file.originalname);
    const safeBasename = `${safeFolder}-${crypto.randomUUID()}${safeExt}`;
    const safeTargetFilename = path.basename(safeBasename);
    const targetPath = path.resolve(targetDir, safeTargetFilename);

    if (!targetPath.startsWith(targetDir + path.sep)) {
      throw new Error("Security exception: Target path traversal detected.");
    }

    if (file.path) {
      const safeSourcePath = this.getSafeSourcePath(file.path);
      try {
        await fs.rename(safeSourcePath, targetPath);
      } catch (err: any) {
        if (err.code === "EXDEV") {
          await fs.copyFile(safeSourcePath, targetPath);
          await fs.unlink(safeSourcePath).catch(() => {});
        } else {
          throw err;
        }
      }
    } else if (file.buffer) {
      await fs.writeFile(targetPath, file.buffer);
    }

    const key = `${safeFolder}/${safeTargetFilename}`;
    const endpointPrefix = safeFolder === "resources" ? "/api/v1/resources/files" : "/api/v1/payments/receipts";

    return {
      key,
      url: `${endpointPrefix}/${encodeURIComponent(safeTargetFilename)}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async getSignedUrl(key: string, _expiresInSeconds: number = 900): Promise<string> {
    const safeFilename = path.basename(key);
    const rawFolder = key.split("/")[0] || "receipts";
    const safeFolder = this.sanitizeFolder(rawFolder);
    const endpointPrefix = safeFolder === "resources" ? "/api/v1/resources/files" : "/api/v1/payments/receipts";
    return `${endpointPrefix}/${encodeURIComponent(safeFilename)}`;
  }

  async deleteFile(key: string): Promise<void> {
    const safeFolder = this.sanitizeFolder(key.split("/")[0] || "receipts");
    const safeFilename = path.basename(key);
    const targetDir = path.resolve(this.baseDir, safeFolder);
    const filePath = path.resolve(targetDir, safeFilename);

    if (filePath.startsWith(targetDir + path.sep)) {
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore if file does not exist
      }
    }
  }
}
