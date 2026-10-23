import type { FormEvent } from "react";
import { useAccountAccess } from "../application/useAccountAccess";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { Modal } from "../../../shared/ui/Modal";
import { ErrorNotice } from "../../../shared/ui/Feedback";
import type { User } from "../domain/models";
export function AccessDialog({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLocale();
  const { reason, setReason, busy, error, save } = useAccountAccess(
    user,
    onSaved,
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    void save();
  }
  return (
    <Modal
      title={t(user.isSuspended ? "restoreTitle" : "suspendTitle")}
      busy={busy}
      onClose={onClose}
    >
      <p className="account-identity" dir="auto">
        {user.fullName || user.email}
      </p>
      <p className="muted">
        {t(user.isSuspended ? "restoreDescription" : "suspendDescription")}
      </p>
      {user.suspensionReason && (
        <p>
          {t("currentReason")}: {user.suspensionReason}
        </p>
      )}
      <form onSubmit={submit}>
        <label>
          {t(user.isSuspended ? "auditNote" : "suspensionReason")}
          <textarea
            autoFocus
            required={!user.isSuspended}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <ErrorNotice error={error} />
        <div className="form-actions">
          <button
            type="submit"
            className={user.isSuspended ? "primary" : "danger"}
            disabled={busy || (!user.isSuspended && !reason.trim())}
          >
            {t(busy ? "saving" : "confirmChange")}
          </button>
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={onClose}
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
