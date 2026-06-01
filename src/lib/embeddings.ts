import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  // outputDimensionality is supported by the API but not yet in the SDK types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await model.embedContent({ content: { parts: [{ text }], role: "user" }, outputDimensionality: 768 } as any);
  return result.embedding.values;
}
