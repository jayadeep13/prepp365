"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Receipt, Users, GraduationCap, Ticket, Tags, Quote, Megaphone, MessagesSquare, Settings, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    links: [{ href: "/admin", label: "Analytics", icon: BarChart3 }],
  },
  {
    label: "Commerce",
    links: [
      { href: "/admin/orders", label: "Orders", icon: Receipt },
      { href: "/admin/students", label: "Students", icon: Users },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/courses", label: "Courses", icon: GraduationCap },
      { href: "/admin/mock-tests", label: "Mock Tests", icon: ClipboardList },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    ],
  },
  {
    label: "Support",
    links: [{ href: "/admin/chat", label: "Chat", icon: MessagesSquare }],
  },
  {
    label: "System",
    links: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="lg:sticky lg:top-28 h-fit">
      {groups.map((group, gi) => (
        <div key={group.label} className={cn("pb-3", gi > 0 && "mt-3 border-t border-white/10 pt-3")}>
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">{group.label}</p>
          <div className="flex flex-col gap-0.5">
            {group.links.map((link) => {
              const active =
                pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                    active
                      ? "bg-gradient-to-r from-purple-500/15 to-transparent text-white"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-gradient" />}
                  <link.icon size={16} className={active ? "text-purple-400" : undefined} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
