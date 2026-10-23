import { useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import type { User } from "../domain/models";
export function useAccountAccess(user: User, onSaved: () => void) {
  const repo = useAdminRepository();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function save() {
    setBusy(true);
    setError(null);
    try {
      await repo.setAccess(user, reason);
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return { reason, setReason, busy, error, save };
}
