import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

type PdfParseResult = { text: string; numpages: number };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = createRequire(path.join(process.cwd(), "__dummy__"))("pdf-parse") as (
  buf: Buffer
) => Promise<PdfParseResult>;

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const MAX_CHUNK = 900;

// Paragraph-aware chunking — never splits mid-paragraph so company sections
// stay intact and different companies never bleed into the same chunk.
function chunkText(text: string): string[] {
  // Normalise whitespace while preserving paragraph breaks
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 20);

  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length === 0) {
      current = para;
    } else if (current.length + para.length + 2 <= MAX_CHUNK) {
      current += "\n\n" + para;
    } else {
      chunks.push(current);
      // If a single paragraph is larger than MAX_CHUNK, split it on sentences
      if (para.length > MAX_CHUNK) {
        const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
        let sub = "";
        for (const s of sentences) {
          if (sub.length + s.length > MAX_CHUNK) {
            if (sub) chunks.push(sub.trim());
            sub = s;
          } else {
            sub += " " + s;
          }
        }
        if (sub.trim()) current = sub.trim();
        else current = "";
      } else {
        current = para;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.filter((c) => c.length > 50);
}

async function embedText(text: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await model.embedContent({ content: { parts: [{ text }], role: "user" }, outputDimensionality: 768 } as any);
  return result.embedding.values;
}

// Remove any previously ingested chunks for this source so stale vectors
// from a different chunking run don't pollute retrieval results.
async function deleteExistingChunks(index: ReturnType<Pinecone["index"]>, source: string) {
  // Generate the range of possible old IDs (generous upper bound of 200)
  const ids = Array.from({ length: 200 }, (_, i) => `${source}-chunk-${i}`);
  try {
    await index.deleteMany({ ids });
  } catch {
    // Ignore — some IDs may not exist, that is fine
  }
}

async function ingestPdf(filePath: string, source: string) {
  console.log(`\nProcessing: ${filePath}`);
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const rawText: string = data.text;

  console.log(`  Extracted ${rawText.length} characters`);

  const chunks = chunkText(rawText);
  console.log(`  Split into ${chunks.length} chunks`);

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_INDEX_NAME!);

  // Clean up old vectors for this source before inserting new ones
  process.stdout.write(`  Removing old chunks for ${source}...\r`);
  await deleteExistingChunks(index, source);

  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`  Embedding chunk ${i + 1}/${chunks.length}...    \r`);
    const values = await embedText(chunk);
    vectors.push({
      id: `${source}-chunk-${i}`,
      values,
      metadata: { text: chunk, source, chunkIndex: String(i) },
    });
  }

  console.log(`\n  Upserting ${vectors.length} vectors to Pinecone...`);
  for (let i = 0; i < vectors.length; i += 100) {
    await index.upsert({ records: vectors.slice(i, i + 100) });
  }
  console.log(`  Done: ${source}`);
}

async function main() {
  const required = ["GEMINI_API_KEY", "PINECONE_API_KEY", "PINECONE_INDEX_NAME"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  const publicDir = path.join(process.cwd(), "public");
  const pdfFiles = fs
    .readdirSync(publicDir)
    .filter((f) => f.endsWith(".pdf"))
    .map((f) => ({ filePath: path.join(publicDir, f), source: path.basename(f, ".pdf") }));

  if (!pdfFiles.length) {
    console.log("No PDF files found in public/");
    process.exit(0);
  }

  console.log(`Found ${pdfFiles.length} PDF(s): ${pdfFiles.map((f) => f.source).join(", ")}`);

  for (const { filePath, source } of pdfFiles) {
    await ingestPdf(filePath, source);
  }

  console.log("\nIngestion complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
