import { Ban, ShieldCheck, Trash2 } from "lucide-react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { User } from "../domain/models";
export function UsersTable({
  users,
  compact,
  onAccess,
  onDelete,
}: {
  users: User[];
  compact: boolean;
  onAccess: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  const { t, date, number } = useLocale();
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{t("user")}</th>
            <th>{t("workspace")}</th>
            <th>{t("status")}</th>
            <th>{t("lastActivity")}</th>
            {!compact && <th>{t("actions")}</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="user-cell">
                  <span className="user-avatar">
                    {(user.fullName || user.email || "?").slice(0, 1)}
                  </span>
                  <span>
                    <strong>
                      {user.fullName || t("noName")}
                      {user.isPlatformAdmin && <ShieldCheck size={14} />}
                    </strong>
                    <small dir="ltr">{user.email || user.phone || "—"}</small>
                  </span>
                </div>
              </td>
              <td>
                {user.memberships.slice(0, 2).map((member) => (
                  <div key={member.workspace.id} className="membership">
                    {member.workspace.name}
                    <small>
                      {t(member.role === "MANAGER" ? "manager" : "employee")} ·{" "}
                      {t(
                        member.status === "ACTIVE"
                          ? "active"
                          : member.status === "SUSPENDED"
                            ? "suspended"
                            : "invited",
                      )}
                    </small>
                  </div>
                ))}
                {!user.memberships.length && (
                  <span className="muted">{t("noWorkspace")}</span>
                )}
                {user.memberships.length > 2 && (
                  <small>
                    {t("moreWorkspaces", {
                      count: number(user.memberships.length - 2),
                    })}
                  </small>
                )}
              </td>
              <td>
                <span className={`badge ${user.isSuspended ? "red" : "green"}`}>
                  <span className="dot" />
                  {t(user.isSuspended ? "suspended" : "active")}
                </span>
              </td>
              <td className="date-cell">{date(user.lastSeenAt)}</td>
              {!compact && (
                <td>
                  <div className="row-actions">
                    <button
                      disabled={user.isPlatformAdmin}
                      className={`action ${user.isSuspended ? "restore" : ""}`}
                      onClick={() => onAccess(user)}
                    >
                      {user.isSuspended ? (
                        <ShieldCheck size={15} />
                      ) : (
                        <Ban size={15} />
                      )}
                      {t(user.isSuspended ? "restore" : "suspend")}
                    </button>
                    <button
                      disabled={user.isPlatformAdmin}
                      className="action delete-action"
                      aria-label={`${t("deleteAccount")}: ${user.fullName || user.email}`}
                      title={t("deleteAccount")}
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!users.length && <div className="empty">{t("emptyUsers")}</div>}
    </div>
  );
}
