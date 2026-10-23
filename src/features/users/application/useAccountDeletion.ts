import { useCallback, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useResource } from "../../../shared/hooks/useResource";
import type { DeletionResult } from "../domain/models";
export function useAccountDeletion(
  userId: string,
  onDeleted: (result: DeletionResult) => void,
) {
  const repo = useAdminRepository();
  const preview = useResource(
    useCallback(
      (signal) => repo.deletionPreview(userId, signal),
      [repo, userId],
    ),
  );
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function remove() {
    if (
      !preview.data ||
      confirmation !== preview.data.confirmation ||
      !preview.data.canDelete
    )
      return;
    setBusy(true);
    setError(null);
    try {
      onDeleted(
        await repo.deleteAccount(
          userId,
          confirmation,
          preview.data.fingerprint,
        ),
      );
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return { preview, confirmation, setConfirmation, busy, error, remove };
}
