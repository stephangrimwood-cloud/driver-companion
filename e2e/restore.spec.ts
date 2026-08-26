import { expect, test } from "@playwright/test";

test("restores a cloud report missing from the device", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "shift-mate-reports",
      JSON.stringify([
        {
          id: "report-local",
          createdAt: "2026-08-25T10:00:00.000Z",
          shiftDate: "2026-08-25",
          meterTotal: "100",
          areaCharge: "0",
          quotes: "0",
          emes: "0",
          shiftTotal: 100,
          ownerHalf: 50,
          levy: "5.50",
          ownerAmount: 55.5,
          dockets: "0",
          fuel: "0",
          eftpos: "0",
          payable: 55.5,
        },
      ]),
    );
  });

  await page.route(
    "**/api/finance/backup",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          reports: [
            {
              id: "report-local",
              createdAt: "2026-08-25T10:00:00.000Z",
              shiftDate: "2026-08-25",
              meterTotal: "100",
              areaCharge: "0",
              quotes: "0",
              emes: "0",
              shiftTotal: 100,
              ownerHalf: 50,
              levy: "5.50",
              ownerAmount: 55.5,
              dockets: "0",
              fuel: "0",
              eftpos: "0",
              payable: 55.5,
            },
            {
              id: "report-cloud",
              createdAt: "2026-08-26T10:00:00.000Z",
              shiftDate: "2026-08-26",
              meterTotal: "120",
              areaCharge: "4",
              quotes: "0",
              emes: "0",
              shiftTotal: 116,
              ownerHalf: 58,
              levy: "5.50",
              ownerAmount: 63.5,
              dockets: "0",
              fuel: "0",
              eftpos: "0",
              payable: 63.5,
            },
          ],
        }),
      });
    },
  );

  await page.goto("/reports");

  await expect(
    page.getByText("1 report available for restoration."),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Restore 1 Report" })
    .click();

  await expect(
    page.getByText("✓ 1 report restored successfully."),
  ).toBeVisible();

  const storedReports = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem("shift-mate-reports") ?? "[]",
    ),
  );

  expect(storedReports).toHaveLength(2);
  expect(
    storedReports.map((report: { id: string }) => report.id),
  ).toContain("report-cloud");
});