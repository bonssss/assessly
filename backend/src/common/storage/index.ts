import multer from "multer";
import path from "path";
import os from "os";
import fs from "fs";
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
    // Generate clean sanitized temporary name
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `tmp-${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`);
  },
});

// Create temp directory on startup
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Receipt Allowed Types & Extensions
const allowedReceiptMimeTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
const allowedReceiptExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

// Dangerous extensions blacklist (prevents stored XSS, script execution)
const dangerousExtensions = [
  ".html", ".htm", ".xhtml", ".svg", ".xml", ".php", ".js", ".mjs",
  ".ts", ".sh", ".bash", ".exe", ".bat", ".cmd", ".vbs", ".py", ".rb"
];

const receiptFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (dangerousExtensions.includes(ext)) {
    return cb(new BadRequestError("Uploaded file type is strictly disallowed for security reasons."));
  }

  if (allowedReceiptMimeTypes.includes(file.mimetype) && allowedReceiptExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid receipt file. Only valid JPG, PNG, and PDF files are accepted.`
      )
    );
  }
};

export const uploadReceipt = multer({
  storage,
  fileFilter: receiptFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max limit (SRS TBD-08)
  },
});

// Resource Allowed Types & Extensions
const allowedResourceMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
];

const allowedResourceExtensions = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".jpg", ".jpeg", ".png"
];

const resourceFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (dangerousExtensions.includes(ext)) {
    return cb(new BadRequestError("Uploaded file type is strictly disallowed for security reasons."));
  }

  if (allowedResourceMimeTypes.includes(file.mimetype) && allowedResourceExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid resource file format. Supported formats: PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), TXT, and JPG/PNG.`
      )
    );
  }
};

export const uploadResourceFile = multer({
  storage,
  fileFilter: resourceFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max limit for course resources
  },
});

export * from "./storage.interface.js";
