import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { Settings } from "../domain/models";
import type { ChangeSettings } from "./ServiceSettingsForm";
export function AnnouncementSettings({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: ChangeSettings;
}) {
  const { t } = useLocale();
  return (
    <section className="panel settings-panel">
      <div className="panel-heading">
        <div>
          <h2>{t("announcementAndSignup")}</h2>
          <p>{t("announcementDescription")}</p>
        </div>
      </div>
      <label>
        {t("announcement")}
        <textarea
          maxLength={500}
          rows={3}
          placeholder={t("announcementPlaceholder")}
          value={settings.announcement}
          onChange={(e) => onChange("announcement", e.target.value)}
        />
      </label>
      <label className="toggle-row">
        <span>
          <strong>{t("allowRegistration")}</strong>
          <small>{t("allowRegistrationDescription")}</small>
        </span>
        <input
          type="checkbox"
          checked={settings.registrationEnabled}
          onChange={(e) => onChange("registrationEnabled", e.target.checked)}
        />
      </label>
    </section>
  );
}
