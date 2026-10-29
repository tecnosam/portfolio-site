"use client";

import Link from "next/link";
import { useLenis } from "lenis/react";
import { ArrowUp } from "lucide-react";
import { profile } from "@/lib/data";
import { navLinks, aiTools } from "@/lib/site-nav";
import LagosClock from "@/components/motion/LagosClock";

const socials = [
  { href: profile.socials.github, label: "GitHub" },
  { href: profile.socials.linkedin, label: "LinkedIn" },
  { href: profile.socials.twitter, label: "Twitter" },
  { href: `mailto:${profile.email}`, label: "Email" },
];

export default function Footer() {
  const lenis = useLenis();

  return (
    <footer className="relative overflow-hidden border-t hairline bg-neutral">
      <div className="mx-auto max-w-7xl px-5 md:px-8 pt-16 pb-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-5 space-y-4">
            <p className="font-display text-2xl leading-snug max-w-sm">
              Senior Software Engineer building production AI systems and distributed backends.
            </p>
            <p className="eyebrow">
              Lagos, Nigeria · <LagosClock /> WAT
            </p>
          </div>

          <FooterList title="Pages" className="md:col-span-2 md:col-start-7">
            {navLinks.map((l) => <FooterLink key={l.href} href={l.href}>{l.label}</FooterLink>)}
          </FooterList>
          <FooterList title="AI tools" className="md:col-span-2">
            {aiTools.map((l) => <FooterLink key={l.href} href={l.href}>{l.title}</FooterLink>)}
          </FooterList>
          <FooterList title="Elsewhere" className="md:col-span-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-base-content/55 transition-colors hover:text-primary">
                  {s.label}
                </a>
              </li>
            ))}
          </FooterList>
        </div>

        <p
          aria-hidden
          className="text-outline mt-16 select-none whitespace-nowrap font-display leading-[0.8] tracking-tight text-[clamp(3.5rem,15.5vw,15.5rem)] -mx-1"
        >
          Samuel Abolo
        </p>

        <div className="mt-6 flex items-center justify-between border-t hairline pt-6">
          <p className="eyebrow">© {new Date().getFullYear()} Samuel Abolo</p>
          <button
            onClick={() => lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" })}
            className="eyebrow flex items-center gap-2 transition-colors hover:text-base-content"
          >
            Back to top <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-base-content/55 transition-colors hover:text-primary">
        {children}
      </Link>
    </li>
  );
}
