import { Languages } from "lucide-react";
import { useLocale } from "./LocaleProvider";
export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="language-switch" aria-label="Language / اللغة">
      <Languages size={16} />
      <button
        type="button"
        lang="ar"
        aria-pressed={locale === "ar"}
        onClick={() => setLocale("ar")}
      >
        عربي
      </button>
      <button
        type="button"
        lang="en"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        English
      </button>
    </div>
  );
}
