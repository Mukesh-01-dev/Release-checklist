## Setup and Installation

### Prerequisites

- Node.js 24 or later
- npm
- PostgreSQL database (local or hosted on Neon)
- Git
- Docker (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/Mukesh-01-dev/Release-checklist.git
cd Release-checklist
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=your_postgresql_connection_string
```

Replace the database URL with your PostgreSQL connection string. Keep `.env` private and never commit it.

Initialize the database using the provided setup script:

```bash
npm run setup-db
```

If your project uses a different script name, execute the database setup script documented in `backend/package.json`.

Start the backend:

```bash
npm run dev
```

The API will be available at:

- Health check: `http://localhost:4000/health`
- GraphQL endpoint: `http://localhost:4000/graphql`

### 3. Configure the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

## Docker Deployment

Build the backend image from the repository root:

```bash
docker build -t release-checklist-backend ./backend
```

Run the container:

```bash
docker run --rm \
  --env-file backend/.env \
  -e PORT=4000 \
  -p 4000:4000 \
  release-checklist-backend
```

The container connects to the configured PostgreSQL database. PostgreSQL is hosted separately and is not included in the backend image.

## Production Deployment

The application uses three components:

- **Frontend:** React and Vite, deployed on Vercel.
- **Backend:** Node.js, Express, and Apollo GraphQL, deployed on Render.
- **Database:** PostgreSQL, hosted on Neon.

Configure these environment variables in the respective deployment platforms.

**Render backend:**

```env
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

Render provides the `PORT` environment variable.

**Vercel frontend:**

```env
VITE_GRAPHQL_URL=https://your-render-service.onrender.com/graphql
```

Replace the example URL with the actual deployed backend URL. Redeploy the frontend after changing environment variables.

## API Overview

GraphQL endpoint: `/graphql`

### Queries

| Operation | Description |
|---|---|
| `health` | Checks API health |
| `releases` | Retrieves releases |
| `release(id)` | Retrieves a specific release |

### Mutations

| Operation | Description |
|---|---|
| `createRelease(input)` | Creates a release with 10 checklist steps |
| `updateRelease(id, input)` | Updates release information |
| `toggleStep(releaseId, stepId)` | Toggles a checklist step |
| `deleteRelease(id)` | Deletes a release |

The release status is calculated from completed checklist steps:

- `planned`: No steps completed.
- `ongoing`: Between 1 and 9 steps completed.
- `done`: All 10 steps completed.

## Testing

Run the backend test suite:

```bash
cd backend
npm test
```

Ensure the backend server is running if the tests send HTTP requests to `localhost:4000`.

Build the frontend to check for production compilation errors:

```bash
cd frontend
npm run build
```

## Performance Benchmarking

The project includes an Autocannon benchmark script for testing the deployed GraphQL API under concurrent read requests.

Run it from the benchmark directory:

```bash
node benchmark.mjs https://your-render-service.onrender.com/graphql \
  --duration 15 \
  --levels 1,5,10,20
```

The benchmark records requests per second, average latency, tail latency when available, errors, timeouts, and HTTP status failures. Results are written to the `results/` directory.

Use the same endpoint, query, duration, and concurrency levels when comparing performance before and after optimizations. Repeat runs to account for cloud hosting variability, and distinguish cold-start latency from warmed-up performance.

## Security Notes

- Never commit `.env` files or database credentials.
- Configure CORS to allow only trusted frontend origins in production.
- Validate inputs before database operations.
- Use parameterized SQL queries.
- Avoid logging credentials, tokens, or sensitive request data.
