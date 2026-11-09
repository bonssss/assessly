import crypto from "node:crypto";
import { config } from "../../config/env.js";
import type { TokenPayload } from "../types/index.js";

function parseDurationSeconds(duration: string | number): number {
  if (typeof duration === "number") {
    return duration;
  }
  const match = duration.match(/^(\d+)([dhms])?$/i);
  if (!match) {
    return 7 * 24 * 60 * 60; // default 7 days
  }
  const val = parseInt(match[1], 10);
  const unit = (match[2] || "s").toLowerCase();
  switch (unit) {
    case "d":
      return val * 86400;
    case "h":
      return val * 3600;
    case "m":
      return val * 60;
    case "s":
    default:
      return val;
  }
}

export const signToken = (
  payload: TokenPayload,
  expiresIn: string | number = "7d"
): string => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseDurationSeconds(expiresIn);

  const fullPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const content = `${headerB64}.${payloadB64}`;

  const signature = crypto
    .createHmac("sha256", config.jwtSecret)
    .update(content)
    .digest("base64url");

  return `${content}.${signature}`;
};

export const verifyToken = (token: string): TokenPayload => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const [headerB64, payloadB64, signature] = parts;
  const content = `${headerB64}.${payloadB64}`;

  const expectedSignature = crypto
    .createHmac("sha256", config.jwtSecret)
    .update(content)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid JWT signature");
  }

  const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
  const decoded = JSON.parse(payloadJson);

  if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
    throw new Error("JWT has expired");
  }

  return decoded as TokenPayload;
};
