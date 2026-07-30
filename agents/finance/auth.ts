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