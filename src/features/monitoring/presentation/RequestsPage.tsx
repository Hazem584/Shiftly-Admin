import { useCallback, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { useResource } from "../../../shared/hooks/useResource";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { Pagination } from "../../../shared/ui/Pagination";
import { MonitoringFilter } from "./MonitoringFilter";
import type { MonitoringQuery } from "../domain/models";
import "./monitoring.css";
export function RequestsPage({ refresh }: { refresh: number }) {
  const repository = useAdminRepository();
  const { t, number, date } = useLocale();
  const [query, setQuery] = useState<MonitoringQuery>({
    page: 1,
    period: "day",
    status: "all",
    userId: "",
  });
  const state = useResource(
    useCallback(
      (signal) => repository.requests(query, signal),
      [repository, query],
    ),
    true,
    refresh,
  );
  const data = state.data;
  return (
    <div className="monitoring-page">
      <p className="muted">{t("trafficNote")}</p>
      <section className="panel monitor-controls">
        <div className="monitor-toolbar">
          {(["day", "week", "month"] as const).map((period) => (
            <button
              className={query.period === period ? "primary" : "secondary"}
              aria-pressed={query.period === period}
              key={period}
              onClick={() => setQuery((q) => ({ ...q, period, page: 1 }))}
            >
              {t(period)}
            </button>
          ))}
          <select
            aria-label={t("requestErrors")}
            value={query.status}
            onChange={(e) =>
              setQuery((q) => ({
                ...q,
                status: e.target.value as "all" | "errors",
                page: 1,
              }))
            }
          >
            <option value="all">{t("allRequests")}</option>
            <option value="errors">{t("onlyErrors")}</option>
          </select>
        </div>
        <MonitoringFilter
          value={query.userId ?? ""}
          onChange={(userId) => setQuery((q) => ({ ...q, userId, page: 1 }))}
        />
      </section>
      <ErrorNotice error={state.error} />
      {state.loading ? (
        <Loading />
      ) : (
        !state.error &&
        data && (
          <>
            <section className="stats-grid">
              {(["total", "errors", "averageMs", "p95Ms"] as const).map(
                (key, i) => (
                  <article className={`stat-card stat-${i}`} key={key}>
                    <span>
                      {t(
                        key === "total"
                          ? "requestTotal"
                          : key === "errors"
                            ? "requestErrors"
                            : key,
                      )}
                    </span>
                    <strong>{number(data.summary[key])}</strong>
                  </article>
                ),
              )}
            </section>
            <section className="panel monitor-controls">
              <h2>{t("dailyTraffic")}</h2>
              <div className="traffic-chart">
                {data.series.map((row) => (
                  <div className="traffic-row" key={row.date}>
                    <time dir="ltr">{row.date}</time>
                    <div className="traffic-track">
                      <div
                        className="traffic-bar"
                        style={{
                          width: `${Math.max(1, (row.total / Math.max(...data.series.map((v) => v.total), 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span>
                      {number(row.total)} · {t("requestErrors")}:{" "}
                      {number(row.errors)}
                    </span>
                  </div>
                ))}
              </div>
              {!data.series.length && <p className="empty">{t("noLogs")}</p>}
            </section>
            <section className="panel">
              <h2 className="monitor-title">{t("endpoints")}</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{t("method")}</th>
                      <th>{t("route")}</th>
                      <th>{t("requestTotal")}</th>
                      <th>{t("requestErrors")}</th>
                      <th>{t("averageMs")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.endpoints.map((row) => (
                      <tr key={`${row.method}:${row.route}`}>
                        <td>
                          <code>{row.method}</code>
                        </td>
                        <td>
                          <code dir="ltr">{row.route}</code>
                        </td>
                        <td>{number(row.total)}</td>
                        <td>{number(row.errors)}</td>
                        <td>{number(row.averageMs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="panel">
              <h2 className="monitor-title">{t("requestLog")}</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{t("time")}</th>
                      <th>{t("method")}</th>
                      <th>{t("route")}</th>
                      <th>{t("status")}</th>
                      <th>{t("latency")}</th>
                      <th>{t("requestId")}</th>
                      <th>{t("user")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((row) => (
                      <tr key={row.id}>
                        <td>{date(row.createdAt)}</td>
                        <td>{row.method}</td>
                        <td>
                          <code dir="ltr">{row.route}</code>
                        </td>
                        <td>
                          <span
                            className={row.status >= 400 ? "monitor-error" : ""}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td>{number(row.durationMs)}</td>
                        <td>
                          <code>{row.requestId}</code>
                        </td>
                        <td>
                          <code>{row.userId ?? "—"}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!data.items.length && <p className="empty">{t("noLogs")}</p>}
              </div>
              <Pagination
                page={query.page}
                hasNext={data.hasNext}
                onPage={(page) => setQuery((q) => ({ ...q, page }))}
              />
            </section>
          </>
        )
      )}
    </div>
  );
}
