import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  getMock,
  updateMock,
  appendMock,
} = vi.hoisted(() => ({
  getMock: vi.fn(),
  updateMock: vi.fn(),
  appendMock: vi.fn(),
}));

vi.mock("./auth", () => ({
  createGoogleSheetsClient: () => ({
    spreadsheets: {
      values: {
        get: getMock,
        update: updateMock,
        append: appendMock,
      },
    },
  }),

  loadGoogleSheetsConfig: () => ({
    spreadsheet_id: "test-spreadsheet",
    template_sheet: "Template",
  }),
}));

import { SheetsAgent } from "./sheets";

describe("SheetsAgent manual verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    "adds a note, verifies the row, and writes a MANUAL audit record",
    async () => {
      getMock
        .mockResolvedValueOnce({
          data: {
            values: [["Pending"]],
          },
        })
        .mockResolvedValueOnce({
          data: {
            values: [["CTL Export"]],
          },
        });

      updateMock.mockResolvedValue({
        data: {},
      });

      appendMock.mockResolvedValue({
        data: {},
      });

      const sheets = new SheetsAgent();

      await sheets.verifyLedgerRowManually(
        "August",
        19,
        "14/08",
        "Split shift manually reviewed",
      );

      expect(updateMock).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          range: "'August'!F19",
          requestBody: {
            values: [[
              "CTL Export | Split shift manually reviewed",
            ]],
          },
        }),
      );

      expect(updateMock).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          range: "'August'!G19",
          requestBody: {
            values: [["Verified"]],
          },
        }),
      );

      expect(appendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          range: "'Finance Agent Log'!A:D",
          requestBody: {
            values: [[
              "14/08",
              "MANUAL",
              expect.any(String),
              "Split shift manually reviewed",
            ]],
          },
        }),
      );
    },
  );

  it(
    "does nothing when the row is already Verified",
    async () => {
      getMock.mockResolvedValueOnce({
        data: {
          values: [["Verified"]],
        },
      });

      const sheets = new SheetsAgent();

      await sheets.verifyLedgerRowManually(
        "August",
        19,
        "14/08",
        "Split shift manually reviewed",
      );

      expect(updateMock).not.toHaveBeenCalled();
      expect(appendMock).not.toHaveBeenCalled();
    },
  );
});