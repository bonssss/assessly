import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "default_development_jwt_secret",
  databaseUrl: process.env.DATABASE_URL || "",
  freeTrialQuota: Number(process.env.FREE_TRIAL_QUOTA) || 5,

  // File Storage Configuration (local vs s3/r2)
  storageDriver: (process.env.STORAGE_DRIVER || "local") as "local" | "s3",
  s3Bucket: process.env.S3_BUCKET || "",
  s3Region: process.env.S3_REGION || "auto",
  s3Endpoint: process.env.S3_ENDPOINT || "", // e.g. Cloudflare R2: https://<account_id>.r2.cloudflarestorage.com
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
};
