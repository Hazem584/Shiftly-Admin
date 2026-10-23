import { ChevronLeft, LogOut, ShieldCheck } from "lucide-react";
import { useLocale } from "../../core/i18n/LocaleProvider";
import { supabase } from "../../core/auth/supabase-client";
import { Brand } from "../../shared/ui/Brand";
import { navigation, type PageId } from "../navigation";
export function Sidebar({
  page,
  email,
  open,
  onNavigate,
}: {
  page: PageId;
  email?: string;
  open: boolean;
  onNavigate: (page: PageId) => void;
}) {
  const { t } = useLocale();
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <Brand />
      <p className="nav-caption">{t("adminAccess")}</p>
      <nav>
        {navigation.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "selected" : ""}`}
            aria-current={page === item.id ? "page" : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={20} />
            {t(item.id)}
            {page === item.id && (
              <ChevronLeft className="directional" size={16} />
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="admin-mark">
          <ShieldCheck size={19} />
          <span>
            {t("platformAdmin")}
            <small>{t("adminAccess")}</small>
          </span>
        </div>
        <div className="account-email" dir="ltr">
          {email}
        </div>
        <button
          className="logout"
          onClick={() => void supabase!.auth.signOut()}
        >
          <LogOut size={17} />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
