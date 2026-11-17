import { listPyqs } from "@/lib/db/pyqs";
import { PyqHero } from "@/components/pyq/pyq-hero";
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
    <div>
      <PyqHero variant="solution" items={items} />
      <PyqList items={items} basePath="/pyq-solutions" activeExam={exam} emptyText="Solved papers are on their way" />
    </div>
  );
}
