import { PlayCircle, FileDown, Trophy, Radio } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const features = [
  {
    icon: PlayCircle,
    title: "Prerecorded video classes",
    description: "Watch anytime, at your own pace, with resume-watching and speed control.",
  },
  {
    icon: FileDown,
    title: "Exam-ready notes",
    description: "Chapter-wise PDF notes, previous papers and current affairs, downloadable.",
  },
  {
    icon: Trophy,
    title: "Ranked mock tests",
    description: "Full-length and chapter-wise tests scored against every student attempting.",
  },
  {
    icon: Radio,
    title: "Doubt support",
    description: "Faculty reply to doubts directly on the lesson, not a separate forum.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="container-page py-16">
      <SectionHeading
        eyebrow="Why Prepp365"
        title="Built around the way toppers actually study"
        description="Not another video library — a structured path from syllabus to scorecard."
      />

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-card border border-surface-line bg-white p-6 hover:shadow-glass transition-shadow"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-600">
              <f.icon size={20} />
            </span>
            <h3 className="mt-4 font-display font-semibold text-ink">{f.title}</h3>
            <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
