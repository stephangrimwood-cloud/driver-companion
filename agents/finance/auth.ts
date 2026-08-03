import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

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
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
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
} // <-- This brace was missing

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