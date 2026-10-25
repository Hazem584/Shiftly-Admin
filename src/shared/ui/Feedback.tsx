import { AlertCircle } from "lucide-react";
import { ApiError } from "../../core/data/http-client";
import { useLocale } from "../../core/i18n/LocaleProvider";
export function ErrorNotice({ error }: { error: unknown }) {
  const { t } = useLocale();
  if (!error) return null;
  const api = error instanceof ApiError ? error : null;
  const key =
    api?.code === "ADMIN_SECRET_REQUIRED"
      ? "errorMissingSecret"
      : api?.code === "DELETION_PLAN_CHANGED"
        ? "planChanged"
        : api?.code === "REQUEST_TIMEOUT"
          ? "errorTimeout"
          : api?.code === "NETWORK_ERROR"
            ? "errorNetwork"
            : api?.status === 401
              ? "errorSession"
              : api?.status === 403
                ? "errorForbidden"
                : api?.status === 409
                  ? "errorConflict"
                  : "errorGeneric";
  return (
    <div className="error" role="alert">
      <AlertCircle size={17} />
      {t(key)}
    </div>
  );
}
export function Loading() {
  const { t } = useLocale();
  return (
    <div className="empty" role="status">
      <span className="loading-pulse" />
      {t("loading")}
    </div>
  );
}
