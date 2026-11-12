import { AdminAccessProvider, permissions } from "../core/auth/admin-access";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import type { ReactNode } from "react";
import { ServicesProvider } from "../app/ServicesProvider";
import { LocaleProvider } from "../core/i18n/LocaleProvider";
import type { AdminRepository } from "../core/domain/admin-repository";
export function repository(
  overrides: Partial<AdminRepository> = {},
): AdminRepository {
  return {
    administrators: vi.fn(),
    saveAdministrator: vi.fn(),
    alerts: vi.fn(),
    acknowledgeAlert: vi.fn(),
    saveAlertPolicy: vi.fn(),
    support: vi.fn(),
    supportTicket: vi.fn(),
    supportAssignees: vi.fn(),
    replySupport: vi.fn(),
    updateSupport: vi.fn(),
    supportImage: vi.fn(),
    appIcons: vi.fn(async () => ({
      revision: 0,
      activeKey: "default",
      icons: [],
    })),
    uploadAppIcon: vi.fn(),
    selectAppIcon: vi.fn(),
    requests: vi.fn(),
    sessions: vi.fn(),
    errors: vi.fn(),
    releases: vi.fn(),
    saveRelease: vi.fn(),
    authorize: vi.fn(async () => ({
      id: "owner",
      role: "OWNER" as const,
      permissions: [...permissions],
    })),
    overview: vi.fn(),
    settings: vi.fn(),
    saveSettings: vi.fn(),
    users: vi.fn(),
    setAccess: vi.fn(),
    deletionPreview: vi.fn(),
    deleteAccount: vi.fn(),
    deletionJobs: vi.fn(async () => []),
    retryDeletion: vi.fn(),
    workspaces: vi.fn(),
    audit: vi.fn(),
    ...overrides,
  };
}
export function renderAdmin(children: ReactNode, repo: AdminRepository) {
  return render(
    <LocaleProvider>
      <ServicesProvider repository={repo}>
        <AdminAccessProvider
          access={{ id: "owner", role: "OWNER", permissions: [...permissions] }}
        >
          {children}
        </AdminAccessProvider>
      </ServicesProvider>
    </LocaleProvider>,
  );
}
export const settings = {
  mode: "OPERATIONAL" as const,
  title: "",
  message: "",
  announcement: "",
  registrationEnabled: true,
  supportEmail: null,
  revision: 2,
};
export const user = {
  id: "user-id",
  fullName: "Test user",
  email: "test@example.com",
  phone: null,
  createdAt: "",
  lastSeenAt: null,
  isSuspended: false,
  suspensionReason: null,
  isPlatformAdmin: false,
  memberships: [],
};
