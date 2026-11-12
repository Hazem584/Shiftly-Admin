import { AdminAccessProvider } from "../core/auth/admin-access";
import { AlertsProvider } from "../features/alerts/presentation/AlertsProvider";
import { navigation } from "./navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { RefreshCw } from "lucide-react";
import { useLocale } from "../core/i18n/LocaleProvider";
import { useAdminRepository } from "./ServicesProvider";
import { useResource } from "../shared/hooks/useResource";
import { ErrorNotice, Loading } from "../shared/ui/Feedback";
import { Sidebar } from "./layout/Sidebar";
import { Topbar } from "./layout/Topbar";
import type { PageId } from "./navigation";
import {
  OverviewPage,
  UsersPage,
  SettingsPage,
  WorkspacesPage,
  AuditPage,
  RequestsPage,
  SessionsPage,
  ReleasesPage,
  AppIconsPage,
  AdministratorsPage,
  AlertsPage,
  SupportPage,
} from "./pages";
import { PageLoadBoundary } from "./PageLoadBoundary";
export function Dashboard({ session }: { session: Session }) {
  const repository = useAdminRepository();
  const { t } = useLocale();
  const [requestedPage, setPage] = useState<PageId>("overview");
  const [mobile, setMobile] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const authorization = useResource(
    useCallback((signal) => repository.authorize(signal), [repository]),
    true,
    refresh,
  );
  const authorized = authorization.data != null && !authorization.error;
  const access = authorized ? authorization.data : null;
  const allowed = navigation.filter((item) =>
    access?.permissions?.includes(item.permission),
  );
  const page = allowed.some((item) => item.id === requestedPage)
    ? requestedPage
    : (allowed[0]?.id ?? "overview");
  const [alertId, setAlertId] = useState<string>();
  const [monitorUserId, setMonitorUserId] = useState("");
  const openAlerts = useCallback((id?: string) => {
    setAlertId(id);
    setPage("alerts");
  }, []);

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
    <AdminAccessProvider access={access}>
      <AlertsProvider key={session.user.id} onOpen={openAlerts}>
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
                      page === "overview"
                        ? "overviewSubtitle"
                        : "sectionSubtitle",
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
              {authorized && allowed.length === 0 && (
                <p role="alert">{t("noAdminSections")}</p>
              )}
              {authorization.loading && !authorized && <Loading />}
              {authorized && allowed.length > 0 && (
                <PageLoadBoundary
                  key={page}
                  fallback={
                    <div>
                      <ErrorNotice error={true} />
                      <button
                        className="secondary"
                        onClick={() => window.location.reload()}
                      >
                        {t("retry")}
                      </button>
                    </div>
                  }
                >
                  <Suspense fallback={<Loading />}>
                    {page === "overview" && (
                      <OverviewPage refresh={refresh} onNavigate={navigate} />
                    )}
                    {page === "users" && (
                      <UsersPage refresh={refresh} onChanged={reload} />
                    )}
                    {page === "settings" && <SettingsPage onSaved={reload} />}
                    {page === "workspaces" && (
                      <WorkspacesPage refresh={refresh} />
                    )}
                    {page === "audit" && <AuditPage refresh={refresh} />}
                    {page === "requests" && <RequestsPage refresh={refresh} />}
                    {page === "sessions" && (
                      <SessionsPage
                        key={monitorUserId}
                        initialUserId={monitorUserId}
                        refresh={refresh}
                      />
                    )}
                    {page === "releases" && <ReleasesPage />}
                    {page === "administrators" && (
                      <AdministratorsPage refresh={refresh} />
                    )}
                    {page === "support" && <SupportPage refresh={refresh} />}
                    {page === "alerts" && (
                      <AlertsPage
                        selectedId={alertId}
                        onUser={(id) => {
                          setMonitorUserId(id);
                          navigate("sessions");
                        }}
                      />
                    )}
                    {page === "appIcons" && <AppIconsPage refresh={refresh} />}
                  </Suspense>
                </PageLoadBoundary>
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
      </AlertsProvider>
    </AdminAccessProvider>
  );
}
