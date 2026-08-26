import { expect, test } from "@playwright/test";

test("saves a report locally and backs it up to the cloud", async ({
  page,
}) => {
  let backupRequestBody: Record<string, unknown> | null = null;

  await page.route(
    "**/api/finance/backup",
    async (route) => {
      backupRequestBody =
        route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Shift Mate report backed up.",
        }),
      });
    },
  );

  await page.goto("/calculator");

  await page
    .getByRole("button", { name: "Save Report" })
    .click();

  await expect(
    page.getByText("Report saved and backed up"),
  ).toBeVisible();

  expect(backupRequestBody).not.toBeNull();

  const storedReports = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem("shift-mate-reports") ?? "[]",
    ),
  );

  expect(storedReports).toHaveLength(1);

  expect(storedReports[0]).toEqual(
    expect.objectContaining({
        backedUpToGoogleSheets: true,
    }),
    );

  expect(storedReports[0].backupError).toBeUndefined();

  expect(storedReports[0].backedUpAt).toEqual(
    expect.any(String),
  );
});