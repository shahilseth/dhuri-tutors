/**
 * Admin session handling (rules.md §4, tech_spec.md §4). Single shared
 * password; no per-user accounts. Every admin page and server action must
 * call requireAdmin() before doing anything.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const COOKIE_MESSAGE = "dhuri-admin-session-v1";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;
const FAILED_LOGIN_DELAY_MS = 500;

function adminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD must be set");
  return password;
}

/** HMAC-SHA256(key = password, message = COOKIE_MESSAGE), hex. Changing the password invalidates every cookie. */
function sessionValue(password: string): string {
  return createHmac("sha256", password).update(COOKIE_MESSAGE).digest("hex");
}

/** True if the current request's cookie matches a session for today's ADMIN_PASSWORD. */
export async function isAdmin(): Promise<boolean> {
  const cookie = (await cookies()).get(COOKIE_NAME)?.value;
  if (!cookie) return false;

  const expected = Buffer.from(sessionValue(adminPassword()), "hex");
  const actual = Buffer.from(cookie, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Call first in every admin page and server action. Redirects to login when not signed in. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/**
 * Checks the password and sets the session cookie on success. On failure,
 * waits 500ms before returning — a cheap brute-force slowdown (tech_spec.md §4).
 */
export async function logIn(password: string): Promise<boolean> {
  const expected = adminPassword();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && timingSafeEqual(a, b);

  if (!ok) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return false;
  }

  (await cookies()).set(COOKIE_NAME, sessionValue(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS_SECONDS,
    path: "/",
  });
  return true;
}

export async function logOut(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
