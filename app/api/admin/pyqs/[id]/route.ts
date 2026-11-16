import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/db/connect";
import { PyqItemModel } from "@/models/PyqItem";
import { requireRole } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  // Only simple toggles/text edits are allowed here.
  const update: Record<string, unknown> = {};
  for (const key of ["isPublished", "isFree"] as const) {
    if (typeof body[key] === "boolean") update[key] = body[key];
  }
  for (const key of ["title", "examTag", "language", "description"] as const) {
    if (typeof body[key] === "string") update[key] = body[key];
  }
  if (body.year !== undefined) update.year = body.year === "" ? undefined : Number(body.year);

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  try {
    const item = await PyqItemModel.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { new: true }
    ).lean();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.kind === "paper" && item.isFree === false) {
      await PyqItemModel.updateOne({ _id: id }, { $set: { isFree: true } }); // papers are always free
    }
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });
  const { id } = await params;

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  let item;
  try {
    item = await PyqItemModel.findByIdAndDelete(id).lean();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Best-effort cleanup of the uploaded files.
  if (process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const jobs: Promise<unknown>[] = [];
    if (item.pdfPublicId) jobs.push(cloudinary.uploader.destroy(item.pdfPublicId, { resource_type: "raw" }));
    if (item.videoPublicId)
      jobs.push(
        cloudinary.uploader.destroy(item.videoPublicId, {
          resource_type: "video",
          type: item.videoRestricted ? "authenticated" : "upload",
        })
      );
    await Promise.allSettled(jobs);
  }

  return NextResponse.json({ ok: true });
}
