import { useEffect, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { usePermissions } from "../../../core/auth/admin-access";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { MessageKey } from "../../../core/i18n/messages";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { useAlerts } from "./AlertsProvider";
import { AlertDetails } from "./AlertDetails";
import { AlertPolicyForm } from "./AlertPolicyForm";
export function AlertsPage({
  selectedId,
  onUser,
}: {
  selectedId?: string;
  onUser?: (id: string) => void;
}) {
  const repo = useAdminRepository();
  const { can } = usePermissions();
  const { t, date } = useLocale();
  const feed = useAlerts();
  const [selected, setSelected] = useState(selectedId);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [permission, setPermission] = useState(
    typeof Notification === "undefined" ? "denied" : Notification.permission,
  );
  useEffect(() => setSelected(selectedId), [selectedId]);
  async function acknowledge(id: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await repo.acknowledgeAlert(id);
      feed.refresh();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  const target = feed.data?.items.find((a) => a.id === selected);
  return (
    <>
      <p>{t("alertsIntro")}</p>
      <p className="muted">{t("alertsBrowserNote")}</p>
      <ErrorNotice error={feed.error || error} />
      {typeof Notification !== "undefined" && (
        <button
          className="secondary"
          disabled={permission === "granted"}
          onClick={() =>
            void Notification.requestPermission()
              .then(setPermission)
              .catch(() => setPermission("denied"))
          }
        >
          {t(
            permission === "granted" ? "alertsBrowserEnabled" : "alertsBrowser",
          )}
        </button>
      )}
      {!feed.data ? (
        <Loading />
      ) : (
        <div className="operations-grid">
          <section className="panel">
            <p className="muted">
              {t("alertsChecked")}: {date(feed.data.policy.lastEvaluatedAt)}
            </p>
            {!feed.data.items.length && <p>{t("alertsEmpty")}</p>}
            {feed.data.items.map((a) => (
              <article className="operations-row" key={a.id}>
                <div>
                  <button
                    className="text-button"
                    onClick={() => setSelected(a.id)}
                  >
                    {t(("alertKind_" + a.kind) as MessageKey)}
                  </button>
                  <small>
                    {t(("alertState_" + a.status) as MessageKey)} ·{" "}
                    {date(a.detectedAt)}
                  </small>
                </div>
                {can("alerts.manage") && a.status === "OPEN" && (
                  <button
                    disabled={busy}
                    className="secondary"
                    onClick={() => void acknowledge(a.id)}
                  >
                    {t("alertsAcknowledge")}
                  </button>
                )}
              </article>
            ))}
          </section>
          {can("alerts.manage") && (
            <AlertPolicyForm
              key={feed.data.policy.revision}
              policy={feed.data.policy}
              onSaved={feed.refresh}
            />
          )}
        </div>
      )}
      {target && (
        <AlertDetails
          alert={target}
          onClose={() => setSelected(undefined)}
          onUser={can("monitoring.read") ? onUser : undefined}
        />
      )}
    </>
  );
}
