import { Building2 } from "lucide-react";
import { useWorkspaces } from "../application/useWorkspaces";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { Pagination } from "../../../shared/ui/Pagination";
export function WorkspacesPage({ refresh }: { refresh: number }) {
  const { t, number, date } = useLocale();
  const state = useWorkspaces(refresh);
  const { page, setPage } = state;
  return (
    <section className="panel">
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
                    <th>{t("workspace")}</th>
                    <th>{t("owner")}</th>
                    <th>{t("members")}</th>
                    <th>{t("timezone")}</th>
                    <th>{t("createdAt")}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data?.map((w) => (
                    <tr key={w.id}>
                      <td>
                        <div className="user-cell">
                          <span className="icon-box">
                            <Building2 size={20} />
                          </span>
                          <span>
                            <strong>{w.name}</strong>
                            <small dir="ltr">{w.code}</small>
                          </span>
                        </div>
                      </td>
                      <td>{w.creator.fullName || w.creator.email || "â€”"}</td>
                      <td>{number(w._count.memberships)}</td>
                      <td dir="ltr">{w.timezone}</td>
                      <td>{date(w.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!state.data?.length && (
                <div className="empty">{t("emptyWorkspaces")}</div>
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
