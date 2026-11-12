import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { MessageKey } from "../../../core/i18n/messages";
import { Modal } from "../../../shared/ui/Modal";
import type { OperationalAlert } from "../domain/models";
export function AlertDetails({
  alert,
  onClose,
  onUser,
}: {
  alert: OperationalAlert;
  onClose: () => void;
  onUser?: (id: string) => void;
}) {
  const { t, date, number } = useLocale();
  const m = alert.details.metrics;
  return (
    <Modal
      title={t(("alertKind_" + alert.kind) as MessageKey)}
      onClose={onClose}
    >
      <p>
        {date(alert.detectedAt)} ·{" "}
        {t(("alertState_" + alert.status) as MessageKey)}
      </p>
      <dl className="operations-metrics">
        <dt>{t("alertErrorCount")}</dt>
        <dd>{number(m.errors + m.appErrors)}</dd>
        <dt>{t("alertChatP95")}</dt>
        <dd>{number(m.chatP95Ms)}</dd>
        <dt>{t("alertBacklog")}</dt>
        <dd>{number(m.pushCount)}</dd>
        <dt>{t("alertOldest")}</dt>
        <dd>{number(m.pushOldestSeconds)}</dd>
      </dl>
      <h3>{t("alertsSamples")}</h3>
      {[...alert.details.samples, ...alert.details.appSamples].map((s, i) => (
        <article
          className="alert-sample"
          key={`${s.requestId || s.id || s.sessionId}-${i}`}
        >
          <strong>{s.route || s.kind || s.type || s.id}</strong>
          <small>{date(s.createdAt)}</small>
          <code dir="ltr">{s.requestId || s.id || s.sessionId}</code>
          <p>
            {s.status ?? ""}{" "}
            {s.durationMs !== undefined ? `${number(s.durationMs)} ms` : ""}
          </p>
          {s.userId && onUser && (
            <button className="secondary" onClick={() => onUser(s.userId!)}>
              {t("alertOpenSessions")}
            </button>
          )}
        </article>
      ))}
    </Modal>
  );
}
