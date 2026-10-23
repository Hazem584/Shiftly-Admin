import { ChevronLeft, Menu } from "lucide-react";
import { useLocale } from "../../core/i18n/LocaleProvider";
import { LanguageSwitch } from "../../core/i18n/LanguageSwitch";
import type { PageId } from "../navigation";
export function Topbar({ page, onMenu }: { page: PageId; onMenu: () => void }) {
  const { t } = useLocale();
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <button
          className="mobile-menu"
          aria-label={t("dashboard")}
          onClick={onMenu}
        >
          <Menu />
        </button>
        <span>{t("dashboard")}</span>
        <ChevronLeft className="directional" size={14} />
        <strong>{t(page)}</strong>
      </div>
      <div className="top-meta">
        <span className="connection-label">
          <span className="live-dot" />
          {t("connected")}
        </span>
        <LanguageSwitch />
      </div>
    </header>
  );
}
