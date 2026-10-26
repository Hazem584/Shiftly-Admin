import { fireEvent, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderAdmin, repository } from "../../../test/renderAdmin";
import { AppIconsPage } from "./AppIconsPage";
import { normalizeIcon } from "../application/normalize-icon";
vi.mock("../application/normalize-icon", () => ({ normalizeIcon: vi.fn() }));
const icon = {
  key: "icon_" + "a".repeat(64),
  sha256: "a".repeat(64),
  name: "Ramadan",
  previewUrl: "https://example.test/icon.png",
  imagePath: "/platform/app-icons/images/a.png",
  createdAt: "",
  sizeBytes: 100,
};
beforeEach(() => {
  localStorage.setItem("shiftly.admin.locale", "en");
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
it("selects a bundled alternative explicitly and sends the current revision", async () => {
  const selectAppIcon = vi.fn(async () => ({}));
  renderAdmin(
    <AppIconsPage />,
    repository({
      appIcons: vi.fn(async () => ({
        revision: 3,
        activeKey: "default",
        icons: [icon],
      })),
      selectAppIcon,
    }),
  );
  await screen.findByRole("radio", { name: /Ramadan/ });
  fireEvent.click(screen.getByRole("radio", { name: /Ramadan/ }));
  expect(selectAppIcon).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Apply selection to users" }),
  );
  await waitFor(() => expect(selectAppIcon).toHaveBeenCalledWith(icon.key, 3));
  expect(await screen.findByText(/Compatible installed builds/)).toBeTruthy();
});
it("uploads a prepared image and does not activate it automatically", async () => {
  const blob = new Blob(["prepared"], { type: "image/png" });
  vi.mocked(normalizeIcon).mockResolvedValue(blob);
  const uploadAppIcon = vi.fn(async () => ({ key: icon.key })),
    selectAppIcon = vi.fn();
  renderAdmin(
    <AppIconsPage />,
    repository({
      appIcons: vi.fn(async () => ({
        revision: 0,
        activeKey: "default",
        icons: [icon],
      })),
      uploadAppIcon,
      selectAppIcon,
    }),
  );
  fireEvent.change(screen.getByLabelText("Icon name"), {
    target: { value: "Ramadan" },
  });
  fireEvent.change(screen.getByLabelText("Icon image"), {
    target: {
      files: [new File(["source"], "icon.png", { type: "image/png" })],
    },
  });
  await screen.findByAltText("Prepared icon preview");
  fireEvent.click(screen.getByRole("button", { name: "Upload icon" }));
  await waitFor(() =>
    expect(uploadAppIcon).toHaveBeenCalledWith("Ramadan", blob),
  );
  expect(selectAppIcon).not.toHaveBeenCalled();
});
