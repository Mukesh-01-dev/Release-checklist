import { readFile } from "node:fs/promises";
import { pool } from "../src/config/db.js";

const schemaPath = new URL("../sql/schema.sql", import.meta.url);

try {
  const sql = await readFile(schemaPath, "utf8");
  await pool.query(sql);
  console.log("Database schema setup completed successfully.");
} catch (error) {
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}