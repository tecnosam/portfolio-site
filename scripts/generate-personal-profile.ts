/**
 * Regenerates public/Samuel_Abolo_Personal_Profile.pdf from structured content.
 * Run with: npx tsx scripts/generate-personal-profile.ts
 */
import path from "path";
import { createRequire } from "module";

const jspdf = createRequire(path.join(process.cwd(), "__dummy__"))("jspdf");
const { jsPDF } = jspdf;

const sections = [
  {
    heading: null,
    body: `A software engineer who builds systems that survive real production load, but whose curiosity runs well past the terminal. The thread connecting all of it: a fascination with how complex things hold together under pressure — whether that's a distributed system, a chessboard, a fast break, or a four-hour DJ set.`,
  },
  {
    heading: "WHO I AM",
    body: `As a child I wanted to be an astronaut and go to the moon. I traded the rocket for distributed systems, but the instinct stayed the same: aim at hard, far-off things and figure out the engineering to get there. I work best where correctness matters, failures are expensive, and the problem keeps moving. Outside the day job, I am a builder by reflex, fluent across the stack and most at home in Python, with a strong owner's mentality that shows up whether I am reviving an abandoned codebase or starting a company's backend from an empty repository.`,
  },
  {
    heading: "THE OTHER CAREER (IF ENGINEERING HADN'T HAPPENED)",
    body: `I would be a professional DJ, playing raves, festivals, and warehouses in the mold of Black Coffee. There is a real overlap with engineering: reading a room, sequencing tension and release, and keeping a long set coherent is its own kind of systems design. It stays a passion for now, but it is the alternate timeline I think about most.`,
  },
  {
    heading: "GAMES & COMPETITION",
    body: `Chess: ~1200 Elo on Lichess. Ongoing project to push the rating; the strategic, calculative side scratches the same itch as system design.

Basketball: Play Forward and Point Guard, with handles I am genuinely proud of. Comfortable running the offense or finishing inside.

Call of Duty: Active in CODM and Warzone; previously played Fortnite. Competitive, mechanically demanding shooters.

Minecraft: The builder's sandbox. Open-ended construction and systems for their own sake.`,
  },
  {
    heading: "TRAVEL",
    body: `I love to travel and explore new places. So far: Nigeria, Kenya, Rwanda, and Uganda, with a standing intent to keep widening the map. Much of my remote work has been with teams across the US, Puerto Rico, and East Africa, so I am used to operating across cultures and time zones.`,
  },
  {
    heading: "SIDE PROJECTS & INITIATIVES",
    body: `Adugbo — A local-first neighborhood information platform for Nigerian cities, launching with Lekki Phase 1 in Lagos. Web-first (Next.js 14, Tailwind, NextAuth) with Go microservices and a mobile version to follow. Built around geofencing, content seeding, verification, and community moderation.

Bookclinic — Co-founded as Founding Engineer / CTO; a healthcare appointment and booking platform, architected from the ground up.

Remllo — Founding Engineer on real-time transaction monitoring and fraud-detection infrastructure for African fintech.

Self-employed builds (2018–2022) — Inventory systems, trading trackers, real-time scraping tools, and an AI-powered medical suggestion API, all shipped for real clients.

Technical writing — Working toward publishing the Spark-to-Ray/Anyscale migration story, and active in public developer/engineering spaces on software architecture topics.`,
  },
  {
    heading: "HOW I WORK",
    body: `Owner, not a ticket-taker. I take responsibility end to end, from system design through deployment and production support.

Comfortable in the deep end. Reviving abandoned codebases, replatforming critical pipelines, founding engineering from scratch.

Clear across audiences. I communicate the same idea to a staff engineer and a non-technical stakeholder without losing either.

Remote-native. Self-directed, async-friendly, and used to distributed teams.`,
  },
];

function generate() {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const PW = 210, PH = 297;
  const ML = 18, MR = 18, MT = 16, MB = 16;
  const CW = PW - ML - MR;
  let y = MT;

  const C_PRIMARY:  [number,number,number] = [79, 43, 188];
  const C_DARK:     [number,number,number] = [15, 23, 42];
  const C_MID:      [number,number,number] = [71, 85, 105];
  const C_LIGHT:    [number,number,number] = [100, 116, 139];
  const C_SUBTLE:   [number,number,number] = [226, 232, 240];
  const C_BODY:     [number,number,number] = [51, 65, 85];

  const need = (h: number) => {
    if (y + h > PH - MB) { doc.addPage(); y = MT; }
  };

  const wrap = (text: string, indent = 0, size = 9, color = C_BODY, leading = 5): void => {
    const lines: string[] = doc.splitTextToSize(text, CW - indent);
    need(lines.length * leading);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(lines, ML + indent, y);
    y += lines.length * leading;
  };

  // ── Header ────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...C_DARK);
  doc.text("Samuel Abolo", ML, y);
  y += 2;
  doc.setDrawColor(...C_PRIMARY);
  doc.setLineWidth(1.8);
  doc.line(ML, y + 1, PW - MR, y + 1);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...C_MID);
  doc.text("Personal Profile", ML, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setTextColor(...C_LIGHT);
  doc.text("Lagos, Nigeria  ·  ikabolo59@gmail.com  ·  +234 706 379 6022", ML, y);
  y += 4.5;
  doc.text("github.com/tecnosam  ·  linkedin.com/in/samuel-abolo-24431a176", ML, y);
  y += 9;

  // ── Sections ──────────────────────────────────────
  for (const sec of sections) {
    if (sec.heading) {
      need(14);
      doc.setFillColor(...C_PRIMARY);
      doc.rect(ML, y, 2, 5.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C_PRIMARY);
      doc.text(sec.heading, ML + 4, y + 4);
      y += 5.5;
      doc.setDrawColor(...C_SUBTLE);
      doc.setLineWidth(0.2);
      doc.line(ML + 4, y + 0.5, PW - MR, y + 0.5);
      y += 5;
    }

    // Render paragraph by paragraph so blank-line separators work
    const paragraphs = sec.body.split("\n\n").map((p) => p.trim()).filter(Boolean);
    for (const para of paragraphs) {
      wrap(para);
      y += 2;
    }
    y += 3;
  }

  // ── Footer ────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const total: number = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(...C_SUBTLE);
    doc.text("samuelabolo.dev", PW / 2, PH - 7, { align: "center" });
  }

  const outPath = path.join(process.cwd(), "public", "Samuel_Abolo_Personal_Profile.pdf");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fs = createRequire(path.join(process.cwd(), "__dummy__"))("fs") as any;
  fs.writeFileSync(outPath, Buffer.from(doc.output("arraybuffer")));
  console.log("Written:", outPath);
}

generate();
