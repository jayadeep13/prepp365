import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "./jwt";

/** Reads and verifies the session cookie. Returns null if absent or invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/** Throws-free role check: use in server components/route handlers. */
export async function requireRole(
  roles: SessionPayload["role"][]
): Promise<{ session: SessionPayload } | { error: string; status: number }> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated", status: 401 };
  if (!roles.includes(session.role)) return { error: "Forbidden", status: 403 };
  return { session };
}
