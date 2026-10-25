export const typeDefs = `#graphql
  type ReleaseStep {
    stepId: Int!
    title: String!
    completed: Boolean!
  }

  type Release {
    id: ID!
    name: String!
    dueDate: String!
    additionalInfo: String
    status: String!
    completedSteps: Int!
    totalSteps: Int!
    steps: [ReleaseStep!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreateReleaseInput {
    name: String!
    dueDate: String!
    additionalInfo: String
  }

  input UpdateReleaseInput {
    name: String
    dueDate: String
    additionalInfo: String
  }

  type Query {
    health: String!
    releases: [Release!]!
    release(id: ID!): Release
  }

  type Mutation {
    createRelease(input: CreateReleaseInput!): Release!
    updateRelease(id: ID!, input: UpdateReleaseInput!): Release!
    toggleStep(releaseId: ID!, stepId: Int!): Release!
    deleteRelease(id: ID!): Boolean!
  }
`;