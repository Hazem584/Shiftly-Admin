import { useEffect, useState, type FormEvent } from "react";
import {
  Search,
  ShieldCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
} from "lucide-react";
import { api } from "./api";
import {
  type User,
  type UsersPage,
  type Workspace,
  type Audit,
  date,
  number,
} from "./types";

export function UsersView({
  compact = false,
  refresh,
  onChanged,
}: {
  compact?: boolean;
  refresh: number;
  onChanged?: () => void;
}) {
  const [data, setData] = useState<UsersPage | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<User | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void api<UsersPage>(
      `users?${new URLSearchParams({ page: String(page), pageSize: compact ? "5" : "20", search: term, status })}`,
      { signal: controller.signal },
    )
      .then(setData)
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, term, status, compact, refresh]);
  function submit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setTerm(search.trim());
  }
  return (
    <div className={compact ? "" : "panel"}>
      {!compact && (
        <div className="table-toolbar">
          <form onSubmit={submit} className="search">
            <Search size={18} />
            <input
              aria-label="البحث عن مستخدم"
              placeholder="ابحث بالاسم أو البريد أو الهاتف…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">بحث</button>
          </form>
          <select
            aria-label="حالة الحساب"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">كل الحسابات</option>
            <option value="active">الحسابات المفعّلة</option>
            <option value="online">نشطون مؤخرًا</option>
            <option value="suspended">الحسابات المعلّقة</option>
          </select>
          <span className="muted">
            {data ? `${number(data.total)} مستخدم` : "…"}
          </span>
        </div>
      )}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="empty">جارٍ تحميل المستخدمين…</div>
      ) : (
        !error && (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>المستخدم</th>
                    <th>مساحة العمل</th>
                    <th>حالة الحساب</th>
                    <th>آخر نشاط</th>
                    {!compact && <th>الإجراء</th>}
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <span className="user-avatar">
                            {(user.fullName || user.email || "؟").slice(0, 1)}
                          </span>
                          <span>
                            <strong>
                              {user.fullName || "بدون اسم"}{" "}
                              {user.isPlatformAdmin && (
                                <ShieldCheck size={14} />
                              )}
                            </strong>
                            <small dir="ltr">
                              {user.email || user.phone || "—"}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td>
                        {user.memberships.slice(0, 2).map((member) => (
                          <div key={member.workspace.id} className="membership">
                            {member.workspace.name}
                            <small>
                              {member.role === "MANAGER" ? "مدير" : "موظف"} ·{" "}
                              {member.status === "ACTIVE"
                                ? "مفعّل"
                                : member.status === "SUSPENDED"
                                  ? "معلّق"
                                  : "مدعو"}
                            </small>
                          </div>
                        ))}
                        {!user.memberships.length && (
                          <span className="muted">بدون مساحة عمل</span>
                        )}
                        {user.memberships.length > 2 && (
                          <small>
                            +{number(user.memberships.length - 2)} أخرى
                          </small>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${user.isSuspended ? "red" : "green"}`}
                        >
                          <span className="dot" />
                          {user.isSuspended ? "معلّق" : "مفعّل"}
                        </span>
                      </td>
                      <td className="date-cell">{date(user.lastSeenAt)}</td>
                      {!compact && (
                        <td>
                          <button
                            disabled={user.isPlatformAdmin}
                            className={
                              user.isSuspended ? "action restore" : "action"
                            }
                            onClick={() => setTarget(user)}
                          >
                            {user.isSuspended ? (
                              <ShieldCheck size={15} />
                            ) : (
                              <Ban size={15} />
                            )}{" "}
                            {user.isSuspended ? "إعادة التفعيل" : "تعليق"}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.items.length === 0 && (
                <div className="empty">لا توجد حسابات مطابقة للبحث.</div>
              )}
            </div>
            {!compact && (
              <Pagination
                page={page}
                hasNext={page * 20 < (data?.total ?? 0)}
                onPage={setPage}
              />
            )}
          </>
        )
      )}
      {target && (
        <AccessDialog
          user={target}
          onClose={() => setTarget(null)}
          onSaved={() => {
            setTarget(null);
            onChanged?.();
          }}
        />
      )}
    </div>
  );
}

function AccessDialog({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [busy, onClose]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`users/${user.id}/access`, {
        method: "PATCH",
        body: JSON.stringify({ suspended: !user.isSuspended, reason }),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-title"
      >
        <button
          className="modal-close"
          aria-label="إغلاق"
          disabled={busy}
          onClick={onClose}
        >
          <X />
        </button>
        <span className="icon-box">
          <ShieldCheck />
        </span>
        <h2 id="access-title">
          {user.isSuspended ? "إعادة تفعيل الحساب" : "تعليق وصول المستخدم"}
        </h2>
        <p>{user.fullName || user.email}</p>
        <p className="muted">
          {user.isSuspended
            ? "سيتمكن المستخدم من استخدام التطبيق مجددًا."
            : "سيتوقف وصول الحساب إلى خدمات التطبيق، وسيظهر له سبب التعليق."}
        </p>
        {user.suspensionReason && (
          <p>سبب التعليق الحالي: {user.suspensionReason}</p>
        )}
        <form onSubmit={submit}>
          <label>
            {user.isSuspended ? "ملاحظة للسجل (اختياري)" : "سبب التعليق"}
            <textarea
              autoFocus
              required={!user.isSuspended}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <div className="form-actions">
            <button
              type="submit"
              className={user.isSuspended ? "primary" : "danger"}
              disabled={busy || (!user.isSuspended && !reason.trim())}
            >
              {busy ? "جارٍ الحفظ…" : "تأكيد التغيير"}
            </button>
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={onClose}
            >
              إلغاء
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Pagination({
  page,
  hasNext,
  onPage,
}: {
  page: number;
  hasNext: boolean;
  onPage: (page: number) => void;
}) {
  return (
    <div className="pagination">
      <span>صفحة {number(page)}</span>
      <div>
        <button
          aria-label="الصفحة السابقة"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronRight size={17} />
        </button>
        <button
          aria-label="الصفحة التالية"
          disabled={!hasNext}
          onClick={() => onPage(page + 1)}
        >
          <ChevronLeft size={17} />
        </button>
      </div>
    </div>
  );
}

export function WorkspacesView({ refresh }: { refresh: number }) {
  const [data, setData] = useState<Workspace[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError("");
    void api<Workspace[]>(`workspaces?page=${page}`, { signal: c.signal })
      .then(setData)
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [page, refresh]);
  return (
    <section className="panel">
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <div className="empty">جارٍ تحميل مساحات العمل…</div>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>مساحة العمل</th>
                  <th>المالك</th>
                  <th>الأعضاء</th>
                  <th>المنطقة الزمنية</th>
                  <th>تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody>
                {data.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div className="user-cell">
                        <span className="icon-box">
                          <Building2 size={20} />
                        </span>
                        <span>
                          <strong>{w.name}</strong>
                          <small dir="ltr">{w.code}</small>
                        </span>
                      </div>
                    </td>
                    <td>{w.creator.fullName || w.creator.email || "—"}</td>
                    <td>{number(w._count.memberships)}</td>
                    <td dir="ltr">{w.timezone}</td>
                    <td>{date(w.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.length && <div className="empty">لا توجد مساحات عمل.</div>}
          <Pagination
            page={page}
            hasNext={data.length === 50}
            onPage={setPage}
          />
        </>
      )}
    </section>
  );
}

const actions: Record<string, string> = {
  SETTINGS_UPDATED: "تعديل إعدادات المنصة",
  USER_SUSPENDED: "تعليق حساب مستخدم",
  USER_RESTORED: "إعادة تفعيل حساب",
};
export function AuditView({ refresh }: { refresh: number }) {
  const [data, setData] = useState<Audit[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError("");
    void api<Audit[]>(`audit?page=${page}`, { signal: c.signal })
      .then(setData)
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [page, refresh]);
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>سجل تغييرات الإدارة</h2>
          <p>التغييرات محفوظة مع المسؤول والتوقيت والتفاصيل</p>
        </div>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="empty">جارٍ تحميل السجل…</div>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>الإجراء</th>
                  <th>المسؤول</th>
                  <th>الهدف</th>
                  <th>التوقيت</th>
                  <th>التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{actions[a.action] || a.action}</strong>
                    </td>
                    <td>
                      <code>{a.actorId}</code>
                    </td>
                    <td>
                      <code>{a.targetId}</code>
                    </td>
                    <td>{date(a.createdAt)}</td>
                    <td>
                      <details>
                        <summary>عرض</summary>
                        <pre dir="ltr">
                          {JSON.stringify(a.details, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.length && (
            <div className="empty">
              ستظهر تغييرات الإدارة هنا بعد أول إجراء.
            </div>
          )}
          <Pagination
            page={page}
            hasNext={data.length === 50}
            onPage={setPage}
          />
        </>
      )}
    </section>
  );
}
