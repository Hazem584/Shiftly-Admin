import type { FormEvent } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useAccountDeletion } from "../application/useAccountDeletion";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { Modal } from "../../../shared/ui/Modal";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import type { DeletionResult, User } from "../domain/models";
export function DeleteAccountDialog({
  user,
  onClose,
  onDeleted,
}: {
  user: User;
  onClose: () => void;
  onDeleted: (result: DeletionResult) => void;
}) {
  const { t, number } = useLocale();
  const { preview, confirmation, setConfirmation, busy, error, remove } =
    useAccountDeletion(user.id, onDeleted);
  function submit(e: FormEvent) {
    e.preventDefault();
    void remove();
  }
  const data = preview.data;
  return (
    <Modal title={t("deleteTitle")} onClose={onClose} busy={busy} danger>
      <span className="destructive-icon">
        <Trash2 size={23} />
      </span>
      <p className="account-identity" dir="auto">
        {user.email || user.fullName || user.id}
      </p>
      <p>{t("deleteDescription")}</p>
      <ErrorNotice error={preview.error} />
      {preview.loading && <Loading />}
      {data && (
        <>
          <div className="impact-heading">{t("deleteImpact")}</div>
          <div className="deletion-impact">
            <div>
              <strong>{number(data.ownedWorkspaces.length)}</strong>
              <span>{t("ownedWorkspaces")}</span>
            </div>
            <div>
              <strong>
                {number(
                  Object.values(data.counts).reduce(
                    (sum, count) => sum + count,
                    0,
                  ),
                )}
              </strong>
              <span>{t("dependentRecords")}</span>
            </div>
            <div>
              <strong>{number(data.storageObjects)}</strong>
              <span>{t("storedFiles")}</span>
            </div>
          </div>
          {data.ownedWorkspaces.length > 0 && (
            <div className="delete-warning">
              <AlertTriangle size={18} />
              <div>
                <p>{t("deleteSharedWarning")}</p>
                <ul>
                  {data.ownedWorkspaces.map((w) => (
                    <li key={w.id}>{w.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <p className="muted">{t("deleteDependencyWarning")}</p>
          {!data.canDelete && (
            <div className="error" role="alert">
              {t("errorMissingSecret")}
            </div>
          )}
          <form onSubmit={submit}>
            <label>
              {t("typeConfirmation", { value: data.confirmation })}
              <input
                dir="ltr"
                autoComplete="off"
                spellCheck={false}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </label>
            <ErrorNotice error={error} />
            <div className="form-actions">
              <button
                className="danger"
                disabled={
                  busy || !data.canDelete || confirmation !== data.confirmation
                }
              >
                <Trash2 size={16} />
                {t(busy ? "deleting" : "deleteNow")}
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
        </>
      )}
    </Modal>
  );
}
