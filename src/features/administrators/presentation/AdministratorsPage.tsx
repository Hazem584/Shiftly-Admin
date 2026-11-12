import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import {
  togglePermission,
  type Permission,
} from "../../../core/auth/admin-access";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import type { MessageKey } from "../../../core/i18n/messages";
import { useResource } from "../../../shared/hooks/useResource";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import type {
  Administrator,
  AdminRole,
  SaveAdministrator,
} from "../domain/models";
const roleLabel: Record<AdminRole, MessageKey> = {
  SUPPORT: "roleSupport",
  MONITOR: "roleMonitor",
  SETTINGS: "roleSettings",
  CUSTOM: "roleCustom",
};
const initial: SaveAdministrator = {
  email: "",
  role: "SUPPORT",
  permissions: [],
  enabled: true,
  revision: 0,
};
export function AdministratorsPage({ refresh }: { refresh: number }) {
  const repo = useAdminRepository();
  const { t, date } = useLocale();
  const state = useResource(
    useCallback((s) => repo.administrators(s), [repo]),
    true,
    refresh,
  );
  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (state.data && !initialized) {
      setForm({ ...initial, permissions: [...state.data.presets.SUPPORT] });
      setInitialized(true);
    }
  }, [state.data, initialized]);
  function edit(a: Administrator) {
    setSaved(false);
    setForm({
      email: a.profile.email ?? "",
      role: a.role,
      permissions: a.permissions,
      enabled: a.enabled,
      revision: a.revision,
    });
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await repo.saveAdministrator(form);
      setSaved(true);
      setForm({
        ...initial,
        permissions: [...(state.data?.presets.SUPPORT ?? [])],
      });
      state.refresh();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  if (!state.data)
    return state.error ? <ErrorNotice error={state.error} /> : <Loading />;
  return (
    <div className="operations-grid">
      <section className="panel">
        <h2>{t("administrators")}</h2>
        <p>{t("adminAccessIntro")}</p>
        <p className="muted">{t("adminOwnersNote")}</p>
        <ErrorNotice error={state.error} />
        {state.data.items.map((a) => (
          <article className="operations-row" key={a.profileId}>
            <div>
              <strong>{a.profile.fullName || a.profile.email}</strong>
              <small>
                {a.profile.email} · {t(roleLabel[a.role])} ·{" "}
                {t(a.enabled ? "active" : "suspended")}
              </small>
              <small>{date(a.updatedAt)}</small>
            </div>
            <button className="secondary" onClick={() => edit(a)}>
              {t("adminEdit")}
            </button>
          </article>
        ))}
      </section>
      <form className="panel" onSubmit={submit}>
        <h2>{t(form.revision ? "adminEdit" : "adminNew")}</h2>
        <fieldset disabled={busy} className="operations-fields">
          <label>
            {t("adminEmail")}
            <input
              type="email"
              maxLength={200}
              required
              value={form.email}
              disabled={form.revision > 0}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </label>
          <label>
            {t("adminRole")}
            <select
              value={form.role}
              onChange={(e) => {
                const role = e.target.value as AdminRole;
                setForm((f) => ({
                  ...f,
                  role,
                  permissions: [...state.data!.presets[role]],
                }));
              }}
            >
              {(Object.keys(roleLabel) as AdminRole[]).map((r) => (
                <option key={r} value={r}>
                  {t(roleLabel[r])}
                </option>
              ))}
            </select>
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, enabled: e.target.checked }))
              }
            />
            {t("adminEnabled")}
          </label>
          <h3>{t("adminPermissions")}</h3>
          <div className="permission-grid">
            {state.data.permissions.map((p) => (
              <label
                key={p}
                className={`check-label ${p === "accounts.delete" ? "permission-danger" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={form.permissions.includes(p)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      permissions: togglePermission(
                        f.permissions,
                        p as Permission,
                        e.target.checked,
                      ),
                    }))
                  }
                />
                {t(("permission_" + p) as MessageKey)}
              </label>
            ))}
          </div>
          <ErrorNotice error={error} />
          {saved && (
            <p className="success" role="status">
              {t("adminSaved")}
            </p>
          )}
          <div className="form-actions">
            <button className="primary" disabled={busy}>
              {t(busy ? "saving" : "save")}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() =>
                setForm({
                  ...initial,
                  permissions: [...state.data!.presets.SUPPORT],
                })
              }
            >
              {t("adminNew")}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
