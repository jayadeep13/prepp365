import { CourseModel } from "@/models/Course";
import { CouponModel } from "@/models/Coupon";
import { UserModel } from "@/models/User";
import type { Order } from "@/models/Order";
import { addMonths } from "@/lib/pricing";

/** Grants course/mocktest access for a paid order. Shared by every payment gateway. */
export async function grantOrderAccess(order: Order & { _id: unknown; user: unknown; course?: unknown }) {
  const userId = order.user;
  const months = order.months ?? 1;

  if (order.productType === "mocktest") {
    const user = await UserModel.findById(userId).select("mockTestAccess").lean();
    const base =
      user?.mockTestAccess?.expiresAt && user.mockTestAccess.expiresAt > new Date()
        ? user.mockTestAccess.expiresAt
        : new Date();
    await UserModel.findByIdAndUpdate(userId, { $set: { mockTestAccess: { expiresAt: addMonths(base, months) } } });
  } else if (order.course) {
    const courseId = order.course;
    const user = await UserModel.findById(userId).select("courseAccess purchasedCourses").lean();
    const existing = user?.courseAccess?.find((a) => a.course.toString() === courseId!.toString());
    const base = existing?.expiresAt && existing.expiresAt > new Date() ? existing.expiresAt : new Date();
    const expiresAt = addMonths(base, months);
    const alreadyOwned = user?.purchasedCourses?.some((id) => id.toString() === courseId!.toString());

    if (existing) {
      await UserModel.updateOne(
        { _id: userId, "courseAccess.course": courseId },
        { $set: { "courseAccess.$.expiresAt": expiresAt } }
      );
    } else {
      await UserModel.findByIdAndUpdate(userId, { $push: { courseAccess: { course: courseId, expiresAt } } });
    }
    await UserModel.findByIdAndUpdate(userId, { $addToSet: { purchasedCourses: courseId } });
    if (!alreadyOwned) {
      await CourseModel.findByIdAndUpdate(courseId, { $inc: { students: 1 } });
    }
  }

  if (order.couponCode) {
    await CouponModel.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }
}
