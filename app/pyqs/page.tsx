import { listPyqs } from "@/lib/db/pyqs";
import { PyqHero } from "@/components/pyq/pyq-hero";
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
    <div>
      <PyqHero variant="paper" items={items} />
      <PyqList items={items} basePath="/pyqs" activeExam={exam} emptyText="Question papers are on their way" />
    </div>
  );
}
