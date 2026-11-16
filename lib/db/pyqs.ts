import "server-only";
import { connectDB } from "@/lib/db/connect";
import { PyqItemModel } from "@/models/PyqItem";
import "@/models/Category";

export type PublicPyq = {
  _id: string;
  kind: "paper" | "solution";
  title: string;
  examTag: string;
  year?: number;
  language?: string;
  description?: string;
  pdfUrl?: string;
  hasPdf: boolean;
  hasVideo: boolean;
  videoUrl?: string;
  videoPublicId?: string;
  videoRestricted?: boolean;
  isFree: boolean;
  categoryName?: string;
};

type Lean = {
  _id: { toString(): string };
  kind: "paper" | "solution";
  title: string;
  examTag: string;
  year?: number | null;
  language?: string | null;
  description?: string | null;
  pdfUrl?: string | null;
  videoUrl?: string | null;
  videoPublicId?: string | null;
  videoRestricted?: boolean | null;
  isFree?: boolean | null;
  category?: { name?: string } | null;
};

/**
 * `includeFiles` is only true on detail pages, after their own access check —
 * listings never expose solution PDF / video URLs (solutions can be paid).
 */
function toPublic(d: Lean, includeFiles: boolean): PublicPyq {
  const isFree = d.kind === "paper" ? true : d.isFree !== false;
  const exposePdf = includeFiles || d.kind === "paper";
  return {
    _id: d._id.toString(),
    kind: d.kind,
    title: d.title,
    examTag: d.examTag,
    year: d.year ?? undefined,
    language: d.language ?? undefined,
    description: d.description ?? undefined,
    pdfUrl: exposePdf ? (d.pdfUrl ?? undefined) : undefined,
    hasPdf: Boolean(d.pdfUrl),
    hasVideo: Boolean(d.videoUrl),
    videoUrl: includeFiles ? (d.videoUrl ?? undefined) : undefined,
    videoPublicId: includeFiles ? (d.videoPublicId ?? undefined) : undefined,
    videoRestricted: d.videoRestricted ?? true,
    isFree,
    categoryName: d.category?.name,
  };
}

export async function listPyqs(kind: "paper" | "solution"): Promise<PublicPyq[]> {
  try {
    await connectDB();
    const docs = (await PyqItemModel.find({ kind, isPublished: true })
      .populate("category", "name")
      .sort({ year: -1, createdAt: -1 })
      .lean()) as unknown as Lean[];
    return docs.map((d) => toPublic(d, false));
  } catch {
    return [];
  }
}

export async function getPyq(id: string, kind: "paper" | "solution"): Promise<PublicPyq | null> {
  try {
    await connectDB();
    const doc = (await PyqItemModel.findOne({ _id: id, kind, isPublished: true })
      .populate("category", "name")
      .lean()) as unknown as Lean | null;
    return doc ? toPublic(doc, true) : null;
  } catch {
    return null;
  }
}
