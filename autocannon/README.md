# Autocannon benchmark runner

A small Node.js script for repeatable, read-only concurrent GraphQL tests against the deployed Release Checklist Tool backend.

## Requirements
- Node.js 18+
- `curl`
- Internet access
- Deployed backend URL ending in `/graphql`

## Run

```bash
node benchmark.mjs https://YOUR-BACKEND-URL.onrender.com/graphql
```

Optional settings:

```bash
node benchmark.mjs https://YOUR-BACKEND-URL.onrender.com/graphql --duration 15 --levels 1,5,10,20
```

- `--duration`: seconds per concurrency level, 5–120
- `--levels`: comma-separated concurrency levels, each 1–50

The script sends only this read-only query:

```graphql
query GetReleases {
  releases {
    id
    name
    status
    completedSteps
    totalSteps
  }
}
```

It checks the endpoint before testing, then runs Autocannon at each concurrency level.

## Output

The `results/` folder contains:
- `summary.csv`: summary metrics per concurrency level
- `concurrency-*.json`: raw output for each run

Metrics include average requests/sec, average latency, p95/p99 latency, errors, timeouts, and non-2xx responses.

## Compare cache impact fairly

Run against the uncached deployment, save its results, then run against the cached deployment using the same dataset, duration, and concurrency levels. Warm the cache before the cached test. Keep cold-start results separate. Report measured results only.
