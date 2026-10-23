import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
export function UsersToolbar({
  status,
  total,
  onSearch,
  onFilter,
}: {
  status: string;
  total: number;
  onSearch: (value: string) => void;
  onFilter: (value: string) => void;
}) {
  const { t, number } = useLocale();
  const [value, setValue] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    onSearch(value);
  }
  return (
    <div className="table-toolbar">
      <form onSubmit={submit} className="search">
        <Search size={18} />
        <input
          aria-label={t("searchUsers")}
          placeholder={t("searchPlaceholder")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit">{t("search")}</button>
      </form>
      <select
        aria-label={t("accountStatus")}
        value={status}
        onChange={(e) => onFilter(e.target.value)}
      >
        <option value="all">{t("allAccounts")}</option>
        <option value="active">{t("activeAccounts")}</option>
        <option value="online">{t("onlineAccounts")}</option>
        <option value="suspended">{t("suspendedFilter")}</option>
      </select>
      <span className="muted">{t("usersCount", { count: number(total) })}</span>
    </div>
  );
}
