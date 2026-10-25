
import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import { requestLogger } from "./middleware/requestLogger.js";

const app = express();
const PORT = process.env.PORT || 4000;

const apollo = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await apollo.start();

  // Register logging before all routes.
  app.use(requestLogger);

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(
    "/graphql",
    expressMiddleware(apollo)
  );

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
