import { describe, expect, it } from "vitest";
import {
  createGoogleOAuthClient,
  generateGoogleAuthorisationUrl,
  loadGoogleCredentials,
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
});