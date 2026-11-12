import { useCallback, useState, type FormEvent } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { MessageKey } from "../../../core/i18n/messages";
import { useResource } from "../../../shared/hooks/useResource";
import { ErrorNotice } from "../../../shared/ui/Feedback";
import {
  supportStatuses,
  type SupportTicket,
  type SupportStatus,
} from "../domain/models";
export function SupportAssignmentForm({
  ticket,
  onSaved,
}: {
  ticket: SupportTicket;
  onSaved: () => void;
}) {
  const repo = useAdminRepository();
  const { t } = useLocale();
  const people = useResource(
    useCallback((s) => repo.supportAssignees(s), [repo]),
  );
  const [status, setStatus] = useState(ticket.status);
  const [assignee, setAssignee] = useState(ticket.assigneeId ?? "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await repo.updateSupport(ticket.id, {
        revision: ticket.revision,
        status,
        assigneeId: assignee || null,
        reason: reason.trim(),
      });
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <fieldset disabled={busy} className="operations-fields">
        <label>
          {t("status")}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SupportStatus)}
          >
            {supportStatuses.map((s) => (
              <option key={s} value={s}>
                {t(("supportStatus_" + s) as MessageKey)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("supportAssignee")}
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">{t("supportUnassigned")}</option>
            {people.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName || p.email}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("supportReason")}
          <input
            required
            minLength={3}
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <ErrorNotice error={people.error || error} />
        <button className="secondary" disabled={busy}>
          {t(busy ? "saving" : "save")}
        </button>
      </fieldset>
    </form>
  );
}
