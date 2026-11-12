import { useCallback, useEffect, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { usePermissions } from "../../../core/auth/admin-access";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { MessageKey } from "../../../core/i18n/messages";
import { useResource } from "../../../shared/hooks/useResource";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { Modal } from "../../../shared/ui/Modal";
import { SupportImage } from "./SupportImage";
import { SupportReplyForm } from "./SupportReplyForm";
import { SupportAssignmentForm } from "./SupportAssignmentForm";
export function SupportDetails({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const repo = useAdminRepository();
  const { can } = usePermissions();
  const { t, date } = useLocale();
  const [tick, setTick] = useState(0);
  const state = useResource(
    useCallback((s) => repo.supportTicket(id, s), [repo, id]),
    true,
    tick,
  );
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 20000);
    return () => clearInterval(timer);
  }, []);
  function changed() {
    state.refresh();
    onChanged();
  }
  const ticket = state.data;
  return (
    <Modal title={t("supportDetails")} onClose={onClose}>
      <ErrorNotice error={state.error} />
      {!ticket ? (
        <Loading />
      ) : (
        <>
          <h3>{ticket.title}</h3>
          <p className="preserve-lines">{ticket.description}</p>
          <p>
            {ticket.workspace.name} ·{" "}
            {ticket.reporter.fullName || ticket.reporter.email}
          </p>
          <p>
            {t(("supportStatus_" + ticket.status) as MessageKey)} ·{" "}
            {ticket.assignee?.fullName ||
              ticket.assignee?.email ||
              t("supportUnassigned")}
          </p>
          {ticket.relatedLabel && (
            <p>
              {t("supportRelated")}: {ticket.relatedLabel}
            </p>
          )}
          {ticket.hasImage && <SupportImage id={id} />}
          {can("support.manage") && (
            <SupportAssignmentForm
              key={ticket.revision}
              ticket={ticket}
              onSaved={changed}
            />
          )}
          <h3>{t("supportReplies")}</h3>
          <div className="support-replies">
            {ticket.replies?.map((r) => (
              <article key={r.id}>
                <strong>
                  {r.author.fullName ||
                    t(
                      r.authorKind === "STAFF"
                        ? "supportStaff"
                        : "supportReporter",
                    )}
                </strong>
                <small>{date(r.createdAt)}</small>
                <p className="preserve-lines">{r.body}</p>
              </article>
            ))}
          </div>
          {can("support.reply") && (
            <SupportReplyForm id={id} onSent={changed} />
          )}
        </>
      )}
    </Modal>
  );
}
