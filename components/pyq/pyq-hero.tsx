import Link from "next/link";
import { ArrowRight, BadgeCheck, Download, FileText, PlayCircle, Sparkles, Captions, Gauge } from "lucide-react";
import type { PublicPyq } from "@/lib/db/pyqs";

type Variant = "paper" | "solution";

const COPY: Record<
  Variant,
  {
    eyebrow: string;
    titleTop: string;
    titleAccent: string;
    subtitle: string;
    perks: { icon: typeof FileText; label: string }[];
    otherHref: string;
    otherLabel: string;
  }
> = {
  paper: {
    eyebrow: "100% free · No login needed",
    titleTop: "Previous Year",
    titleAccent: "Question Papers",
    subtitle:
      "Practise with the real thing. Original papers from past exams — read them online or download the PDF, completely free.",
    perks: [
      { icon: BadgeCheck, label: "Original exam papers" },
      { icon: Download, label: "Free PDF download" },
      { icon: FileText, label: "Year-wise & exam-wise" },
    ],
    otherHref: "/pyq-solutions",
    otherLabel: "See solved papers",
  },
  solution: {
    eyebrow: "Solved by our faculty",
    titleTop: "PYQs with",
    titleAccent: "Full Solutions",
    subtitle:
      "Every question explained step by step — detailed solution PDFs plus video walkthroughs you can watch at your own pace.",
    perks: [
      { icon: PlayCircle, label: "Video explanations" },
      { icon: Captions, label: "English & Hindi subtitles" },
      { icon: Gauge, label: "0.5x – 2x playback speed" },
    ],
    otherHref: "/pyqs",
    otherLabel: "Free question papers",
  },
};

