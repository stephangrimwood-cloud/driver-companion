import { describe, expect, it } from "vitest";
import {
  createAuthenticatedGoogleOAuthClient,
  createGoogleOAuthClient,
  generateGoogleAuthorisationUrl,
  loadGoogleCredentials,
  loadGoogleRefreshToken,
} from "./auth";

describe("Authentication", () => {
  it("loads the Google OAuth credentials file", () => {
    const credentials = loadGoogleCredentials();

    expect(credentials).toBeDefined();
    expect(credentials.installed || credentials.web).toBeDefined();
  });

  it("creates a Google OAuth client", () => {
    const client = createGoogleOAuthClient();

    expect(client).toBeDefined();
  });

  it("generates a Google authorisation URL", () => {
    const url = generateGoogleAuthorisationUrl();

    expect(url).toContain("accounts.google.com");
    expect(url).toContain("scope=");
  });

    it("loads the saved Google refresh token", () => {
    const refreshToken = loadGoogleRefreshToken();

    expect(refreshToken).toBeDefined();
    expect(refreshToken.length).toBeGreaterThan(0);
  });

  it("creates an authenticated Google OAuth client", () => {
    const client = createAuthenticatedGoogleOAuthClient();

    expect(client).toBeDefined();
    expect(client.credentials.refresh_token).toBeDefined();
  });
  
});