"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Submissions" },
  { href: "/admin/apply", label: "Application Wizard" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            pathname === l.href
              ? "bg-neutral-content/10 text-neutral-content"
              : "text-neutral-content/45 hover:text-neutral-content/80 hover:bg-neutral-content/5"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
