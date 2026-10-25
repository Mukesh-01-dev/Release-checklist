import { releaseService } from "../services/release.service.js";

export const resolvers = {
  Query: {
    health: () => "Release Checklist API is running",
    releases: () => releaseService.getAll(),
    release: (_, { id }) => releaseService.getById(id),
  },

  Mutation: {
    createRelease: (_, { input }) =>
      releaseService.create(input),

    updateRelease: (_, { id, input }) =>
      releaseService.update(id, input),

    toggleStep: (_, { releaseId, stepId }) =>
      releaseService.toggleStep(releaseId, stepId),

    deleteRelease: (_, { id }) =>
      releaseService.delete(id),
  },
};