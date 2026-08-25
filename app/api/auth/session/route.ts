import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { signSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/jwt";

const bodySchema = z.object({
  idToken: z.string().min(10),
  referralCode: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await verifyFirebaseIdToken(parsed.idToken);
  } catch (err) {
    console.error("Firebase token verification failed:", err);
    return NextResponse.json({ error: "Invalid or expired Firebase token" }, { status: 401 });
  }

  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    return NextResponse.json(
      { error: "Server is not connected to a database yet. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }

  const displayName = decoded.name || decoded.email?.split("@")[0] || "Prepp365 Student";

  const user = await UserModel.findOneAndUpdate(
    { firebaseUid: decoded.uid },
    {
      $setOnInsert: {
        firebaseUid: decoded.uid,
        role: "student",
        referralCode: `PREP-${decoded.uid.slice(0, 6).toUpperCase()}`,
        ...(parsed.referralCode ? { referredBy: parsed.referralCode } : {}),
      },
      $set: {
        name: displayName,
        email: decoded.email ?? undefined,
        phone: parsed.phone || decoded.phone_number || undefined,
        ...(parsed.address ? { address: parsed.address } : {}),
        photoURL: decoded.picture ?? undefined,
      },
    },
    { upsert: true, new: true }
  );

  const token = await signSessionToken({
    uid: user._id.toString(),
    firebaseUid: user.firebaseUid,
    role: user.role as "student" | "faculty" | "admin",
    name: user.name,
    email: user.email ?? undefined,
  });

  const res = NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      photoURL: user.photoURL,
    },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
