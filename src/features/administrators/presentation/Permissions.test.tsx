import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  AdminAccessProvider,
  togglePermission,
} from "../../../core/auth/admin-access";
import {
  repository,
  renderAdmin,
  settings,
  user,
} from "../../../test/renderAdmin";
import { UsersPage } from "../../users/presentation/UsersPage";
import { SettingsPage } from "../../platform/presentation/SettingsPage";
import { SupportPage } from "../../support/presentation/SupportPage";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
describe("administrator capabilities", () => {
  it("keeps account deletion independent from platform settings changes", () => {
    expect(
      togglePermission(
        ["settings.read", "settings.write"],
        "accounts.delete",
        true,
      ).sort(),
    ).toEqual([
      "accounts.delete",
      "settings.read",
      "settings.write",
      "users.read",
    ]);
    expect(
      togglePermission(
        ["users.read", "accounts.delete", "settings.read", "settings.write"],
        "settings.write",
        false,
      ),
    ).toContain("accounts.delete");
  });
  it("does not load deletion jobs or show destructive controls to a read-only user administrator", async () => {
    localStorage.setItem("shiftly.admin.locale", "en");
    const repo = repository({
      users: async () => ({ items: [user], total: 1, page: 1, pageSize: 20 }),
    });
    renderAdmin(
      <AdminAccessProvider
        access={{ id: "monitor", role: "CUSTOM", permissions: ["users.read"] }}
      >
        <UsersPage refresh={0} />
      </AdminAccessProvider>,
      repo,
    );
    await screen.findByText("Test user");
    expect(screen.queryByRole("button", { name: /Delete account/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Suspend" })).toBeNull();
    expect(repo.deletionJobs).not.toHaveBeenCalled();
  });
  it("blocks settings form submission for a read-only settings account", async () => {
    localStorage.setItem("shiftly.admin.locale", "en");
    const repo = repository({ settings: async () => settings });
    renderAdmin(
      <AdminAccessProvider
        access={{
          id: "monitor",
          role: "CUSTOM",
          permissions: ["settings.read"],
        }}
      >
        <SettingsPage onSaved={vi.fn()} />
      </AdminAccessProvider>,
      repo,
    );
    const notice = await screen.findByText(
      "Your account has read-only access to this section.",
    );
    const form = notice.closest("form")!;
    fireEvent.submit(form);
    await waitFor(() => expect(repo.saveSettings).not.toHaveBeenCalled());
  });
  it("lets support viewers read a report without loading assignees or rendering reply controls", async () => {
    localStorage.setItem("shiftly.admin.locale", "en");
    const ticket = {
      id: "ticket",
      title: "Missing attendance",
      description: "The attendance calendar is missing a day.",
      status: "OPEN" as const,
      revision: 1,
      workspaceId: "workspace",
      reporterId: "employee",
      assigneeId: null,
      reporter: {
        id: "employee",
        email: "staff@test.invalid",
        fullName: "Employee",
      },
      assignee: null,
      workspace: { id: "workspace", name: "Hotel" },
      relatedKind: null,
      relatedLabel: null,
      hasImage: false,
      createdAt: "2026-11-12T10:00:00Z",
      updatedAt: "2026-11-12T10:00:00Z",
      replies: [],
    };
    const repo = repository({
      support: async () => ({ items: [ticket], hasNext: false }),
      supportTicket: async () => ticket,
    });
    renderAdmin(
      <AdminAccessProvider
        access={{ id: "viewer", role: "CUSTOM", permissions: ["support.read"] }}
      >
        <SupportPage refresh={0} />
      </AdminAccessProvider>,
      repo,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Missing attendance" }),
    );
    await screen.findByText(ticket.description);
    expect(screen.queryByRole("button", { name: "Send reply" })).toBeNull();
    expect(repo.supportAssignees).not.toHaveBeenCalled();
  });
});
