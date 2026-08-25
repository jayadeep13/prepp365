import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-10">
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <DashboardSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
