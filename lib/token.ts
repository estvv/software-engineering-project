// Check-in tokens are stored hashed (Week 14, security review): someone who
// reads the database or a backup cannot use a stored value to free a table.
// A UUID has 122 random bits, so a plain SHA-256 (no salt, no slow hash) is enough.

import { createHash } from "node:crypto";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
