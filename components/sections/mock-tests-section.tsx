import Link from "next/link";
import { ArrowRight, Timer, ListChecks, BarChart3, Layers, Target, GraduationCap, BookOpen, PenLine, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const testTypes = [
  { icon: Layers, title: "Chapter-wise", description: "Test one topic at a time before moving on." },
  { icon: Timer, title: "Full-length, timed", description: "Simulates the exact exam pattern and duration." },
  { icon: ListChecks, title: "Previous papers", description: "Actual papers from the last 10 years, digitised." },
  { icon: BarChart3, title: "Result analysis", description: "Section-wise accuracy, time spent, and rank." },
];

const floatingIcons = [
  { icon: GraduationCap, className: "left-[6%] top-[12%]", delay: "0s", rot: "-12deg" },
  { icon: BookOpen, className: "left-[20%] bottom-[10%]", delay: "1.2s", rot: "9deg" },
  { icon: PenLine, className: "left-[42%] top-[6%]", delay: "2.1s", rot: "14deg" },
  { icon: CheckCircle2, className: "right-[30%] top-[20%]", delay: "0.6s", rot: "-8deg" },
  { icon: Timer, className: "right-[10%] bottom-[16%]", delay: "1.8s", rot: "10deg" },
  { icon: Target, className: "right-[4%] top-[8%]", delay: "0.9s", rot: "-15deg" },
];

export function MockTestsSection() {
  return (
    <section className="relative overflow-hidden bg-ink [perspective:1200px]">
      <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

      {floatingIcons.map((f, i) => (
        <f.icon
          key={i}
          size={28}
          className={`pointer-events-none absolute hidden text-white/[0.07] sm:block animate-float ${f.className}`}
          style={{ animationDelay: f.delay, "--float-rot": f.rot } as React.CSSProperties}
        />
      ))}

      <div className="container-page relative py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-mono font-semibold uppercase tracking-[0.14em] text-orange-300">
            <Target size={13} /> Mock test engine
          </div>
          <h2 className="mt-5 font-display text-3xl sm:text-4xl font-bold text-white tracking-tight leading-[1.1]">
            Negative marking. Real timer.{" "}
            <span className="font-accent text-orange-400">No surprises on exam day.</span>
          </h2>
          <p className="mt-4 text-white/60 leading-relaxed max-w-md">
            Every test mirrors the actual exam's marking scheme and duration, then
            hands you a full breakdown — right down to which questions cost you the most time.
          </p>
          <Link href="/#mock-test-pricing">
            <Button variant="accent" size="lg" className="group mt-7 h-16 px-10 text-lg">
              Get mock test access
              <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {testTypes.map((t) => (
            <div
              key={t.title}
              className="group rounded-card border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-white/[0.08] hover:shadow-[0_12px_32px_-8px_rgba(249,115,22,0.35)]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-orange-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-orange-500 group-hover:text-white">
                <t.icon size={18} />
              </span>
              <h3 className="mt-4 font-display font-semibold text-white text-sm transition-colors group-hover:text-orange-300">
                {t.title}
              </h3>
              <p className="mt-1.5 text-xs text-white/50 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
