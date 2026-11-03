import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { BadRequestError } from "../errors/app-error.js";

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "receipts");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `receipt-${uniqueId}${ext}`);
  },
});

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
        `Invalid file type (${file.mimetype}). Only JPG, PNG, and PDF receipts are accepted.`
      )
    );
  }
};

export const uploadReceipt = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max size limit
  },
});
