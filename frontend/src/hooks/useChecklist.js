import { useMutation } from "@apollo/client";
import { TOGGLE_STEP, GET_RELEASES } from "../api/releaseOperations";

/**
 * The checkbox UI is updated locally before the network request completes.
 * On a server error, the parent is asked to refresh so the UI returns to the
 * persisted state. The mutation itself is not blocked by a full list refetch.
 */
export function useChecklist(refreshReleases) {
  const [toggleStep, mutationState] = useMutation(TOGGLE_STEP);

  async function saveToggle(releaseId, stepId) {
    try {
      await toggleStep({ variables: { releaseId, stepId } });
      // Fetch current status/progress after the step has been persisted.
      await refreshReleases();
    } catch (error) {
      console.error("Could not save checklist step:", error);
      await refreshReleases();
      throw error;
    }
  }

  return { saveToggle, savingStep: mutationState.loading };
}