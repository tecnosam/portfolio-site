"use client";

import { track } from "@vercel/analytics/react";
import { Download, ExternalLink } from "lucide-react";

type Props = {
  href: string;
  source: "hero" | "experience" | "refer_me";
  variant?: "outline" | "primary" | "link";
  children?: React.ReactNode;
};

export default function DownloadResumeLink({ href, source, variant = "outline", children }: Props) {
  const handleClick = () => track("resume_downloaded", { source });

  const cls =
    variant === "primary"
      ? "btn btn-primary w-full gap-2"
      : variant === "link"
      ? "btn btn-outline btn-sm gap-2"
      : "btn btn-outline gap-2";

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={cls}>
      {variant === "link" ? <ExternalLink size={14} /> : <Download size={16} />}
      {children ?? "Resume"}
    </a>
  );
}
