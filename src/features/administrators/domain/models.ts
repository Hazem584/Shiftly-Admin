import type { Permission } from "../../../core/auth/admin-access";
export type AdminRole = "SUPPORT" | "MONITOR" | "SETTINGS" | "CUSTOM";
export interface Administrator {
  profileId: string;
  role: AdminRole;
  permissions: Permission[];
  enabled: boolean;
  revision: number;
  updatedAt: string;
  profile: {
    email: string | null;
    fullName: string | null;
    isSuspended: boolean;
  };
}
export interface AdministratorCatalog {
  items: Administrator[];
  permissions: Permission[];
  presets: Record<AdminRole, Permission[]>;
}
export interface SaveAdministrator {
  email: string;
  role: AdminRole;
  permissions: Permission[];
  enabled: boolean;
  revision: number;
}
