import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const user = await UserModel.findById(session.uid).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      photoURL: user.photoURL,
      referralCode: user.referralCode,
    },
  });
}

const bodySchema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().optional(),
  address: z.string().max(300).optional(),
});

export async function PATCH(req: NextRequest) {
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
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  await UserModel.findByIdAndUpdate(session.uid, {
    $set: { name: parsed.name, phone: parsed.phone, address: parsed.address },
  });

  return NextResponse.json({ ok: true });
}
