import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("PostgreSQL connection established");
});

pool.on("remove", () => {
  console.log("PostgreSQL connection removed from pool");
});

pool.on("error", (err) => {
  console.error("Unexpected idle PostgreSQL client error:", err.message);
});