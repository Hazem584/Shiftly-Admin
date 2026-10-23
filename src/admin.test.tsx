import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SettingsView } from "./SettingsView";
import { UsersView } from "./DataViews";
import { api } from "./api";
vi.mock("./api", () => ({ api: vi.fn() }));
const mockedApi = vi.mocked(api);
const settings = {
  mode: "OPERATIONAL",
  title: "",
  message: "",
  announcement: "",
  registrationEnabled: true,
  supportEmail: null,
  revision: 2,
};
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("administrative controls", () => {
  it("requires confirmation before stopping the entire platform", async () => {
    mockedApi
      .mockResolvedValueOnce(settings)
      .mockResolvedValueOnce({ ...settings, mode: "MAINTENANCE", revision: 3 });
    const saved = vi.fn();
    render(<SettingsView onSaved={saved} />);
    fireEvent.click(await screen.findByRole("button", { name: /وضع الصيانة/ }));
    fireEvent.click(screen.getByRole("button", { name: "حفظ التغييرات" }));
    expect(mockedApi).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "تأكيد وتطبيق" }));
    await waitFor(() => expect(saved).toHaveBeenCalled());
    const request = JSON.parse(mockedApi.mock.calls[1][1]!.body as string);
    expect(request.mode).toBe("MAINTENANCE");
    expect(request.revision).toBe(2);
    expect(request.id).toBeUndefined();
  });
  it("preserves the form when the backend rejects stale settings", async () => {
    mockedApi
      .mockResolvedValueOnce(settings)
      .mockRejectedValueOnce(new Error("تغيّرت البيانات"));
    render(<SettingsView onSaved={vi.fn()} />);
    fireEvent.change(
      await screen.findByPlaceholderText("اترك الحقل فارغًا لإخفاء الإعلان"),
      { target: { value: "إعلان جديد" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "حفظ التغييرات" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "تغيّرت البيانات",
    );
    expect(
      (
        screen.getByPlaceholderText(
          "اترك الحقل فارغًا لإخفاء الإعلان",
        ) as HTMLTextAreaElement
      ).value,
    ).toBe("إعلان جديد");
  });
  it("requires a suspension reason and refreshes users after success", async () => {
    mockedApi
      .mockResolvedValueOnce({
        total: 1,
        items: [
          {
            id: "user-id",
            fullName: "مستخدم تجريبي",
            email: "test@example.com",
            memberships: [],
            isSuspended: false,
            lastSeenAt: null,
            isPlatformAdmin: false,
          },
        ],
      })
      .mockResolvedValueOnce({});
    const changed = vi.fn();
    render(<UsersView refresh={0} onChanged={changed} />);
    fireEvent.click(await screen.findByRole("button", { name: "تعليق" }));
    const confirm = screen.getByRole("button", {
      name: "تأكيد التغيير",
    }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(screen.getByRole("textbox", { name: "سبب التعليق" }), {
      target: { value: "مراجعة الحساب" },
    });
    fireEvent.click(confirm);
    await waitFor(() => expect(changed).toHaveBeenCalled());
    expect(JSON.parse(mockedApi.mock.calls[1][1]!.body as string)).toEqual({
      suspended: true,
      reason: "مراجعة الحساب",
    });
  });
});
