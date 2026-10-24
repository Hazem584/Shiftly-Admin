import { useState } from "react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
export function MonitoringFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLocale();
  const [draft, setDraft] = useState(value);
  return (
    <form
      className="monitor-toolbar"
      onSubmit={(e) => {
        e.preventDefault();
        onChange(draft.trim());
      }}
    >
      <label>
        {t("userIdFilter")}
        <input
          aria-label={t("userIdFilter")}
          dir="ltr"
          value={draft}
          pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
          title={t("userIdHint")}
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <button className="secondary" type="submit">
        {t("applyFilter")}
      </button>
      {value && (
        <button
          className="secondary"
          type="button"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
        >
          {t("clearFilter")}
        </button>
      )}
    </form>
  );
}
