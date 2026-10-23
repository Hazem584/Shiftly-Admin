import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LocaleProvider, useLocale } from "./LocaleProvider";
import { LanguageSwitch } from "./LanguageSwitch";
import { ar, en } from "./messages";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
function Example() {
  const { t, number } = useLocale();
  return (
    <>
      <LanguageSwitch />
      <h1>{t("users")}</h1>
      <p>{number(1234)}</p>
    </>
  );
}
it("translates labels, changes document direction and persists the choice", () => {
  render(
    <LocaleProvider>
      <Example />
    </LocaleProvider>,
  );
  expect(document.documentElement.dir).toBe("rtl");
  fireEvent.click(screen.getByRole("button", { name: "English" }));
  expect(screen.getByRole("heading").textContent).toBe("Users");
  expect(document.documentElement.dir).toBe("ltr");
  expect(document.documentElement.lang).toBe("en");
  expect(localStorage.getItem("shiftly.admin.locale")).toBe("en");
  cleanup();
  render(
    <LocaleProvider>
      <Example />
    </LocaleProvider>,
  );
  expect(screen.getByRole("heading").textContent).toBe("Users");
  fireEvent.click(screen.getByRole("button", { name: "عربي" }));
  expect(document.documentElement.dir).toBe("rtl");
});
it("has a translation for every message in both languages", () => {
  expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
  expect(Object.values(ar).every((value) => value.trim())).toBe(true);
});
