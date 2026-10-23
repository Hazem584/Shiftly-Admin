import { ShieldCheck } from "lucide-react";
import { configured } from "../../../core/auth/supabase-client";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { LanguageSwitch } from "../../../core/i18n/LanguageSwitch";
import { useSession } from "../application/useSession";
import { LoginPage } from "./LoginPage";
import { Dashboard } from "../../../app/Dashboard";
export function AuthBoundary() {
  const { t } = useLocale();
  const { session, loading } = useSession();
  if (!configured)
    return (
      <div className="setup">
        <LanguageSwitch />
        <ShieldCheck size={48} />
        <h1>{t("setupTitle")}</h1>
        <p>{t("setupDescription")}</p>
        <code dir="ltr">
          VITE_API_BASE_URL
          <br />
          VITE_SUPABASE_URL
          <br />
          VITE_SUPABASE_PUBLISHABLE_KEY
        </code>
        <p>{t("setupHelp")}</p>
      </div>
    );
  if (loading) return <div className="setup">{t("restoring")}</div>;
  return session ? (
    <Dashboard key={session.user.id} session={session} />
  ) : (
    <LoginPage />
  );
}
