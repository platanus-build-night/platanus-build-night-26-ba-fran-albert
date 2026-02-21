import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

type Provider = "anthropic" | "openai" | "gemini";

function detectProvider(): Provider {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  throw new Error(
    "No AI API key configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in .env.local",
  );
}

// --- Anthropic ---
let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

// --- OpenAI ---
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// --- Gemini ---
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return geminiClient;
}

const MODELS: Record<Provider, string> = {
  anthropic: "claude-sonnet-4-5-20250514",
  openai: "gpt-4o",
  gemini: "gemini-2.5-flash",
};

export async function generateCompletion(
  system: string,
  userMessage: string,
): Promise<string> {
  const provider = detectProvider();

  if (provider === "anthropic") {
    const response = await getAnthropic().messages.create({
      model: MODELS.anthropic,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: userMessage }],
    });
    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");
  }

  if (provider === "openai") {
    const response = await getOpenAI().chat.completions.create({
      model: MODELS.openai,
      max_tokens: 4096,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    });
    return response.choices[0]?.message?.content ?? "";
  }

  // gemini
  const response = await getGemini().models.generateContent({
    model: MODELS.gemini,
    contents: userMessage,
    config: {
      systemInstruction: system,
      maxOutputTokens: 4096,
    },
  });
  return response.text ?? "";
}

export async function* streamCompletion(
  system: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): AsyncGenerator<string> {
  const provider = detectProvider();

  if (provider === "anthropic") {
    const stream = getAnthropic().messages.stream({
      model: MODELS.anthropic,
      max_tokens: 4096,
      system,
      messages,
    });
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
    return;
  }

  if (provider === "openai") {
    const stream = await getOpenAI().chat.completions.create({
      model: MODELS.openai,
      max_tokens: 4096,
      stream: true,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
    return;
  }

  // gemini
  const geminiMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "model" as const : "user" as const,
    parts: [{ text: m.content }],
  }));
  const response = await getGemini().models.generateContentStream({
    model: MODELS.gemini,
    contents: geminiMessages,
    config: {
      systemInstruction: system,
      maxOutputTokens: 4096,
    },
  });
  for await (const chunk of response) {
    const text = chunk.text;
    if (text) yield text;
  }
}
