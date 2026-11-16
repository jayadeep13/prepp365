import { listPyqs } from "@/lib/db/pyqs";
import { PyqList } from "@/components/pyq/pyq-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PYQs with Solution — PDF & Video Solutions | Prepp365",
  description: "Previous year question papers solved step by step, with solution PDFs and video explanations.",
};

export default async function PyqSolutionsPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const { exam } = await searchParams;
  const items = await listPyqs("solution");

  return (
    <div className="container-page py-10">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-purple-500 mb-2">Solved papers</p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">PYQs with Solution</h1>
      <p className="mt-2 text-ink-soft max-w-lg">
        Previous year papers solved by our faculty — detailed solution PDFs and video explanations with English &amp;
        Hindi subtitles and adjustable playback speed.
      </p>
      <PyqList items={items} basePath="/pyq-solutions" activeExam={exam} emptyText="No solved papers published yet" />
    </div>
  );
}
