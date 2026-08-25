import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { SiteSettingsModel } from "@/models/SiteSettings";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ settings: null });
  }

  const settings = await SiteSettingsModel.findOne({ key: "site" }).lean();
  return NextResponse.json({ settings });
}

const bodySchema = z.object({
  contactEmail: z.string().email().or(z.literal("")),
  whatsappNumber: z.string().max(20),
  phoneNumber: z.string().max(20),
  officeAddress: z.string().max(300),
  mockTestTiers: z
    .array(z.object({ months: z.number().positive(), price: z.number().nonnegative(), mrp: z.number().nonnegative() }))
    .optional(),
});

export async function PATCH(req: NextRequest) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const settings = await SiteSettingsModel.findOneAndUpdate(
    { key: "site" },
    { $set: parsed },
    { new: true, upsert: true }
  );

  return NextResponse.json({ settings });
}
