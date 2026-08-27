import { expect, test } from "@playwright/test";

const report = {
  id: "report-delete",
  createdAt: "2026-08-25T10:00:00.000Z",
  shiftDate: "2026-08-25",
  shiftStart: "07:30",
  shiftEnd: "17:30",
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
  eftpos: "100",
  payable: -44.5,
  cashTaken: "0",
  accountBookings: "0",
};

test("deletes the local report and cloud backup without changing the ledger", async ({
  page,
}) => {
  let deletedReportId: string | null = null;
  let ledgerRequestCount = 0;

  await page.addInitScript((savedReport) => {
    localStorage.setItem(
      "shift-mate-reports",
      JSON.stringify([savedReport]),
    );
  }, report);

  await page.route(
    "**/api/finance/backup",
    async (route) => {
      if (route.request().method() === "DELETE") {
        deletedReportId =
          route.request().postDataJSON().reportId;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
          }),
        });

        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          reports: [report],
        }),
      });
    },
  );

  await page.route(
    "**/api/finance/export/google-sheets",
    async (route) => {
      ledgerRequestCount += 1;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
        }),
      });
    },
  );

  await page.goto("/reports");

  await page.getByText("Tuesday").click();

  await page
    .getByRole("button", { name: "Delete Report" })
    .click();

  await expect(
    page.getByText("Delete this report?"),
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: "Delete Report Only",
    })
    .click();

  await expect
    .poll(async () =>
      page.evaluate(() =>
        JSON.parse(
          localStorage.getItem("shift-mate-reports") ??
            "[]",
        ),
      ),
    )
    .toHaveLength(0);

  expect(deletedReportId).toBe("report-delete");
  expect(ledgerRequestCount).toBe(0);
});

test("deletes one report and rewrites the ledger from the remaining report", async ({
  page,
}) => {
  const remainingReport = {
    ...report,
    id: "report-remaining",
    createdAt: "2026-08-25T18:00:00.000Z",
    shiftStart: "18:00",
    shiftEnd: "22:00",
    meterTotal: "80",
    shiftTotal: 80,
    ownerHalf: 40,
    ownerAmount: 45.5,
    eftpos: "80",
    payable: -34.5,
  };

  let deletedReportId: string | null = null;
  let ledgerMethod: string | null = null;
  let ledgerRequestBody:
    | Record<string, unknown>
    | null = null;

  await page.addInitScript(
    (savedReports) => {
      localStorage.setItem(
        "shift-mate-reports",
        JSON.stringify(savedReports),
      );
    },
    [report, remainingReport],
  );

  await page.route(
    "**/api/finance/backup",
    async (route) => {
      if (route.request().method() === "DELETE") {
        deletedReportId =
          route.request().postDataJSON().reportId;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
          }),
        });

        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          reports: [report, remainingReport],
        }),
      });
    },
  );

  await page.route(
    "**/api/finance/export/google-sheets",
    async (route) => {
      ledgerMethod = route.request().method();
      ledgerRequestBody =
        route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
        }),
      });
    },
  );

  await page.goto("/reports");

  await page.getByText("Tuesday").click();

  await page
    .getByRole("button", { name: "Delete Report" })
    .first()
    .click();

  await page
    .getByRole("button", {
      name: "Delete and Update Ledger",
    })
    .click();

  await expect
    .poll(async () =>
      page.evaluate(() =>
        JSON.parse(
          localStorage.getItem("shift-mate-reports") ??
            "[]",
        ),
      ),
    )
    .toHaveLength(1);

  expect(deletedReportId).toBe("report-delete");
  expect(ledgerMethod).toBe("POST");
  expect(ledgerRequestBody).toEqual({
    reports: [
      expect.objectContaining({
        id: "report-remaining",
      }),
    ],
  });
});

test("deletes the last report for a date and clears the ledger row", async ({
  page,
}) => {
  let deletedReportId: string | null = null;
  let ledgerMethod: string | null = null;
  let ledgerRequestBody:
    | Record<string, unknown>
    | null = null;

  await page.addInitScript((savedReport) => {
    localStorage.setItem(
      "shift-mate-reports",
      JSON.stringify([savedReport]),
    );
  }, report);

  await page.route(
    "**/api/finance/backup",
    async (route) => {
      if (route.request().method() === "DELETE") {
        deletedReportId =
          route.request().postDataJSON().reportId;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
          }),
        });

        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          reports: [report],
        }),
      });
    },
  );

  await page.route(
    "**/api/finance/export/google-sheets",
    async (route) => {
      ledgerMethod = route.request().method();
      ledgerRequestBody =
        route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
        }),
      });
    },
  );

  await page.goto("/reports");

  await page.getByText("Tuesday").click();

  await page
    .getByRole("button", { name: "Delete Report" })
    .click();

  await page
    .getByRole("button", {
      name: "Delete and Update Ledger",
    })
    .click();

  await expect
    .poll(async () =>
      page.evaluate(() =>
        JSON.parse(
          localStorage.getItem("shift-mate-reports") ??
            "[]",
        ),
      ),
    )
    .toHaveLength(0);

  expect(deletedReportId).toBe("report-delete");
  expect(ledgerMethod).toBe("DELETE");
  expect(ledgerRequestBody).toEqual({
    shiftDate: "2026-08-25",
  });
});