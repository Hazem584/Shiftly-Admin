import { Bell } from "lucide-react";
import { usePermissions } from "../../../core/auth/admin-access";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { useAlerts } from "./AlertsProvider";
export function AlertsBell() {
  const { can } = usePermissions();
  const { t, number } = useLocale();
  const { data, open } = useAlerts();
  if (!can("alerts.read")) return null;
  const count = data?.items.filter((a) => a.status === "OPEN").length ?? 0;
  return (
    <button
      className="alerts-bell secondary"
      aria-label={`${t("alerts")} (${count})`}
      onClick={() => open()}
    >
      <Bell size={18} />
      {count > 0 && <span className="alerts-count">{number(count)}</span>}
    </button>
  );
}
