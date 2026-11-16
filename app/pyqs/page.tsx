import { listPyqs } from "@/lib/db/pyqs";
import { PyqList } from "@/components/pyq/pyq-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Previous Year Question Papers (PYQ) — Free PDFs | Prepp365",
  description: "Download previous year question papers for government exams as free PDFs.",
};

export default async function PyqPapersPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const { exam } = await searchParams;
  const items = await listPyqs("paper");

  return (
    <div className="container-page py-10">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-purple-500 mb-2">100% free</p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">Previous Year Question Papers</h1>
      <p className="mt-2 text-ink-soft max-w-lg">
        Original question papers from past exams — view online or download the PDF, completely free. No login needed.
      </p>
      <PyqList items={items} basePath="/pyqs" activeExam={exam} emptyText="No question papers published yet" />
    </div>
  );
}
