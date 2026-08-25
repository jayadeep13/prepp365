import "server-only";
import { UserModel } from "@/models/User";
import type { SessionPayload } from "./jwt";

/** Admin/faculty always have access; students need an unexpired mock-test pass. */
export async function hasMockTestAccess(session: SessionPayload | null): Promise<boolean> {
  if (!session) return false;
  if (session.role === "admin" || session.role === "faculty") return true;

  const user = await UserModel.findById(session.uid).select("mockTestAccess").lean();
  const expiresAt = user?.mockTestAccess?.expiresAt;
  return Boolean(expiresAt && expiresAt > new Date());
}
