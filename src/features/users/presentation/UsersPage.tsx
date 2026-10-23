import { useState } from "react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { Pagination } from "../../../shared/ui/Pagination";
import { useUsers } from "../application/useUsers";
import type { DeletionResult, User } from "../domain/models";
import { UsersToolbar } from "./UsersToolbar";
import { UsersTable } from "./UsersTable";
import { AccessDialog } from "./AccessDialog";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { DeletionQueue } from "./DeletionQueue";
export function UsersPage({
  refresh,
  compact = false,
  onChanged,
}: {
  refresh: number;
  compact?: boolean;
  onChanged?: () => void;
}) {
  const state = useUsers(refresh, compact);
  const { t } = useLocale();
  const [target, setTarget] = useState<{
    user: User;
    action: "access" | "delete";
  } | null>(null);
  const [notice, setNotice] = useState<DeletionResult | null>(null);
  const [localRefresh, setLocalRefresh] = useState(0);
  function changed() {
    setTarget(null);
    state.refresh();
    setLocalRefresh((n) => n + 1);
    onChanged?.();
  }
  function deleted(result: DeletionResult) {
    setNotice(result);
    changed();
  }
  return (
    <>
      {notice && (
        <div
          role="status"
          className={
            notice.state === "COMPLETED" ? "success" : "delete-warning"
          }
        >
          {t(
            notice.state === "COMPLETED"
              ? "deletionComplete"
              : notice.state === "FAILED"
                ? "deletionError"
                : "deletionPending",
          )}
        </div>
      )}
      <section className={compact ? "" : "panel"}>
        {!compact && (
          <UsersToolbar
            status={state.status}
            total={state.data?.total ?? 0}
            onFilter={state.filter}
            onSearch={state.search}
          />
        )}
        <ErrorNotice error={state.error} />
        {state.loading ? (
          <Loading />
        ) : (
          !state.error && (
            <>
              <UsersTable
                users={state.data?.items ?? []}
                compact={compact}
                onAccess={(user) => setTarget({ user, action: "access" })}
                onDelete={(user) => setTarget({ user, action: "delete" })}
              />
              {!compact && (
                <Pagination
                  page={state.page}
                  hasNext={state.page * 20 < (state.data?.total ?? 0)}
                  onPage={state.setPage}
                />
              )}
            </>
          )
        )}
      </section>
      {!compact && <DeletionQueue refresh={refresh + localRefresh} />}
      {target?.action === "access" && (
        <AccessDialog
          user={target.user}
          onClose={() => setTarget(null)}
          onSaved={changed}
        />
      )}
      {target?.action === "delete" && (
        <DeleteAccountDialog
          user={target.user}
          onClose={() => setTarget(null)}
          onDeleted={deleted}
        />
      )}
    </>
  );
}
