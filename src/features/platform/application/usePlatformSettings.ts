import { useCallback, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useResource } from "../../../shared/hooks/useResource";
import type { Settings } from "../domain/models";
export function usePlatformSettings(onSaved: () => void) {
  const repo = useAdminRepository();
  const source = useResource(
    useCallback((signal) => repo.settings(signal), [repo]),
  );
  const [draft, setDraft] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState(false);
  const settings = draft ?? source.data;
  function change<K extends keyof Settings>(field: K, value: Settings[K]) {
    if (settings) setDraft({ ...settings, [field]: value });
    setSuccess(false);
  }
  async function save() {
    if (!settings) return;
    setBusy(true);
    setError(null);
    try {
      const next = await repo.saveSettings(settings);
      source.setData(next);
      setDraft(next);
      setSuccess(true);
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return {
    settings,
    original: source.data,
    loading: source.loading,
    error: error || source.error,
    busy,
    success,
    change,
    save,
  };
}
