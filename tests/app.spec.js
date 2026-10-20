import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("add a stop, update budget, and restore the trip after reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("What's the plan?").fill("Browse the record store");
  await page.getByLabel("Where?", { exact: true }).fill("Chiado");
  await page.getByLabel("Cost (€)", { exact: true }).fill("12.50");
  await page.getByRole("button", { name: "Add to day 1" }).click();
  await expect(
    page.getByRole("heading", { name: "Browse the record store" }),
  ).toBeVisible();
  await expect(page.locator(".budget-number")).toHaveText("€58.50");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Browse the record store" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Browse the record store" })
    .click();
  await expect(page.locator(".budget-number")).toHaveText("€46.00");
});

test("add a day, rename it, and export a backup", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add a day" }).click();
  await page.getByLabel("Day title").fill("A day at the beach");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save backup" }).click();
  expect((await download).suggestedFilename()).toBe("wayfarer-trip.json");
  await page.reload();
  await page.getByRole("button", { name: /04 Day 4/ }).click();
  await expect(page.getByLabel("Day title")).toHaveValue("A day at the beach");
});

test("invalid import keeps the current trip", async ({ page }) => {
  await page.goto("/");
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":1}'),
    });
  await expect(page.getByRole("status")).toContainText("not a valid");
  await expect(
    page.getByRole("heading", { name: /long weekend/ }),
  ).toBeVisible();
});

test("layout fits and controls have accessible names and contrast", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) => animation.effect.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished),
    );
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    })),
  ).toEqual([]);
});
