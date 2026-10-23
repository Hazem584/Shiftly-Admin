import { ArrowUpLeft, Radio } from "lucide-react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { modeKeys, type Settings } from "../../platform/domain/models";
export function StatusBanner({
  settings,
  onManage,
}: {
  settings: Settings;
  onManage: () => void;
}) {
  const { t } = useLocale();
  const mode = modeKeys[settings.mode];
  return (
    <section className={`status-banner status-${mode.color}`}>
      <div className="status-icon">
        <Radio size={27} />
      </div>
      <div>
        <span className="eyebrow">{t("currentStatus")}</span>
        <h2>{t(mode.label)}</h2>
        <p>{t(mode.description)}</p>
      </div>
      <span className={`badge ${mode.color}`}>
        <span className="dot" />
        {t(
          settings.mode === "OPERATIONAL"
            ? "servicesAvailable"
            : "servicesStopped",
        )}
      </span>
      <button onClick={onManage}>
        {t("manageStatus")}
        <ArrowUpLeft size={17} />
      </button>
    </section>
  );
}
