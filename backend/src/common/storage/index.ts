import multer from "multer";
import path from "path";
import os from "os";
import { config } from "../../config/env.js";
import { LocalStorageProvider } from "./local-storage.service.js";
import { S3StorageProvider } from "./s3-storage.service.js";
import { BadRequestError } from "../errors/app-error.js";
import type { IStorageProvider } from "./storage.interface.js";

// Factory for active storage provider
export const storageProvider: IStorageProvider =
  config.storageDriver === "s3"
    ? new S3StorageProvider()
    : new LocalStorageProvider();

// Multer upload middleware with temporary disk buffering
const tempDir = path.join(os.tmpdir(), "assessly-uploads");
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `tmp-${Date.now()}-${file.originalname}`);
  },
});

// Create temp directory on startup
import fs from "fs";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file format (${file.mimetype}). Only JPG, PNG, and PDF receipts are accepted.`
      )
    );
  }
};

export const uploadReceipt = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max limit (SRS TBD-08)
  },
});

export * from "./storage.interface.js";

