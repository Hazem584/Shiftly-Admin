import { ArrowUpLeft, History, Radio, Settings2, Users } from "lucide-react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { PageId } from "../../../app/navigation";
export function QuickActions({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { t } = useLocale();
  const actions = [
    {
      id: "users",
      title: "manageUsers",
      description: "manageUsersDetail",
      icon: Users,
    },
    {
      id: "settings",
      title: "serviceSettings",
      description: "serviceSettingsDetail",
      icon: Radio,
    },
    {
      id: "audit",
      title: "reviewAudit",
      description: "reviewAuditDetail",
      icon: History,
    },
  ] as const;
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{t("controlCenter")}</h2>
          <p>{t("quickActions")}</p>
        </div>
        <Settings2 size={21} />
      </div>
      <div className="quick-actions">
        {actions.map((action) => (
          <button key={action.id} onClick={() => onNavigate(action.id)}>
            <span className="icon-box">
              <action.icon size={21} />
            </span>
            <span>
              <strong>{t(action.title)}</strong>
              <small>{t(action.description)}</small>
            </span>
            <ArrowUpLeft size={19} />
          </button>
        ))}
      </div>
    </section>
  );
}
