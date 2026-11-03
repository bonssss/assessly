import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";
import type { TokenPayload } from "../types/index.js";

export const signToken = (
  payload: TokenPayload,
  expiresIn: string = "7d"
): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

