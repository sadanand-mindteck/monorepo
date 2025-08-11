import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect:"postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  },
})
