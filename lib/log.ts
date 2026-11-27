// Structured logs (Week 13, observability): one JSON object per line on
// stdout/stderr, read with `docker compose logs app`.
// Privacy: never log a token, and nothing that identifies a student (no IP).

type Fields = Record<string, string | number | boolean | undefined>;

export function logEvent(event: string, fields: Fields = {}): void {
  console.log(JSON.stringify({ time: new Date().toISOString(), level: "info", event, ...fields }));
}

export function logError(event: string, error: unknown, fields: Fields = {}): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ time: new Date().toISOString(), level: "error", event, error: message, ...fields }));
}
