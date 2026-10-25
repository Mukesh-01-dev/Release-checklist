import "dotenv/config";
import { pool } from "../src/config/db.js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resetDatabase() {
  try {
    console.log("Dropping existing tables...");

    await pool.query(`
      DROP TABLE IF EXISTS release_steps;
      DROP TABLE IF EXISTS releases;
    `);

    console.log("Existing tables dropped.");

    const schema = await readFile(
      path.join(__dirname, "../sql/schema.sql"),
      "utf8"
    );

    await pool.query(schema);

    console.log("New database schema created successfully.");
  } catch (error) {
    console.error("Database reset failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

resetDatabase();
