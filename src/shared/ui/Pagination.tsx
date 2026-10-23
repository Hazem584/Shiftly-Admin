import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "../../core/i18n/LocaleProvider";
export function Pagination({
  page,
  hasNext,
  onPage,
}: {
  page: number;
  hasNext: boolean;
  onPage: (value: number) => void;
}) {
  const { t, number } = useLocale();
  return (
    <div className="pagination">
      <span>{t("page", { count: number(page) })}</span>
      <div>
        <button
          type="button"
          aria-label={t("previousPage")}
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronRight className="directional" size={17} />
        </button>
        <button
          type="button"
          aria-label={t("nextPage")}
          disabled={!hasNext}
          onClick={() => onPage(page + 1)}
        >
          <ChevronLeft className="directional" size={17} />
        </button>
      </div>
    </div>
  );
}
