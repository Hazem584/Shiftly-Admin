import { useAudit } from "../application/useAudit";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { Pagination } from "../../../shared/ui/Pagination";
const actionKeys = {
  SETTINGS_UPDATED: "settingsUpdated",
  USER_SUSPENDED: "userSuspended",
  USER_RESTORED: "userRestored",
  ACCOUNT_DELETION_STARTED: "deletionStarted",
  ACCOUNT_DELETED: "accountDeleted",
} as const;
export function AuditPage({ refresh }: { refresh: number }) {
  const { t, date } = useLocale();
  const state = useAudit(refresh);
  const { page, setPage } = state;
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{t("auditTitle")}</h2>
          <p>{t("auditDescription")}</p>
        </div>
      </div>
      <ErrorNotice error={state.error} />
      {state.loading ? (
        <Loading />
      ) : (
        !state.error && (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{t("action")}</th>
                    <th>{t("administrator")}</th>
                    <th>{t("target")}</th>
                    <th>{t("time")}</th>
                    <th>{t("details")}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>
                          {item.action in actionKeys
                            ? t(
                                actionKeys[
                                  item.action as keyof typeof actionKeys
                                ],
                              )
                            : item.action}
                        </strong>
                      </td>
                      <td>
                        <code>{item.actorId}</code>
                      </td>
                      <td>
                        <code>{item.targetId}</code>
                      </td>
                      <td>{date(item.createdAt)}</td>
                      <td>
                        <details>
                          <summary>{t("view")}</summary>
                          <pre dir="ltr">
                            {JSON.stringify(item.details, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!state.data?.length && (
                <div className="empty">{t("emptyAudit")}</div>
              )}
            </div>
            <Pagination
              page={page}
              hasNext={state.data?.length === 50}
              onPage={setPage}
            />
          </>
        )
      )}
    </section>
  );
}
