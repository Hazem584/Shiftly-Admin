import { useCallback, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useResource } from "../../../shared/hooks/useResource";
export function useDeletionQueue(refresh: number) {
  const repo = useAdminRepository();
  const state = useResource(
    useCallback((signal) => repo.deletionJobs(signal), [repo]),
    true,
    refresh,
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  async function retry(id: string) {
    setBusy(id);
    setError(null);
    try {
      await repo.retryDeletion(id);
      state.refresh();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(null);
    }
  }
  return { ...state, error: state.error || error, busy, retry };
}
