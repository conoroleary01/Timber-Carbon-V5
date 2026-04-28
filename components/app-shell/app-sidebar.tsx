"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/projects/new", label: "New Project" },
  { href: "/results", label: "Results" },
  { href: "/breakdown", label: "Breakdown" },
  { href: "/epd-library", label: "EPD Library" },
  { href: "/reports", label: "Reports" },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[#D9E1E7] bg-white">
      <div className="border-b border-[#D9E1E7] px-6 py-5">
        <div className="text-2xl font-bold tracking-tight text-cygnum-green">
          Cygnum
        </div>
        <p className="mt-1 text-sm text-[#667085]">
          Embodied carbon platform
        </p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[#E8F5EF] text-cygnum-green"
                      : "text-[#1F2937] hover:bg-[#F7F9FA]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#D9E1E7] px-4 py-4 text-xs text-[#667085]">
        Conor O'Leary
      </div>
    </aside>
  );
}