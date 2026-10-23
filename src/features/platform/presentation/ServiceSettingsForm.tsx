import { Radio } from "lucide-react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { Settings } from "../domain/models";
import { ModeSelector } from "./ModeSelector";
export type ChangeSettings = <K extends keyof Settings>(
  field: K,
  value: Settings[K],
) => void;
export function ServiceSettingsForm({
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
          <h2>{t("serviceState")}</h2>
          <p>{t("serviceStateDescription")}</p>
        </div>
        <Radio size={22} />
      </div>
      <ModeSelector
        value={settings.mode}
        onChange={(mode) => onChange("mode", mode)}
      />
      <label>
        {t("statusTitle")}
        <input
          maxLength={120}
          placeholder={t("statusTitlePlaceholder")}
          value={settings.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </label>
      <label>
        {t("statusMessage")}
        <textarea
          maxLength={2000}
          rows={4}
          placeholder={t("statusMessagePlaceholder")}
          value={settings.message}
          onChange={(e) => onChange("message", e.target.value)}
        />
      </label>
      <label>
        {t("supportEmail")}
        <input
          type="email"
          maxLength={200}
          dir="ltr"
          placeholder="support@example.com"
          value={settings.supportEmail || ""}
          onChange={(e) => onChange("supportEmail", e.target.value || null)}
        />
      </label>
    </section>
  );
}
