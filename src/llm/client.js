import "dotenv/config";
import OpenAI from "openai";
import { callWithRetry } from "./retry.js";

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
});

async function makeLLMRequest(prompt) {
  const response = await client.chat.completions.create({
    model: process.env.LLM_MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return {
    content: response.choices[0].message.content,
    inputTokens: response.usage?.prompt_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
  };
}

export async function callLLM(prompt) {
  return await callWithRetry(
    makeLLMRequest,
    prompt,
    {
      timeoutMs: 10000,
      maxRetries: 2,
      baseDelayMs: 500,
    }
  );
}