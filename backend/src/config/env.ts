import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = process.env.JWT_SECRET || "default_development_jwt_secret";

if (nodeEnv === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "default_development_jwt_secret")) {
  console.error("FATAL SECURITY ERROR: JWT_SECRET must be set to a secure unique secret in production environment.");
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret,
  databaseUrl: process.env.DATABASE_URL || "",
  freeTrialQuota: Number(process.env.FREE_TRIAL_QUOTA) || 5,

  // File Storage Configuration (local vs s3/r2)
  storageDriver: (process.env.STORAGE_DRIVER || "local") as "local" | "s3",
  s3Bucket: process.env.S3_BUCKET || "",
  s3Region: process.env.S3_REGION || "auto",
  s3Endpoint: process.env.S3_ENDPOINT || "", // e.g. Cloudflare R2: https://<account_id>.r2.cloudflarestorage.com
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",

  // Email Configuration (SMTP / Gmail)
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: Number(process.env.EMAIL_PORT) || 465,
  emailSecure: process.env.EMAIL_SECURE !== "false",
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  emailFrom: process.env.EMAIL_FROM || "Assessly <noreply@assessly.com>",
  clientUrl: process.env.CLIENT_URL || "http://localhost:8080",
};
