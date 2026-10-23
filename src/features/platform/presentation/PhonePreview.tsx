import { Radio, Smartphone } from "lucide-react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { modeKeys, type Settings } from "../domain/models";
export function PhonePreview({ settings }: { settings: Settings }) {
  const { t } = useLocale();
  const mode = modeKeys[settings.mode];
  return (
    <section className="panel phone-panel">
      <div className="panel-heading">
        <h2>{t("preview")}</h2>
        <Smartphone size={20} />
      </div>
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-brand">shiftly</div>
        {settings.mode === "OPERATIONAL" ? (
          <>
            <div className="phone-welcome">{t("welcome")}</div>
            {settings.announcement && (
              <div className="announcement-preview">
                {settings.announcement}
              </div>
            )}
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
            <div className="skeleton-card" />
          </>
        ) : (
          <div className="phone-message">
            <span className={`badge ${mode.color}`}>
              <Radio size={19} />
            </span>
            <h3>{settings.title || t(mode.label)}</h3>
            <p>{settings.message || t("unavailable")}</p>
            <span className="phone-retry">{t("tryAgain")}</span>
            {settings.supportEmail && <small>{settings.supportEmail}</small>}
          </div>
        )}
      </div>
      <p className="muted preview-note">{t("previewNote")}</p>
    </section>
  );
}
