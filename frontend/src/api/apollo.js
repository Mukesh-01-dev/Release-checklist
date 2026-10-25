import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql",
  }),
  cache: new InMemoryCache(),
});

export default client;