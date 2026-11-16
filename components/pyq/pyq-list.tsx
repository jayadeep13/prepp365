import Link from "next/link";
import { FileText, PlayCircle, Download, Lock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicPyq } from "@/lib/db/pyqs";
import { cn } from "@/lib/utils";

/** Exam filter chips + card grid shared by the PYQ and PYQs-with-Solution pages. */
export function PyqList({
  items,
  basePath,
  activeExam,
  emptyText,
}: {
  items: PublicPyq[];
  basePath: "/pyqs" | "/pyq-solutions";
  activeExam?: string;
  emptyText: string;
}) {
  const exams = Array.from(new Set(items.map((i) => i.examTag))).sort();
  const filtered = activeExam ? items.filter((i) => i.examTag === activeExam) : items;

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-card border border-dashed border-surface-line p-12 text-center">
        <p className="font-display font-semibold text-ink">{emptyText}</p>
        <p className="text-sm text-ink-faint mt-1">Check back soon — new papers are added regularly.</p>
      </div>
    );
  }

  return (
    <>
      {exams.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Chip href={basePath} active={!activeExam} label="All exams" />
          {exams.map((e) => (
            <Chip key={e} href={`${basePath}?exam=${encodeURIComponent(e)}`} active={activeExam === e} label={e} />
          ))}
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <div
            key={p._id}
            className="rounded-card border border-surface-line bg-white p-5 hover:shadow-glass transition-shadow flex flex-col"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="purple">{p.examTag}</Badge>
                {p.year && <Badge tone="orange">{p.year}</Badge>}
                {p.kind === "solution" && !p.isFree && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-faint">
                    <Lock size={11} /> Plan
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-purple-500">
                {p.hasPdf && <FileText size={17} aria-label="PDF" />}
                {p.hasVideo && <PlayCircle size={17} aria-label="Video" />}
              </span>
            </div>
            <h3 className="mt-4 font-display font-semibold text-ink">{p.title}</h3>
            {p.language && <p className="mt-1 text-xs text-ink-faint">{p.language}</p>}
            {p.description && <p className="mt-2 text-sm text-ink-soft line-clamp-2">{p.description}</p>}
            <div className="mt-auto pt-4 flex items-center gap-4">
              <Link href={`${basePath}/${p._id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600">
                {p.kind === "solution" ? "View solution" : "View paper"} <ArrowRight size={14} />
              </Link>
              {p.kind === "paper" && p.pdfUrl && (
                <a
                  href={p.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink"
                >
                  <Download size={13} /> Download
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors",
        active ? "bg-purple-600 text-white border-purple-600" : "border-surface-line text-ink-soft hover:bg-surface-tint"
      )}
    >
      {label}
    </Link>
  );
}
