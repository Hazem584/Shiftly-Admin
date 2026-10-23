import { Check } from "lucide-react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { modeKeys, type Mode } from "../domain/models";
export function ModeSelector({
  value,
  onChange,
}: {
  value: Mode;
  onChange: (mode: Mode) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="mode-grid" role="group" aria-label={t("serviceState")}>
      {(Object.keys(modeKeys) as Mode[]).map((mode) => (
        <button
          type="button"
          key={mode}
          className={`mode-option ${value === mode ? "chosen" : ""}`}
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
        >
          <span className={`mode-dot ${modeKeys[mode].color}`} />
          <strong>{t(modeKeys[mode].label)}</strong>
          <small>{t(modeKeys[mode].description)}</small>
          <span className="radio-circle">
            {value === mode && <Check size={12} />}
          </span>
        </button>
      ))}
    </div>
  );
}
