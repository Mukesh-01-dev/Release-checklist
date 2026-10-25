import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_RELEASE,
  DELETE_RELEASE,
  GET_RELEASES,
  UPDATE_RELEASE,
} from "../api/releaseOperations";

export function useReleases() {
  const query = useQuery(GET_RELEASES, { fetchPolicy: "cache-and-network" });

  const [createRelease, createState] = useMutation(CREATE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES }],
    awaitRefetchQueries: true,
  });
  const [updateRelease, updateState] = useMutation(UPDATE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES }],
    awaitRefetchQueries: true,
  });
  const [deleteRelease, deleteState] = useMutation(DELETE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES }],
    awaitRefetchQueries: true,
  });

  return {
    releases: query.data?.releases ?? [],
    loading: query.loading,
    error: query.error,
    refresh: query.refetch,
    createRelease,
    updateRelease,
    deleteRelease,
    saving: createState.loading || updateState.loading || deleteState.loading,
    deleting: deleteState.loading,
  };
}