import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderAdmin, repository, settings } from "../../../test/renderAdmin";
import { SettingsPage } from "./SettingsPage";
import { ApiError } from "../../../core/data/http-client";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
describe("platform settings", () => {
  it("requires confirmation before stopping the platform and sends the current revision", async () => {
    const save = vi.fn(async () => ({
      ...settings,
      mode: "MAINTENANCE" as const,
      revision: 3,
    }));
    const saved = vi.fn();
    renderAdmin(
      <SettingsPage onSaved={saved} />,
      repository({ settings: async () => settings, saveSettings: save }),
    );
    fireEvent.click(await screen.findByRole("button", { name: /وضع الصيانة/ }));
    fireEvent.click(screen.getByRole("button", { name: "حفظ التغييرات" }));
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "تأكيد وتطبيق" }));
    await waitFor(() => expect(saved).toHaveBeenCalled());
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "MAINTENANCE", revision: 2 }),
    );
  });
  it("preserves user edits after a conflicting save", async () => {
    renderAdmin(
      <SettingsPage onSaved={vi.fn()} />,
      repository({
        settings: async () => settings,
        saveSettings: async () => {
          throw new ApiError("CONFLICT", 409);
        },
      }),
    );
    const input = await screen.findByPlaceholderText(
      "اترك الحقل فارغًا لإخفاء الإعلان",
    );
    fireEvent.change(input, { target: { value: "New announcement" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ التغييرات" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "تغيّرت البيانات",
    );
    expect((input as HTMLTextAreaElement).value).toBe("New announcement");
  });
});
