import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LEN = 64;
const PREFIX = "scrypt";

/**
 * Password hashing with node:crypto — no dependency, and scrypt is memory-hard
 * enough that a stolen table is not a wordlist away from every account.
 *
 * Stored as "scrypt$<saltHex>$<hashHex>" so the format can be recognised (and
 * migrated) later without guessing.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEY_LEN);
  return `${PREFIX}$${salt.toString("hex")}$${key.toString("hex")}`;
}

/** Constant-time check. Returns false for anything malformed rather than throwing. */
export async function verifyPassword(
  password: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== PREFIX || !saltHex || !hashHex) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * The rules the admin panel enforces. Deliberately about length rather than
 * character classes — length is what actually helps, and complexity rules push
 * people towards "Password1!" and a sticky note.
 */
export const MIN_PASSWORD = 8;

export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD) {
    return `A palavra-passe precisa de pelo menos ${MIN_PASSWORD} caracteres.`;
  }
  if (password.length > 200) return "Palavra-passe demasiado longa.";
  return null;
}
