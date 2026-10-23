import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderAdmin, repository, user } from "../../../test/renderAdmin";
import { UsersPage } from "./UsersPage";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
describe("user administration", () => {
  it("requires a reason to suspend an account", async () => {
    const access = vi.fn(async () => ({}));
    renderAdmin(
      <UsersPage refresh={0} />,
      repository({
        users: async () => ({ items: [user], total: 1, page: 1, pageSize: 20 }),
        setAccess: access,
      }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "تعليق" }));
    const confirm = screen.getByRole("button", {
      name: "تأكيد التغيير",
    }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(screen.getByRole("textbox", { name: "سبب التعليق" }), {
      target: { value: "Review" },
    });
    fireEvent.click(confirm);
    await waitFor(() => expect(access).toHaveBeenCalledWith(user, "Review"));
  });
  it("protects platform administrators in the interface", async () => {
    renderAdmin(
      <UsersPage refresh={0} />,
      repository({
        users: async () => ({
          items: [{ ...user, isPlatformAdmin: true }],
          total: 1,
          page: 1,
          pageSize: 20,
        }),
      }),
    );
    expect(
      (
        (await screen.findByRole("button", {
          name: "تعليق",
        })) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: /حذف الحساب:/ }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
  it("shows deletion impact and requires exact typed confirmation", async () => {
    const remove = vi.fn(async () => ({
      profileId: user.id,
      state: "COMPLETED" as const,
    }));
    const deleted = vi.fn();
    renderAdmin(
      <DeleteAccountDialog user={user} onClose={vi.fn()} onDeleted={deleted} />,
      repository({
        deletionPreview: async () => ({
          profileId: user.id,
          confirmation: user.email!,
          fingerprint: "abc",
          counts: { profiles: 1, workspaces: 2 },
          ownedWorkspaces: [{ id: "w", name: "Shared workspace" }],
          storageObjects: 3,
          canDelete: true,
        }),
        deleteAccount: remove,
      }),
    );
    await screen.findByText("Shared workspace");
    const confirm = screen.getByRole("button", {
      name: "حذف نهائي",
    }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "wrong@example.com" },
    });
    expect(confirm.disabled).toBe(true);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: user.email },
    });
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(remove).toHaveBeenCalledWith(user.id, user.email, "abc"),
    );
    expect(deleted).toHaveBeenCalled();
  });
  it("disables deletion when the backend cleanup credential is missing", async () => {
    renderAdmin(
      <DeleteAccountDialog user={user} onClose={vi.fn()} onDeleted={vi.fn()} />,
      repository({
        deletionPreview: async () => ({
          profileId: user.id,
          confirmation: user.email!,
          fingerprint: "abc",
          counts: { profiles: 1 },
          ownedWorkspaces: [],
          storageObjects: 0,
          canDelete: false,
        }),
      }),
    );
    await screen.findByRole("alert");
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: user.email },
    });
    expect(
      (screen.getByRole("button", { name: "حذف نهائي" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
