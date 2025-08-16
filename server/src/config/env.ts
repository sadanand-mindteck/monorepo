import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3001,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "cookie-secret",
  UPLOAD_PATH: process.env.UPLOAD_PATH || "./uploads",
  MAX_FILE_SIZE: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760"),
  isProduction: process.env.NODE_ENV === "production",
};
