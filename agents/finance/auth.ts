import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

import type { GoogleSheetsConfig } from "./types";

const localCredentialsPath = path.join(
  process.cwd(),
  "secrets",
  "gmail-oauth-client.json",
);

const localRefreshTokenPath = path.join(
  process.cwd(),
  "secrets",
  "gmail-refresh-token.json",
);

const localSheetsConfigPath = path.join(
  process.cwd(),
  "secrets",
  "google-sheets.json",
);

const localRedirectUri = "http://localhost:3005";

type GoogleOAuthCredentials = {
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
  web?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
};

function readEnvironmentValue(
  variableName: string,
): string | undefined {
  const value = process.env[variableName]?.trim();

  return value ? value : undefined;
}

export function loadGoogleCredentials(): GoogleOAuthCredentials {
  const clientId = readEnvironmentValue(
    "GOOGLE_OAUTH_CLIENT_ID",
  );

  const clientSecret = readEnvironmentValue(
    "GOOGLE_OAUTH_CLIENT_SECRET",
  );

  const redirectUri =
    readEnvironmentValue("GOOGLE_OAUTH_REDIRECT_URI") ??
    localRedirectUri;

  if (clientId || clientSecret) {
    if (!clientId || !clientSecret) {
      throw new Error(
        "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must both be configured.",
      );
    }

    return {
      web: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [redirectUri],
      },
    };
  }

  const credentialsFile = fs.readFileSync(
    localCredentialsPath,
    "utf8",
  );

  const credentials = JSON.parse(
    credentialsFile,
  ) as GoogleOAuthCredentials;

  if (!credentials.installed && !credentials.web) {
    throw new Error(
      "Invalid Google OAuth credentials file.",
    );
  }

  return credentials;
}

export function createGoogleOAuthClient() {
  const credentials = loadGoogleCredentials();
  const client = credentials.installed ?? credentials.web;

  if (!client) {
    throw new Error(
      "Google OAuth client configuration was not found.",
    );
  }

  const redirectUri =
    readEnvironmentValue("GOOGLE_OAUTH_REDIRECT_URI") ??
    localRedirectUri;

  return new google.auth.OAuth2(
    client.client_id,
    client.client_secret,
    redirectUri,
  );
}

export function generateGoogleAuthorisationUrl(): string {
  const client = createGoogleOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
    prompt: "consent",
  });
}

export async function exchangeAuthorisationCode(
  code: string,
) {
  const client = createGoogleOAuthClient();

  const { tokens } = await client.getToken(code);

  return tokens;
}

export function saveGoogleRefreshToken(
  refreshToken: string,
): void {
  fs.writeFileSync(
    localRefreshTokenPath,
    JSON.stringify(
      {
        refresh_token: refreshToken,
      },
      null,
      2,
    ),
    "utf8",
  );
}

export function loadGoogleRefreshToken(): string {
  const environmentRefreshToken = readEnvironmentValue(
    "GOOGLE_OAUTH_REFRESH_TOKEN",
  );

  if (environmentRefreshToken) {
    return environmentRefreshToken;
  }

  const refreshTokenFile = fs.readFileSync(
    localRefreshTokenPath,
    "utf8",
  );

  const { refresh_token } = JSON.parse(
    refreshTokenFile,
  ) as {
    refresh_token: string;
  };

  if (!refresh_token) {
    throw new Error("Refresh token was not found.");
  }

  return refresh_token;
}

export function createAuthenticatedGoogleOAuthClient() {
  const client = createGoogleOAuthClient();

  client.setCredentials({
    refresh_token: loadGoogleRefreshToken(),
  });

  return client;
}

export function loadGoogleSheetsConfig(): GoogleSheetsConfig {
  const spreadsheetId = readEnvironmentValue(
    "GOOGLE_SHEETS_SPREADSHEET_ID",
  );

  const templateSheet = readEnvironmentValue(
    "GOOGLE_SHEETS_TEMPLATE_SHEET",
  );

  if (spreadsheetId || templateSheet) {
    if (!spreadsheetId || !templateSheet) {
      throw new Error(
        "GOOGLE_SHEETS_SPREADSHEET_ID and GOOGLE_SHEETS_TEMPLATE_SHEET must both be configured.",
      );
    }

    return {
      spreadsheet_id: spreadsheetId,
      template_sheet: templateSheet,
    };
  }

  const spreadsheetConfigFile = fs.readFileSync(
    localSheetsConfigPath,
    "utf8",
  );

  const config = JSON.parse(
    spreadsheetConfigFile,
  ) as GoogleSheetsConfig;

  if (!config.spreadsheet_id) {
    throw new Error(
      "Google Spreadsheet ID was not found.",
    );
  }

  if (!config.template_sheet) {
    throw new Error(
      "Google template sheet name was not found.",
    );
  }

  return config;
}

export function loadGoogleSpreadsheetId(): string {
  return loadGoogleSheetsConfig().spreadsheet_id;
}

export function loadGoogleTemplateSheet(): string {
  return loadGoogleSheetsConfig().template_sheet;
}

export function createGoogleSheetsClient() {
  return google.sheets({
    version: "v4",
    auth: createAuthenticatedGoogleOAuthClient(),
  });
}