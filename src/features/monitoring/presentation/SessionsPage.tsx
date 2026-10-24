import { useCallback, useEffect, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { useResource } from "../../../shared/hooks/useResource";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { Pagination } from "../../../shared/ui/Pagination";
import { MonitoringFilter } from "./MonitoringFilter";
import "./monitoring.css";
export function SessionsPage({ refresh }: { refresh: number }) {
  const repository = useAdminRepository();
  const { t, date, number } = useLocale();
  const [userId, setUserId] = useState("");
  const [page, setPage] = useState(1);
  const [errorPage, setErrorPage] = useState(1);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(timer);
  }, []);
  const sessions = useResource(
    useCallback(
      (signal) => repository.sessions({ page, userId }, signal),
      [repository, page, userId],
    ),
    true,
    `${refresh}:${tick}`,
  );
  const errors = useResource(
    useCallback(
      (signal) => repository.errors({ page: errorPage, userId }, signal),
      [repository, errorPage, userId],
    ),
    true,
    `${refresh}:${tick}`,
  );
  function filter(value: string) {
    setUserId(value);
    setPage(1);
    setErrorPage(1);
  }
  return (
    <div className="monitoring-page">
      <p className="muted">{t("sessionNote")}</p>
      <section className="panel monitor-controls">
        <MonitoringFilter key={userId} value={userId} onChange={filter} />
      </section>
      <section className="panel">
        <ErrorNotice error={sessions.error} />
        {sessions.loading ? (
          <Loading />
        ) : (
          !sessions.error &&
          sessions.data && (
            <>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{t("user")}</th>
                      <th>{t("status")}</th>
                      <th>{t("platform")}</th>
                      <th>{t("appVersion")}</th>
                      <th>{t("appState")}</th>
                      <th>{t("lastActivity")}</th>
                      <th>{t("errorCount")}</th>
                      <th>{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.data.items.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <strong>
                            {row.fullName || row.email || row.userId}
                          </strong>
                          <small className="monitor-id">{row.userId}</small>
                        </td>
                        <td>
                          <span
                            className={row.online ? "monitor-online" : "muted"}
                          >
                            {t(row.online ? "onlineNow" : "offlineNow")}
                          </span>
                        </td>
                        <td>{row.platform}</td>
                        <td>
                          {row.version}+{row.build}
                        </td>
                        <td>{row.state}</td>
                        <td>{date(row.lastSeenAt)}</td>
                        <td>{number(row.errorCount)}</td>
                        <td>
                          <button
                            className="secondary"
                            onClick={() => filter(row.userId)}
                          >
                            {t("viewUserLogs")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!sessions.data.items.length && (
                  <p className="empty">{t("noLogs")}</p>
                )}
              </div>
              <Pagination
                page={page}
                hasNext={sessions.data.hasNext}
                onPage={setPage}
              />
            </>
          )
        )}
      </section>
      <section className="panel">
        <h2 className="monitor-title">{t("errorLogs")}</h2>
        <ErrorNotice error={errors.error} />
        {errors.loading ? (
          <Loading />
        ) : (
          !errors.error &&
          errors.data && (
            <>
              <div className="monitor-controls">
                {errors.data.items.map((row) => (
                  <details className="error-detail" key={row.id}>
                    <summary>
                      <span className="monitor-error">{row.kind}</span> ·{" "}
                      {date(row.createdAt)} · {row.message}
                    </summary>
                    <dl>
                      <dt>{t("user")}</dt>
                      <dd>{row.userId}</dd>
                      <dt>{t("sessionId")}</dt>
                      <dd>{row.sessionId}</dd>
                      <dt>{t("requestId")}</dt>
                      <dd>{row.requestId ?? "—"}</dd>
                    </dl>
                    <pre dir="ltr">{row.stack || row.message}</pre>
                  </details>
                ))}
                {!errors.data.items.length && (
                  <p className="empty">{t("noLogs")}</p>
                )}
              </div>
              <Pagination
                page={errorPage}
                hasNext={errors.data.hasNext}
                onPage={setErrorPage}
              />
            </>
          )
        )}
      </section>
    </div>
  );
}
