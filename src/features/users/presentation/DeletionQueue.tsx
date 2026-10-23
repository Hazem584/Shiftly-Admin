import { CheckCircle2, RefreshCw } from "lucide-react";
import { useDeletionQueue } from "../application/useDeletionQueue";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { ErrorNotice } from "../../../shared/ui/Feedback";
import type { DeletionState } from "../domain/models";
const stateKeys = {
  PENDING: "pending",
  PROCESSING: "processing",
  FAILED: "failed",
  COMPLETED: "completed",
} as const;
export function DeletionQueue({ refresh }: { refresh: number }) {
  const { t, date } = useLocale();
  const state = useDeletionQueue(refresh);
  const { busy, retry } = state;
  if (!state.data?.length && !state.error) return null;
  return (
    <section className="panel deletion-queue">
      <div className="panel-heading">
        <div>
          <h2>{t("deletionQueue")}</h2>
          <p>{t("deletionQueueDescription")}</p>
        </div>
        <CheckCircle2 size={22} />
      </div>
      <ErrorNotice error={state.error} />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{t("user")}</th>
              <th>{t("status")}</th>
              <th>{t("time")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {state.data?.map((job) => (
              <tr key={job.profileId}>
                <td>
                  <code>{job.profileId}</code>
                </td>
                <td>
                  <span
                    className={`badge ${job.state === "COMPLETED" ? "green" : job.state === "FAILED" ? "red" : "amber"}`}
                  >
                    {t(stateKeys[job.state as DeletionState])}
                  </span>
                </td>
                <td>{date(job.updatedAt)}</td>
                <td>
                  {job.state !== "COMPLETED" && (
                    <button
                      disabled={busy === job.profileId}
                      className="secondary"
                      onClick={() => void retry(job.profileId)}
                    >
                      <RefreshCw size={14} />
                      {t(
                        busy === job.profileId ? "processing" : "retryCleanup",
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="queue-note muted">{t("remainingCleanup")}</p>
    </section>
  );
}
