import "server-only";
import { UserModel } from "@/models/User";
import type { SessionPayload } from "./jwt";

/**
 * Admin/faculty always have access. Students need an unexpired entry in
 * `courseAccess`. Purchases made before duration-based access existed only
 * have a `purchasedCourses` membership with no matching `courseAccess` entry —
 * those are grandfathered in as lifetime access rather than treated as expired.
 */
export async function hasPurchased(session: SessionPayload | null, courseId: string): Promise<boolean> {
  if (!session) return false;
  if (session.role === "admin" || session.role === "faculty") return true;

  const user = await UserModel.findById(session.uid).select("purchasedCourses courseAccess").lean();
  if (!user) return false;

  const owned = user.purchasedCourses?.some((id) => id.toString() === courseId);
  if (!owned) return false;

  const access = user.courseAccess?.find((a) => a.course.toString() === courseId);
  if (!access) return true; // pre-existing purchase from before expiry tracking — lifetime grandfather

  return access.expiresAt > new Date();
}
