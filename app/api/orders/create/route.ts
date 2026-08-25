import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { OrderModel } from "@/models/Order";
import { CouponModel } from "@/models/Coupon";
import { UserModel } from "@/models/User";
import { SiteSettingsModel } from "@/models/SiteSettings";
import { getSession } from "@/lib/auth/session";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay";
import { resolveTier } from "@/lib/pricing";

const bodySchema = z.object({
  productType: z.enum(["course", "mocktest"]).default("course"),
  courseSlug: z.string().optional(),
  months: z.number().int().positive(),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json(
      { error: "Database not connected yet. Set MONGODB_URI in .env.local, then run `npm run seed`." },
      { status: 503 }
    );
  }

  const buyer = await UserModel.findById(session.uid).select("phone address").lean();
  if (!buyer?.phone || !buyer?.address) {
    return NextResponse.json(
      { error: "Add your phone number and address before purchasing.", code: "PROFILE_INCOMPLETE" },
      { status: 400 }
    );
  }

  let amount: number;
  let title: string;
  let courseId: string | undefined;

  if (parsed.productType === "course") {
    if (!parsed.courseSlug) return NextResponse.json({ error: "courseSlug is required" }, { status: 400 });

    const course = await CourseModel.findOne({ slug: parsed.courseSlug, isPublished: true });
    if (!course) {
      return NextResponse.json(
        { error: "Course not found in the database yet. Run `npm run seed` to load the sample courses." },
        { status: 404 }
      );
    }

    const tier = resolveTier(course.pricingTiers, parsed.months, course.price, course.mrp);
    if (!tier) return NextResponse.json({ error: "That plan isn't available for this course." }, { status: 400 });

    amount = tier.price;
    title = course.title;
    courseId = course._id.toString();
    parsed.months = tier.months;
  } else {
    const settings = await SiteSettingsModel.findOne({ key: "site" }).lean();
    const tier = resolveTier(settings?.mockTestTiers, parsed.months, 0, 0);
    if (!tier || tier.price <= 0) {
      return NextResponse.json({ error: "Mock test pricing isn't configured yet." }, { status: 400 });
    }

    amount = tier.price;
    title = "Mock test access";
    parsed.months = tier.months;
  }

  let couponCode: string | undefined;
  if (parsed.couponCode) {
    const coupon = await CouponModel.findOne({ code: parsed.couponCode.toUpperCase(), isActive: true });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      const discount =
        coupon.discountType === "percent"
          ? Math.round((amount * coupon.value) / 100)
          : Math.min(coupon.value, amount);
      amount = Math.max(amount - discount, 1);
      couponCode = coupon.code;
    }
  }

  const order = await OrderModel.create({
    user: session.uid,
    productType: parsed.productType,
    course: courseId,
    months: parsed.months,
    amount,
    couponCode,
    status: "created",
  });

  try {
    const rpOrder = await createRazorpayOrder(amount * 100, order._id.toString());
    order.razorpayOrderId = rpOrder.id;
    await order.save();

    return NextResponse.json({
      orderId: order._id.toString(),
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: getRazorpayKeyId(),
      courseTitle: title,
      userName: session.name,
      userEmail: session.email,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json(
      {
        error:
          "Payments aren't configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local.",
      },
      { status: 503 }
    );
  }
}
