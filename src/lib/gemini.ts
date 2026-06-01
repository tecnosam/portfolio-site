import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;

export function getGeminiClient() {
  return new GoogleGenerativeAI(apiKey);
}

export function getModel(modelName = "gemini-2.5-flash") {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({ model: modelName });
}

type RetryOptions = {
  json?: boolean;   // set responseMimeType: "application/json"
  maxRetries?: number;
};

// Retries with exponential backoff on 503 / rate-limit errors.
// Pass json: true for routes that expect a JSON response — Gemini will then
// constrain its output to syntactically valid JSON (no truncated/broken output).
export async function generateWithRetry(
  model: GenerativeModel,
  prompt: string,
  { json = false, maxRetries = 4 }: RetryOptions = {}
): Promise<string> {
  const request = json
    ? {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }
    : prompt;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(request);
      return result.response.text();
    } catch (err) {
      lastError = err;
      const isRetryable =
        err instanceof Error &&
        (err.message.includes("503") ||
          err.message.includes("Service Unavailable") ||
          err.message.includes("429") ||
          err.message.includes("quota") ||
          err.message.includes("Resource has been exhausted"));

      if (!isRetryable || attempt === maxRetries - 1) throw err;

      const delayMs = Math.min(1000 * 2 ** attempt + Math.random() * 500, 16000);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}
