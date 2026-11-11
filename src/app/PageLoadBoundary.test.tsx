import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PageLoadBoundary } from "./PageLoadBoundary";

afterEach(() => vi.restoreAllMocks());

it("keeps a failed page load inside its recovery view", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  function UnavailablePage(): never {
    throw new Error("Page chunk unavailable");
  }
  render(
    <PageLoadBoundary fallback={<p role="alert">Reload this page</p>}>
      <UnavailablePage />
    </PageLoadBoundary>,
  );
  expect(screen.getByRole("alert").textContent).toBe("Reload this page");
});
