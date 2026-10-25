import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

const app = express();
const PORT = process.env.PORT || 4000;

const typeDefs = `#graphql
  type Query {
    health: String!
  }
`;

const resolvers = {
  Query: {
    health: () => "Release Checklist API is running",
  },
};

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await apollo.start();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(
    "/graphql",
    cors(),
    express.json(),
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
