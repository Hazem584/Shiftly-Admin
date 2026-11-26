import { useCallback, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { MessageKey } from "../../../core/i18n/messages";
import { useResource } from "../../../shared/hooks/useResource";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { Pagination } from "../../../shared/ui/Pagination";
import { supportStatuses, type SupportStatus } from "../domain/models";
import { SupportDetails } from "./SupportDetails";
export function SupportPage({ refresh }: { refresh: number }) {
  const repo = useAdminRepository();
  const { t, date } = useLocale();
  const [status, setStatus] = useState<SupportStatus | "">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string>();
  const state = useResource(
    useCallback(
      (s) => repo.support({ page, status: status || undefined }, s),
      [repo, page, status],
    ),
    true,
    refresh,
  );
  return (
    <>
      <p>{t("supportIntro")}</p>
      <section className="panel">
        <label className="support-status-filter">
          {t("status")}
          <select
            className="support-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as SupportStatus | "");
              setPage(1);
            }}
          >
            <option value="">{t("supportAll")}</option>
            {supportStatuses.map((s) => (
              <option key={s} value={s}>
                {t(("supportStatus_" + s) as MessageKey)}
              </option>
            ))}
          </select>
        </label>
        <ErrorNotice error={state.error} />
        {!state.data ? (
          <Loading />
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{t("supportDetails")}</th>
                    <th>{t("supportReporter")}</th>
                    <th>{t("supportAssignee")}</th>
                    <th>{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.items.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <button
                          className="text-button"
                          onClick={() => setSelected(ticket.id)}
                        >
                          {ticket.title}
                        </button>
                        <small>
                          {ticket.workspace.name} · {date(ticket.updatedAt)}
                        </small>
                      </td>
                      <td>
                        {ticket.reporter.fullName || ticket.reporter.email}
                      </td>
                      <td>
                        {ticket.assignee?.fullName ||
                          ticket.assignee?.email ||
                          t("supportUnassigned")}
                      </td>
                      <td>
                        {t(("supportStatus_" + ticket.status) as MessageKey)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!state.data.items.length && <p>{t("supportEmpty")}</p>}
            <Pagination
              page={page}
              hasNext={state.data.hasNext}
              onPage={setPage}
            />
          </>
        )}
      </section>
      {selected && (
        <SupportDetails
          id={selected}
          onClose={() => setSelected(undefined)}
          onChanged={state.refresh}
        />
      )}
    </>
  );
}
