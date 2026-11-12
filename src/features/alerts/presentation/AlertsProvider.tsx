import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { usePermissions } from "../../../core/auth/admin-access";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { MessageKey } from "../../../core/i18n/messages";
import { useResource } from "../../../shared/hooks/useResource";
import type { AlertFeed } from "../domain/models";
interface AlertsContextValue {
  data: AlertFeed | null;
  error: unknown;
  refresh: () => void;
  open: (id?: string) => void;
}
const Context = createContext<AlertsContextValue>({
  data: null,
  error: null,
  refresh: () => {},
  open: () => {},
});
export function AlertsProvider({
  children,
  onOpen,
}: {
  children: ReactNode;
  onOpen: (id?: string) => void;
}) {
  const repo = useAdminRepository();
  const { can } = usePermissions();
  const { t } = useLocale();
  const [tick, setTick] = useState(0);
  const resource = useResource(
    useCallback((s) => repo.alerts(s), [repo]),
    can("alerts.read"),
    tick,
  );
  const seen = useRef(new Set<string>());
  const loaded = useRef(false);
  useEffect(() => {
    if (!can("alerts.read")) return;
    const timer = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, [can("alerts.read")]);
  useEffect(() => {
    if (!resource.data) return;
    for (const alert of resource.data.items) {
      const key = `${alert.id}:${alert.episode}`;
      if (
        !seen.current.has(key) &&
        loaded.current &&
        alert.status === "OPEN" &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        try {
          const notice = new Notification(
            t(("alertKind_" + alert.kind) as MessageKey),
            { body: t("alertsNotificationBody"), tag: key },
          );
          notice.onclick = () => {
            window.focus();
            onOpen(alert.id);
            notice.close();
          };
        } catch {
          /* The persistent alert remains available when OS notifications are blocked. */
        }
      }
      seen.current.add(key);
    }
    loaded.current = true;
  }, [resource.data, t, onOpen]);
  return (
    <Context.Provider
      value={{
        data: resource.data,
        error: resource.error,
        refresh: resource.refresh,
        open: onOpen,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAlerts = () => useContext(Context);
