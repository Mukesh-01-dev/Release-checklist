import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1]
    ? process.argv[i + 1]
    : fallback;
}

const target = process.argv[2];
const duration = Number(argValue("--duration", "15"));
const levels = argValue("--levels", "1,5,10,20")
  .split(",")
  .map((n) => Number(n.trim()));

if (
  !target ||
  !/^https?:\/\/.+\/graphql\/?$/i.test(target)
) {
  console.error(
    "Usage: node benchmark.mjs https://YOUR-BACKEND.example.com/graphql"
  );
  process.exit(2);
}

if (!Number.isInteger(duration) || duration < 5 || duration > 120) {
  console.error("--duration must be between 5 and 120 seconds.");
  process.exit(2);
}

if (
  levels.length === 0 ||
  levels.some((n) => !Number.isInteger(n) || n < 1 || n > 50)
) {
  console.error("--levels must contain integers from 1 to 50.");
  process.exit(2);
}

const body = JSON.stringify({
  operationName: "GetReleases",
  query:
    "query GetReleases { releases { id name status completedSteps totalSteps } }",
});

const outDir = resolve(here, "results");
await mkdir(outDir, { recursive: true });

console.log("\nRelease Checklist Tool - concurrency benchmark");
console.log(`Target: ${target}`);
console.log(`Duration per level: ${duration}s`);
console.log(`Concurrency levels: ${levels.join(", ")}`);
console.log("Read-only GraphQL query; press Ctrl+C to stop.\n");

// Verify the endpoint before running the benchmark.
const preflight = spawnSync(
  "curl",
  [
    "-sS",
    "-o",
    "/dev/null",
    "-w",
    "%{http_code}",
    "-X",
    "POST",
    target,
    "-H",
    "Content-Type: application/json",
    "--data-raw",
    body,
    "--max-time",
    "20",
  ],
  { encoding: "utf8" }
);

if (
  preflight.error ||
  preflight.status !== 0 ||
  !/^2\d\d$/.test((preflight.stdout || "").trim())
) {
  console.error("Preflight request failed.");
  if (preflight.stderr) console.error(preflight.stderr.trim());
  console.error(`HTTP status: ${preflight.stdout?.trim() || "none"}`);
  process.exit(1);
}

console.log(`Preflight passed: HTTP ${preflight.stdout.trim()}\n`);

const csvRows = [
  [
    "timestamp",
    "target",
    "concurrency",
    "duration_seconds",
    "requests_per_second",
    "latency_avg_ms",
    "latency_p95_ms",
    "latency_p99_ms",
    "errors",
    "timeouts",
    "non_2xx",
  ],
];

for (const concurrency of levels) {
  console.log(`\n=== Concurrency ${concurrency} | ${duration}s ===`);

  const run = spawnSync(
    "npx",
    [
      "--yes",
      "autocannon",
      "-c",
      String(concurrency),
      "-d",
      String(duration),
      "-m",
      "POST",
      "-H",
      "Content-Type: application/json",
      "-b",
      body,
      "--json",
      target,
    ],
    {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      timeout: (duration + 90) * 1000,
    }
  );

  const timestamp = new Date().toISOString();
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  const rawPath = resolve(
    outDir,
    `concurrency-${concurrency}-${safeTimestamp}.json`
  );

  await writeFile(
    rawPath,
    JSON.stringify(
      {
        timestamp,
        target,
        concurrency,
        durationSeconds: duration,
        exitCode: run.status,
        stdout: run.stdout || "",
        stderr: run.stderr || "",
      },
      null,
      2
    )
  );

  let data;

  try {
    const output = run.stdout || "";
    const firstBrace = output.indexOf("{");
    const lastBrace = output.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      data = JSON.parse(output.slice(firstBrace, lastBrace + 1));
    }
  } catch {
    // Raw output is saved for diagnosis.
  }

  if (run.error || run.status !== 0 || !data) {
    console.error(`Could not parse results for concurrency ${concurrency}.`);
    if (run.error) console.error(run.error.message);
    if (run.stderr) console.error(run.stderr.trim());
    if (run.stdout) console.log(run.stdout.trim());

    csvRows.push([
      timestamp, target, concurrency, duration, "", "", "", "", "", "", "",
    ]);
    continue;
  }

  const reqPerSec = data.requests?.average ?? "";
  const latencyAvg = data.latency?.average ?? "";
  const latencyP95 = data.latency?.p95 ?? "";
  const latencyP99 = data.latency?.p99 ?? "";
  const errors = data.errors ?? 0;
  const timeouts = data.timeouts ?? 0;
  const non2xx = data.non2xx ?? 0;

  console.log(`Requests/sec: ${reqPerSec}`);
  console.log(
    `Latency avg / p95 / p99: ${latencyAvg} / ${latencyP95} / ${latencyP99} ms`
  );
  console.log(`Errors: ${errors} | Timeouts: ${timeouts} | Non-2xx: ${non2xx}`);

  csvRows.push([
    timestamp,
    target,
    concurrency,
    duration,
    reqPerSec,
    latencyAvg,
    latencyP95,
    latencyP99,
    errors,
    timeouts,
    non2xx,
  ]);
}

const csv = csvRows
  .map((row) =>
    row
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(",")
  )
  .join("\n");

const csvPath = resolve(outDir, "summary.csv");
await writeFile(csvPath, `${csv}\n`, "utf8");

console.log("\nBenchmark complete.");
console.log(`CSV summary: ${csvPath}`);