/** Gradient hero with live stats, shared by the PYQ and PYQs-with-Solution pages. */
export function PyqHero({ variant, items }: { variant: Variant; items: PublicPyq[] }) {
  const c = COPY[variant];
  const exams = new Set(items.map((i) => i.examTag)).size;
  const years = items.map((i) => i.year).filter((y): y is number => typeof y === "number");
  const latestYear = years.length ? Math.max(...years) : null;
  const videos = items.filter((i) => i.hasVideo).length;

  const stats =
    variant === "paper"
      ? [
          { value: items.length, label: items.length === 1 ? "Paper" : "Papers" },
          { value: exams, label: exams === 1 ? "Exam" : "Exams" },
          { value: latestYear ?? "—", label: "Latest year" },
        ]
      : [
          { value: items.length, label: items.length === 1 ? "Solved paper" : "Solved papers" },
          { value: videos, label: videos === 1 ? "Video solution" : "Video solutions" },
          { value: exams, label: exams === 1 ? "Exam" : "Exams" },
        ];

  return (
    <section className="relative overflow-hidden border-b border-surface-line bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-purple-300/30 blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-orange-300/25 blur-[90px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(rgba(147,51,234,0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      <div className="container-page relative grid items-center gap-12 py-10 sm:py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white px-3.5 py-1.5 text-xs font-mono font-semibold text-purple-700 shadow-glass">
            <Sparkles size={13} /> {c.eyebrow}
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {c.titleTop}
            <br />
            <span className="font-accent bg-gradient-to-r from-purple-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent">
              {c.titleAccent}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-ink-soft leading-relaxed sm:text-lg">{c.subtitle}</p>

          <ul className="mt-5 sm:mt-6 flex flex-wrap gap-2 sm:gap-2.5">
            {c.perks.map((p) => (
              <li
                key={p.label}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white bg-white/70 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-ink shadow-glass backdrop-blur"
              >
                <span className="grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full bg-purple-100 text-purple-700">
                  <p.icon size={13} />
                </span>
                {p.label}
              </li>
            ))}
          </ul>

          <div className="mt-7 sm:mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <a
              href="#papers"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-gradient px-4 sm:px-7 text-sm font-semibold text-white shadow-glass-lg transition-transform hover:-translate-y-0.5"
            >
              Browse {variant === "paper" ? "papers" : "solutions"} <ArrowRight size={16} />
            </a>
            <Link
              href={c.otherHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-surface-line bg-white px-4 sm:px-7 text-center text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-50"
            >
              {c.otherLabel}
            </Link>
          </div>

          {items.length > 0 && (
          <dl className="mt-8 sm:mt-10 grid max-w-md grid-cols-3 divide-x divide-surface-line rounded-2xl border border-surface-line bg-white/80 py-4 shadow-glass backdrop-blur">
            {stats.map((s) => (
              <div key={s.label} className="px-4 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-bold text-ink">{s.value}</dd>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{s.label}</p>
              </div>
            ))}
          </dl>
          )}
        </div>

        {variant === "solution" ? <VideoSolutionIllustration /> : <PaperStackIllustration variant={variant} />}
      </div>
    </section>
  );
}

/** Pure-CSS illustration: a video player showing a solution, with subtitles and speed controls. */
function VideoSolutionIllustration() {
  return (
    <div className="relative mx-auto hidden h-[360px] w-full max-w-[440px] lg:block" aria-hidden>
      <div className="absolute inset-6 rounded-full bg-brand-gradient opacity-20 blur-3xl" />

      {/* Solution PDF peeking behind the player */}
      <div className="absolute right-0 top-2 h-[220px] w-[170px] rotate-[8deg] rounded-2xl border border-surface-line bg-white p-4 shadow-glass-lg">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700">
          <FileText size={12} /> SOLUTION PDF
        </div>
        <div className="mt-3 space-y-2">
          {[90, 70, 85, 60, 75, 50].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-ink/10" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
          <BadgeCheck size={11} /> Ans: (B)
        </div>
      </div>

      {/* Video player */}
      <div className="absolute bottom-6 left-0 w-[340px] overflow-hidden rounded-2xl border border-white/60 bg-ink shadow-glass-lg">
        <div className="relative aspect-video bg-gradient-to-br from-purple-700 via-fuchsia-600 to-orange-500">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="absolute left-4 top-3 rounded-md bg-black/30 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
            Q.17 · Solution
          </div>
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-purple-700 shadow-glass-lg">
            <PlayCircle size={30} />
          </span>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white">
            इस प्रश्न का सही उत्तर विकल्प B है
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="h-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-2/5 bg-brand-gradient" />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-white/80">
            <span>04:12 / 10:30</span>
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                <Captions size={11} /> HI
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                <Gauge size={11} /> 1.5x
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pure-CSS illustration: a fanned stack of exam papers. */
function PaperStackIllustration({ variant }: { variant: Variant }) {
  const sheets = [
    { rotate: "-rotate-[9deg]", offset: "-translate-x-10 translate-y-4", year: "2022" },
    { rotate: "rotate-[6deg]", offset: "translate-x-10 translate-y-2", year: "2023" },
    { rotate: "rotate-0", offset: "", year: "2024" },
  ];
  return (
    <div className="relative mx-auto hidden h-[360px] w-full max-w-[360px] lg:block" aria-hidden>
      <div className="absolute inset-8 rounded-full bg-brand-gradient opacity-20 blur-3xl" />
      {sheets.map((s, i) => (
        <div
          key={s.year}
          className={`absolute left-1/2 top-1/2 h-[290px] w-[220px] -ml-[110px] -mt-[145px] rounded-2xl border border-surface-line bg-white p-5 shadow-glass-lg ${s.rotate} ${s.offset}`}
          style={{ zIndex: i }}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-purple-50 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-700">
              UGC NET
            </span>
            <span className="font-display text-sm font-bold text-orange-500">{s.year}</span>
          </div>
          <div className="mt-4 h-2.5 w-3/4 rounded-full bg-ink/80" />
          <div className="mt-2 h-2 w-1/2 rounded-full bg-ink/20" />
          <div className="mt-5 space-y-3">
            {[0, 1, 2, 3].map((q) => (
              <div key={q} className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-ink/10" />
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((o) => (
                    <span
                      key={o}
                      className={`h-3 w-3 rounded-full border ${
                        variant === "solution" && i === 2 && o === (q + 1) % 4
                          ? "border-green-500 bg-green-500"
                          : "border-ink/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {i === 2 && (
            <div className="absolute -bottom-4 -right-4 flex items-center gap-1.5 rounded-full bg-brand-gradient px-3.5 py-2 text-xs font-bold text-white shadow-glass-lg">
              {variant === "solution" ? <PlayCircle size={14} /> : <Download size={14} />}
              {variant === "solution" ? "Video solution" : "Free PDF"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
