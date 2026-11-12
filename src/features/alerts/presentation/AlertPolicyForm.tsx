import { useState, type FormEvent } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { ErrorNotice } from "../../../shared/ui/Feedback";
import type { AlertPolicy } from "../domain/models";
const fields = [
  ["errorCount", "alertErrorCount", 1, 10000],
  ["errorRatePercent", "alertErrorRate", 1, 100],
  ["minimumRequests", "alertMinRequests", 1, 10000],
  ["chatP95Ms", "alertChatP95", 100, 120000],
  ["minimumChatRequests", "alertMinChats", 1, 1000],
  ["pushBacklogCount", "alertBacklog", 1, 10000],
  ["pushOldestSeconds", "alertOldest", 60, 86400],
] as const;
export function AlertPolicyForm({
  policy,
  onSaved,
}: {
  policy: AlertPolicy;
  onSaved: () => void;
}) {
  const repo = useAdminRepository();
  const { t } = useLocale();
  const [form, setForm] = useState(policy);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await repo.saveAlertPolicy(form);
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel" onSubmit={submit}>
      <h2>{t("alertsPolicy")}</h2>
      <fieldset disabled={busy} className="operations-fields">
        {fields.map(([key, label, min, max]) => (
          <label key={key}>
            {t(label)}
            <input
              required
              type="number"
              min={min}
              max={max}
              step={1}
              value={form[key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: Number(e.target.value) }))
              }
            />
          </label>
        ))}
        <ErrorNotice error={error} />
        <button className="primary" disabled={busy}>
          {t(busy ? "saving" : "save")}
        </button>
      </fieldset>
    </form>
  );
}
