import { Activity, Building2, ShieldCheck, Users } from "lucide-react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { Overview } from "../../platform/domain/models";
export function StatisticsGrid({ data }: { data: Overview }) {
  const { t, number } = useLocale();
  const stats = [
    {
      title: "totalUsers",
      value: data.users,
      detail: t("recentUsersDetail", { count: number(data.recentUsers) }),
      icon: Users,
    },
    {
      title: "activeRecently",
      value: data.online,
      detail: t("recentActivityDetail"),
      icon: Activity,
    },
    {
      title: "workspaceCount",
      value: data.workspaces,
      detail: t("teamsDetail"),
      icon: Building2,
    },
    {
      title: "suspendedAccounts",
      value: data.suspended,
      detail: t("suspendedDetail"),
      icon: ShieldCheck,
    },
  ] as const;
  return (
    <section className="stats-grid">
      {stats.map((stat, i) => (
        <article className={`stat-card stat-${i}`} key={stat.title}>
          <div className="stat-top">
            <span>{t(stat.title)}</span>
            <span className="stat-icon">
              <stat.icon size={20} />
            </span>
          </div>
          <strong>{number(stat.value)}</strong>
          <small>
            <span className={`tiny-dot tint-${i}`} />
            {stat.detail}
          </small>
        </article>
      ))}
    </section>
  );
}
