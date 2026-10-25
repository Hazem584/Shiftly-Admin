import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderAdmin, repository } from "../../../test/renderAdmin";
import { RequestsPage } from "./RequestsPage";
import { SessionsPage } from "./SessionsPage";
import { ReleasesPage } from "./ReleasesPage";
import type { AppRelease } from "../domain/models";
beforeEach(() => localStorage.setItem("shiftly.admin.locale", "en"));
afterEach(cleanup);
describe("monitoring workflows", () => {
  it("reloads metrics for the selected period and errors filter", async () => {
    const requests = vi.fn(async () => ({
      summary: { total: 3, errors: 1, averageMs: 20, p95Ms: 40 },
      series: [],
      endpoints: [],
      items: [],
      hasNext: false,
    }));
    renderAdmin(<RequestsPage refresh={0} />, repository({ requests }));
    await screen.findByRole("columnheader", { name: "Total requests" });
    fireEvent.click(screen.getByRole("button", { name: "Last 7 days" }));
    await waitFor(() =>
      expect(requests).toHaveBeenLastCalledWith(
        expect.objectContaining({ period: "week", page: 1 }),
        expect.any(AbortSignal),
      ),
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "errors" },
    });
    await waitFor(() =>
      expect(requests).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "errors", period: "week" }),
        expect.any(AbortSignal),
      ),
    );
  });
  it("opens a user’s session diagnostics without mixing other users", async () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    const sessions = vi.fn(async () => ({
      items: [
        {
          id: "session",
          userId,
          fullName: "Test Person",
          email: null,
          platform: "android",
          version: "1.0.0",
          build: 1,
          state: "resumed",
          online: true,
          lastSeenAt: "2026-10-24T10:00:00Z",
          startedAt: "",
          errorCount: 2,
        },
      ],
      hasNext: false,
    }));
    const errors = vi.fn(async () => ({ items: [], hasNext: false }));
    renderAdmin(<SessionsPage refresh={0} />, repository({ sessions, errors }));
    await screen.findByText("Online now");
    fireEvent.click(screen.getByRole("button", { name: "View user logs" }));
    await waitFor(() =>
      expect(errors).toHaveBeenLastCalledWith(
        { page: 1, userId },
        expect.any(AbortSignal),
      ),
    );
    expect(sessions).toHaveBeenLastCalledWith(
      { page: 1, userId },
      expect.any(AbortSignal),
    );
  });
  it("saves the message and update policy with the revision for conflict detection", async () => {
    const release: AppRelease = {
      platform: "android",
      version: "1.1.0",
      build: 2,
      message: "Fixes",
      url: "https://appdistribution.firebase.google.com/testerapps/app/releases/2",
      required: false,
      enabled: true,
      revision: 3,
    };
    const saveRelease = vi.fn(async (value: AppRelease) => ({
      ...value,
      revision: value.revision + 1,
    }));
    renderAdmin(
      <ReleasesPage />,
      repository({ releases: vi.fn(async () => [release]), saveRelease }),
    );
    const messages = await screen.findAllByLabelText("Update message");
    const releaseInput = screen.getAllByLabelText(
      "Firebase tester release link",
    )[0] as HTMLInputElement;
    expect(
      new RegExp(`^(?:${releaseInput.pattern})$`, "v").test(release.url),
    ).toBe(true);
    fireEvent.change(messages[0], { target: { value: "Please update" } });
    fireEvent.click(
      screen.getAllByLabelText("Require update before continuing")[0],
    );
    fireEvent.click(
      screen.getAllByLabelText(
        /I downloaded and installed this exact build/,
      )[0],
    );
    fireEvent.change(screen.getAllByLabelText("Build number")[0], {
      target: { value: "3" },
    });
    expect(
      (
        screen.getAllByLabelText(
          /I downloaded and installed this exact build/,
        )[0] as HTMLInputElement
      ).checked,
    ).toBe(false);
    fireEvent.change(screen.getAllByLabelText("Build number")[0], {
      target: { value: "2" },
    });
    fireEvent.click(
      screen.getAllByLabelText(
        /I downloaded and installed this exact build/,
      )[0],
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Save release" })[0]);
    await waitFor(() =>
      expect(saveRelease).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Please update",
          required: true,
          testerVerified: true,
          revision: 3,
          build: 2,
        }),
      ),
    );
    expect((await screen.findByRole("status")).textContent).toContain(
      "Release saved.",
    );
  });
});
