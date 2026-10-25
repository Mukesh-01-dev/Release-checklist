# ReleaseCheck Frontend

React + Vite frontend for the Release Checklist Tool.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The default GraphQL URL is `http://localhost:4000/graphql`. Set `VITE_GRAPHQL_URL` in `.env` if your backend is hosted elsewhere.

## Build check

```bash
npm run build
```

## Notes

- The UI expects the GraphQL API operations in `src/api/releaseOperations.js`.
- Checklist ticks update locally immediately, then persist through GraphQL.
- If your backend uses different GraphQL scalar/input names or return types, update `releaseOperations.js` to match `backend/src/graphql/schema.js`.
