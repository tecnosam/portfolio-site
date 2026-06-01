import Link from "next/link";
import { profile } from "@/lib/data";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/SocialIcons";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/open-source", label: "Open Source" },
  { href: "/communities", label: "Communities" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const aiLinks = [
  { href: "/jd-analyzer", label: "JD Analyzer" },
  { href: "/ask-sam", label: "Ask Sam" },
  { href: "/refer-me", label: "Refer Me" },
  { href: "/how-can-i-help", label: "How Can I Help?" },
];

export default function Footer() {
  return (
    <footer className="footer footer-center sm:footer-horizontal bg-neutral text-neutral-content p-10 mt-24">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl text-left">
        {/* Brand */}
        <div className="space-y-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SA<span className="text-primary">.</span>
          </Link>
          <p className="text-neutral-content/60 text-sm leading-relaxed max-w-xs">
            Senior Software Engineer building production LLM systems and distributed backends.
          </p>
          <div className="flex gap-3 pt-1">
            <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="text-neutral-content/50 hover:text-neutral-content transition-colors">
              <GithubIcon size={17} />
            </a>
            <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-content/50 hover:text-neutral-content transition-colors">
              <LinkedinIcon size={17} />
            </a>
            <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-content/50 hover:text-neutral-content transition-colors">
              <TwitterIcon size={17} />
            </a>
            <a href={`mailto:${profile.email}`} className="text-neutral-content/50 hover:text-neutral-content transition-colors">
              <Mail size={17} />
            </a>
          </div>
        </div>

        {/* Pages */}
        <div>
          <p className="footer-title text-neutral-content/40 text-[10px] mb-3">Pages</p>
          <ul className="space-y-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-neutral-content/60 hover:text-neutral-content transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* AI */}
        <div>
          <p className="footer-title text-neutral-content/40 text-[10px] mb-3">AI Features</p>
          <ul className="space-y-2">
            {aiLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-neutral-content/60 hover:text-neutral-content transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-content/10 w-full max-w-5xl pt-6 mt-2">
        <p className="text-neutral-content/40 text-xs">
          © {new Date().getFullYear()} Samuel Abolo · Lagos, Nigeria · Open to Relocation
        </p>
      </div>
    </footer>
  );
}
