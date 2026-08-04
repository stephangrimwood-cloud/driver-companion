import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

import type { GoogleSheetsConfig } from "./types";

const credentialsPath = path.join(
  process.cwd(),
  "secrets",
  "gmail-oauth-client.json",
);

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

export function loadGoogleCredentials(): GoogleOAuthCredentials {
  const credentialsFile = fs.readFileSync(credentialsPath, "utf8");

  const credentials = JSON.parse(
    credentialsFile,
  ) as GoogleOAuthCredentials;

  if (!credentials.installed && !credentials.web) {
    throw new Error("Invalid Google OAuth credentials file.");
  }

  return credentials;
}

export function createGoogleOAuthClient() {
  const credentials = loadGoogleCredentials();
  const client = credentials.installed ?? credentials.web;

  if (!client) {
    throw new Error("Google OAuth client configuration was not found.");
  }

  return new google.auth.OAuth2(
    client.client_id,
    client.client_secret,
    "http://localhost:3005",
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

export async function exchangeAuthorisationCode(code: string) {
  const client = createGoogleOAuthClient();

  const { tokens } = await client.getToken(code);

  return tokens;
}

export function saveGoogleRefreshToken(refreshToken: string): void {
  const refreshTokenPath = path.join(
    process.cwd(),
    "secrets",
    "gmail-refresh-token.json",
  );

  fs.writeFileSync(
    refreshTokenPath,
    JSON.stringify({ refresh_token: refreshToken }, null, 2),
    "utf8",
  );
}

export function loadGoogleRefreshToken(): string {
  const refreshTokenPath = path.join(
    process.cwd(),
    "secrets",
    "gmail-refresh-token.json",
  );

  const refreshTokenFile = fs.readFileSync(refreshTokenPath, "utf8");

  const { refresh_token } = JSON.parse(refreshTokenFile) as {
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
  const spreadsheetConfigPath = path.join(
    process.cwd(),
    "secrets",
    "google-sheets.json",
  );

  const spreadsheetConfigFile = fs.readFileSync(
    spreadsheetConfigPath,
    "utf8",
  );

  const config = JSON.parse(
    spreadsheetConfigFile,
  ) as GoogleSheetsConfig;

  if (!config.spreadsheet_id) {
    throw new Error("Google Spreadsheet ID was not found.");
  }

  if (!config.template_sheet) {
    throw new Error("Google template sheet name was not found.");
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