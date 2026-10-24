import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { RefreshCw } from "lucide-react";
import { useLocale } from "../core/i18n/LocaleProvider";
import { useAdminRepository } from "./ServicesProvider";
import { useResource } from "../shared/hooks/useResource";
import { ErrorNotice, Loading } from "../shared/ui/Feedback";
import { Sidebar } from "./layout/Sidebar";
import { Topbar } from "./layout/Topbar";
import type { PageId } from "./navigation";
import { OverviewPage } from "../features/overview/presentation/OverviewPage";
import { UsersPage } from "../features/users/presentation/UsersPage";
import { SettingsPage } from "../features/platform/presentation/SettingsPage";
import { WorkspacesPage } from "../features/workspaces/presentation/WorkspacesPage";
import { AuditPage } from "../features/audit/presentation/AuditPage";
import { RequestsPage } from "../features/monitoring/presentation/RequestsPage";
import { SessionsPage } from "../features/monitoring/presentation/SessionsPage";
import { ReleasesPage } from "../features/monitoring/presentation/ReleasesPage";
export function Dashboard({ session }: { session: Session }) {
  const repository = useAdminRepository();
  const { t } = useLocale();
  const [page, setPage] = useState<PageId>("overview");
  const [mobile, setMobile] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const authorization = useResource(
    useCallback((signal) => repository.authorize(signal), [repository]),
  );
  const authorized = authorization.data != null && !authorization.error;
  useEffect(() => {
    const timer = setInterval(() => setRefresh((n) => n + 1), 60_000);
    return () => clearInterval(timer);
  }, []);
  function navigate(next: PageId) {
    setPage(next);
    setMobile(false);
  }
  function reload() {
    setRefresh((n) => n + 1);
    if (!authorized) authorization.refresh();
  }
  return (
    <div className="shell">
      <Sidebar
        page={page}
        open={mobile}
        email={session.user.email}
        onNavigate={navigate}
      />
      {mobile && (
        <button
          className="scrim"
          aria-label={t("close")}
          onClick={() => setMobile(false)}
        />
      )}
      <div className="main">
        <Topbar page={page} onMenu={() => setMobile((n) => !n)} />
        <main className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">SHIFTLY / PLATFORM CONTROL</span>
              <h1>{t(page === "overview" ? "overviewTitle" : page)}</h1>
              <p className="muted">
                {t(
                  page === "overview" ? "overviewSubtitle" : "sectionSubtitle",
                )}
              </p>
            </div>
            {page !== "settings" && (
              <button className="secondary" onClick={reload}>
                <RefreshCw size={16} />
                {t("refresh")}
              </button>
            )}
          </div>
          <ErrorNotice error={authorization.error} />
          {authorization.loading && !authorized && <Loading />}
          {authorized && (
            <>
              {page === "overview" && (
                <OverviewPage refresh={refresh} onNavigate={navigate} />
              )}
              {page === "users" && (
                <UsersPage refresh={refresh} onChanged={reload} />
              )}
              {page === "settings" && <SettingsPage onSaved={reload} />}
              {page === "workspaces" && <WorkspacesPage refresh={refresh} />}
              {page === "audit" && <AuditPage refresh={refresh} />}
              {page === "requests" && <RequestsPage refresh={refresh} />}
              {page === "sessions" && <SessionsPage refresh={refresh} />}
              {page === "releases" && <ReleasesPage />}
            </>
          )}
          <footer>
            Shiftly Control
            <span>
              {t("adminAccess")} · {t("cairoTime")}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
