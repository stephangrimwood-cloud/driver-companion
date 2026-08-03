import {
  exchangeAuthorisationCode,
  generateGoogleAuthorisationUrl,
  saveGoogleRefreshToken,
} from "./auth";

import { waitForAuthorisationCode } from "./callback";

async function main() {
  const authorisationUrl = generateGoogleAuthorisationUrl();

  console.log("\nOpen this URL in your browser:\n");
  console.log(authorisationUrl);
  console.log("\nWaiting for Google to return the authorisation code...\n");

  const code = await waitForAuthorisationCode();

  const tokens = await exchangeAuthorisationCode(code);

  if (!tokens.refresh_token) {
  throw new Error("Google did not return a refresh token.");
}

saveGoogleRefreshToken(tokens.refresh_token);

  console.log("\nRefresh token saved successfully.\n");

}

main().catch((error) => {
  console.error("\nAuthorisation failed:\n");
  console.error(error);
  process.exit(1);
});