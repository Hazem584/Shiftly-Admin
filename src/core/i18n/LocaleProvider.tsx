import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { ar, en, type MessageKey } from "./messages";
export type Locale = "ar" | "en";
interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
  date: (value: string | null) => string;
  number: (value: number) => string;
}
const Context = createContext<LocaleContextValue | null>(null);
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, update] = useState<Locale>(() => {
    try {
      return localStorage.getItem("shiftly.admin.locale") === "en"
        ? "en"
        : "ar";
    } catch {
      return "ar";
    }
  });
  function setLocale(next: Locale) {
    update(next);
    try {
      localStorage.setItem("shiftly.admin.locale", next);
    } catch {
      /* Locale remains available without storage. */
    }
  }
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.title = `Shiftly — ${(locale === "ar" ? ar : en).adminAccess}`;
  }, [locale]);
  const t: LocaleContextValue["t"] = (key, values = {}) =>
    Object.entries(values).reduce(
      (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
      (locale === "ar" ? ar : en)[key] as string,
    );
  const number = (value: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB").format(value);
  const date = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
          timeZone: "Africa/Cairo",
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(value))
      : t("noActivity");
  return (
    <Context.Provider value={{ locale, setLocale, t, number, date }}>
      {children}
    </Context.Provider>
  );
}
export function useLocale() {
  const value = useContext(Context);
  if (!value) throw new Error("LocaleProvider is required");
  return value;
}
