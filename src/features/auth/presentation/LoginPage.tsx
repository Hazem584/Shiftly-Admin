import { ArrowUpLeft, ShieldCheck } from "lucide-react";
import { useLogin } from "../application/useLogin";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { LanguageSwitch } from "../../../core/i18n/LanguageSwitch";
import { Brand } from "../../../shared/ui/Brand";
export function LoginPage() {
  const { t } = useLocale();
  const { email, setEmail, password, setPassword, busy, failed, submit } =
    useLogin();
  return (
    <main className="login">
      <section className="login-story">
        <Brand />
        <div>
          <span className="eyebrow">{t("loginTagline")}</span>
          <h1>{t("loginHeadline")}</h1>
          <p>{t("loginStory")}</p>
        </div>
        <small>SHIFTLY PLATFORM ADMINISTRATION</small>
      </section>
      <section className="login-form">
        <div className="login-language">
          <LanguageSwitch />
        </div>
        <form onSubmit={submit}>
          <div className="icon-box">
            <ShieldCheck />
          </div>
          <h2>{t("loginTitle")}</h2>
          <p className="muted">{t("loginDescription")}</p>
          <label>
            {t("email")}
            <input
              type="email"
              dir="ltr"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            {t("password")}
            <input
              type="password"
              dir="ltr"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {failed && (
            <p role="alert" className="error">
              {t("loginError")}
            </p>
          )}
          <button className="primary wide" disabled={busy}>
            {t(busy ? "signingIn" : "signIn")}
            <ArrowUpLeft size={18} />
          </button>
          <p className="login-note">
            <ShieldCheck size={15} />
            {t("restrictedAccess")}
          </p>
        </form>
      </section>
    </main>
  );
}
