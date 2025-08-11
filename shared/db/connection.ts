import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema.js"
import dotenv from "dotenv"

dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const sql = postgres(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })
db.execute
export { sql }
