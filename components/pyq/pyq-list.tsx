import Link from "next/link";
import { FileText, PlayCircle, Download, Lock, ArrowRight, Languages, Inbox, ClipboardList, BookOpen } from "lucide-react";
import type { PublicPyq } from "@/lib/db/pyqs";
import { cn, downloadUrl } from "@/lib/utils";

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
  const isSolution = basePath === "/pyq-solutions";

  return (
    <section id="papers" className="container-page scroll-mt-24 py-12 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-purple-500">
            {isSolution ? "Solved papers" : "Question papers"}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
            {activeExam ? `${activeExam} papers` : isSolution ? "Browse solved papers" : "Browse all papers"}
          </h2>
        </div>
        {items.length > 0 && (
          <p className="text-sm text-ink-faint">
            Showing <span className="font-semibold text-ink">{filtered.length}</span> of {items.length}
          </p>
        )}
      </div>

      {exams.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Chip href={`${basePath}#papers`} active={!activeExam} label="All exams" />
          {exams.map((e) => (
            <Chip
              key={e}
              href={`${basePath}?exam=${encodeURIComponent(e)}#papers`}
              active={activeExam === e}
              label={e}
            />
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState isSolution={isSolution} text={emptyText} />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PaperCard key={p._id} p={p} basePath={basePath} />
          ))}
        </div>
      )}
    </section>
  );
}

function PaperCard({ p, basePath }: { p: PublicPyq; basePath: string }) {
  const isSolution = p.kind === "solution";
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-surface-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg">
      {/* Coloured header band with the year */}
      <div className="relative overflow-hidden bg-brand-gradient px-5 pb-5 pt-4 text-white">
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 right-10 h-20 w-20 rounded-full bg-white/10" />
        <div className="relative flex items-start justify-between gap-3">
          <span className="rounded-md bg-white/20 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wide backdrop-blur">
            {p.examTag}
          </span>
          <span className="flex items-center gap-1.5">
            {p.hasPdf && (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20" title="PDF">
                <FileText size={14} />
              </span>
            )}
            {p.hasVideo && (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20" title="Video">
                <PlayCircle size={14} />
              </span>
            )}
          </span>
        </div>
        <div className="relative mt-3 flex items-end justify-between">
          <p className="font-display text-4xl font-bold leading-none tracking-tight">{p.year ?? "PYQ"}</p>
          {isSolution && p.hasVideo && (
            // Video-first card: a play button signals there's a walkthrough inside.
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-purple-700 shadow-glass-lg transition-transform group-hover:scale-110">
              <PlayCircle size={26} />
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-semibold leading-snug text-ink group-hover:text-purple-700 transition-colors">
          {p.title}
        </h3>
        {p.description && <p className="mt-2 text-sm text-ink-soft line-clamp-2">{p.description}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {isSolution && (p.hasVideo || p.hasPdf) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 font-semibold text-purple-700">
              {p.hasVideo && <PlayCircle size={12} />}
              {p.hasVideo && p.hasPdf ? "Video + PDF" : p.hasVideo ? "Video solution" : "PDF solution"}
            </span>
          )}
          {p.language && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-tint px-2.5 py-1 font-medium text-ink-soft">
              <Languages size={12} /> {p.language}
            </span>
          )}
          {isSolution ? (
            p.isFree ? (
              <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">Free</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-orange-700">
                <Lock size={11} /> Mock test plan
              </span>
            )
          ) : (
            <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">Free PDF</span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Link
            href={`${basePath}/${p._id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            {isSolution ? (p.hasVideo ? "Watch solution" : "View solution") : "View paper"} <ArrowRight size={14} />
          </Link>
          {!isSolution && p.pdfUrl && (
            <a
              href={downloadUrl(p.pdfUrl)}
              download
              aria-label={`Download ${p.title}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-surface-line text-ink-soft transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
            >
              <Download size={16} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState({ isSolution, text }: { isSolution: boolean; text: string }) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-card border border-surface-line bg-gradient-to-br from-white to-purple-50/60 px-6 py-14 text-center">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-200/40 blur-2xl" />
      <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glass-lg">
        <Inbox size={28} />
      </span>
      <p className="relative mt-5 font-display text-xl font-bold text-ink">{text}</p>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-ink-soft">
        {isSolution
          ? "Our faculty is solving the latest papers right now. Meanwhile, practise with the free question papers or a mock test."
          : "We're uploading original papers from recent exams. Meanwhile, test yourself with a full mock test or explore our courses."}
      </p>
      <div className="relative mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href={isSolution ? "/pyqs" : "/mock-tests"}
          className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-glass"
        >
          <ClipboardList size={15} /> {isSolution ? "Free question papers" : "Try a mock test"}
        </Link>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-full border border-surface-line bg-white px-6 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50"
        >
          <BookOpen size={15} /> Explore courses
        </Link>
      </div>
    </div>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
        active
          ? "border-transparent bg-brand-gradient text-white shadow-glass"
          : "border-surface-line bg-white text-ink-soft hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
      )}
    >
      {label}
    </Link>
  );
}
