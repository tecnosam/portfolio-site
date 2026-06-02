"use client";

import Link from "next/link";
import { track } from "@vercel/analytics/react";
import { FileText, ExternalLink } from "lucide-react";

type Props = {
  source: "hero" | "experience" | "refer_me";
  variant?: "outline" | "primary" | "link";
  children?: React.ReactNode;
};

// Redirects to the Refer Me page instead of downloading a static PDF.
// The full generated resume lives there.
export default function DownloadResumeLink({ source, variant = "outline", children }: Props) {
  const cls =
    variant === "primary"
      ? "btn btn-primary w-full gap-2"
      : variant === "link"
      ? "btn btn-outline btn-sm gap-2"
      : "btn btn-outline gap-2";

  return (
    <Link
      href="/refer-me?from=resume"
      onClick={() => track("resume_link_clicked", { source })}
      className={cls}
    >
      {variant === "link" ? <ExternalLink size={14} /> : <FileText size={16} />}
      {children ?? "Resume"}
    </Link>
  );
}
