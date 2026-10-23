import { ArrowUpLeft, ChevronLeft } from "lucide-react";
import { useOverview } from "../application/useOverview";
import type { PageId } from "../../../app/navigation";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { UsersPage } from "../../users/presentation/UsersPage";
import { StatusBanner } from "./StatusBanner";
import { StatisticsGrid } from "./StatisticsGrid";
import { QuickActions } from "./QuickActions";
export function OverviewPage({
  refresh,
  onNavigate,
}: {
  refresh: number;
  onNavigate: (page: PageId) => void;
}) {
  const { t } = useLocale();
  const state = useOverview(refresh);
  if (state.error) return <ErrorNotice error={state.error} />;
  if (!state.data) return <Loading />;
  return (
    <>
      <StatusBanner
        settings={state.data.status}
        onManage={() => onNavigate("settings")}
      />
      <StatisticsGrid data={state.data} />
      <div className="overview-grid">
        <QuickActions onNavigate={onNavigate} />
        <section className="panel health-panel">
          <span className="eyebrow">{t("userExperience")}</span>
          <h2>{t("messageTitle")}</h2>
          <p>{t("messageDetail")}</p>
          <div className="announcement-preview">
            {state.data.status.announcement || t("noAnnouncement")}
          </div>
          <button className="secondary" onClick={() => onNavigate("settings")}>
            {t("editMessage")}
            <ArrowUpLeft size={16} />
          </button>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{t("latestUsers")}</h2>
            <p>{t("latestUsersDetail")}</p>
          </div>
          <button className="text-button" onClick={() => onNavigate("users")}>
            {t("viewAll")}
            <ChevronLeft className="directional" size={16} />
          </button>
        </div>
        <UsersPage compact refresh={refresh} />
      </section>
    </>
  );
}
