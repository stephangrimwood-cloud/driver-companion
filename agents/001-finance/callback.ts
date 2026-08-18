import http from "node:http";

export function waitForAuthorisationCode(): Promise<string> {
  return new Promise((resolve) => {
    const server = http.createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://localhost");

      const code = url.searchParams.get("code");

      if (!code) {
        response.writeHead(400);
        response.end("Missing authorisation code.");
        return;
      }

      response.writeHead(200, {
        "Content-Type": "text/html",
      });

      response.end(`
        <h2>Shift Mate</h2>
        <p>Authentication successful.</p>
        <p>You may now close this window.</p>
      `);

      server.close();

      resolve(code);
    });

    server.listen(3005);
  });
}