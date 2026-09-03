import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const ALPHA_SESSION_COOKIE = "le5_alpha_session";

const SECRET = process.env.LE5_SESSION_SECRET || "legal-english-5-alpha-review-secret";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  return prev.length === next.length && timingSafeEqual(prev, next);
}

export function signSession(userId: string) {
  const payload = `${userId}.${Date.now()}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function readSession(token: string | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, issued, sig] = parts;
  const expected = createHmac("sha256", SECRET).update(`${userId}.${issued}`).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}

export function oneTimeCode() {
  return String(100000 + Math.floor(Math.random() * 900000));
}
