import { createContext, useContext, type ReactNode } from "react";
export const permissions = [
  "overview.read",
  "users.read",
  "users.manage",
  "accounts.delete",
  "workspaces.read",
  "monitoring.read",
  "monitoring.manage",
  "settings.read",
  "settings.write",
  "releases.write",
  "icons.write",
  "audit.read",
  "support.read",
  "support.reply",
  "support.manage",
  "alerts.read",
  "alerts.manage",
  "admins.manage",
] as const;
export type Permission = (typeof permissions)[number];
export interface AdminAccess {
  id: string;
  email?: string;
  role: "OWNER" | "SUPPORT" | "MONITOR" | "SETTINGS" | "CUSTOM";
  permissions: Permission[];
}
const Context = createContext<AdminAccess | null>(null);
export function AdminAccessProvider({
  access,
  children,
}: {
  access: AdminAccess | null;
  children: ReactNode;
}) {
  return <Context.Provider value={access}>{children}</Context.Provider>;
}
export function usePermissions() {
  const access = useContext(Context);
  return {
    access,
    can: (p: Permission) => access?.permissions?.includes(p) ?? false,
  };
}
export const permissionDependencies: Partial<Record<Permission, Permission>> = {
  "users.manage": "users.read",
  "accounts.delete": "users.read",
  "settings.write": "settings.read",
  "releases.write": "settings.read",
  "icons.write": "settings.read",
  "monitoring.manage": "monitoring.read",
  "support.reply": "support.read",
  "support.manage": "support.read",
  "alerts.manage": "alerts.read",
};
export function togglePermission(
  values: Permission[],
  permission: Permission,
  checked: boolean,
): Permission[] {
  const next = new Set(values);
  if (checked) {
    next.add(permission);
    const parent = permissionDependencies[permission];
    if (parent) next.add(parent);
  } else {
    next.delete(permission);
    for (const [child, parent] of Object.entries(permissionDependencies))
      if (parent === permission) next.delete(child as Permission);
  }
  return [...next];
}
