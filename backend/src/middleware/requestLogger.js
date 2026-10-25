
import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const logDirectory = join(currentDir, "../../logs");
const logFile = join(logDirectory, "requests.log");

export async function requestLogger(req, res, next) {
  const requestId = randomUUID();
  const start = process.hrtime.bigint();

  res.setHeader("X-Request-Id", requestId);

  res.on("finish", async () => {
    const durationMs =
      Number(process.hrtime.bigint() - start) / 1_000_000;

    const entry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl,
      operation: req.body?.operationName ?? "-",
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    };

    const line = JSON.stringify(entry);

    console.log(line);

    try {
      await mkdir(logDirectory, { recursive: true });
      await appendFile(logFile, `${line}\n`, "utf8");
    } catch (error) {
      console.error("Failed to write request log:", error.message);
    }
  });

  next();
}
