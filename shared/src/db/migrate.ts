import { migrate } from "drizzle-orm/postgres-js/migrator"
import { db, sql } from "./connection.js"

async function runMigrations() {
  try {
    console.log("Running migrations...")
    await migrate(db, { migrationsFolder: "./src/db/migrations" })
    console.log("Migrations completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await sql.end()
  }
}

runMigrations()
