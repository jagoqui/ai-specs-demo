import { expect, test } from "@playwright/test";

test("la página principal carga correctamente", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ai-specs-demo/);
});
