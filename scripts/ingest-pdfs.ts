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

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.length > 50);
}

async function embedText(text: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await model.embedContent({ content: { parts: [{ text }], role: "user" }, outputDimensionality: 768 } as any);
  return result.embedding.values;
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

  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`  Embedding chunk ${i + 1}/${chunks.length}...\r`);
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
