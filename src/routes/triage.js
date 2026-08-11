import express from "express";
import fs from "fs/promises";
import path from "path";

import { inputSchema } from "../llm/schema.js";
import { callLLM } from "../llm/client.js";
import { parseAndValidate } from "../llm/parser.js";
import { repairOutput } from "../llm/retry.js";

const router = express.Router();

async function quarantine(data) {
  const logDirectory = path.join(process.cwd(), "logs");
  const logFile = path.join(logDirectory, "quarantine.jsonl");

  await fs.mkdir(logDirectory, { recursive: true });

  await fs.appendFile(
    logFile,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...data,
    }) + "\n"
  );
}

router.post("/triage", async (req, res) => {
  // 1. Validate input
  const input = inputSchema.safeParse(req.body);

  if (!input.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: input.error.flatten(),
    });
  }

  const { text } = input.data;

  // 2. Kill switch
  if (process.env.LLM_ENABLED !== "true") {
    return res.status(503).json({
      error: "LLM service is disabled",
    });
  }

  // 3. Stub mode
  if (process.env.LLM_STUB === "1") {
    return res.json({
      category: "other",
      urgency: "normal",
      confidence: 0.5,
      reason: `Stub response for: ${text}`,
    });
  }

  try {
    // 4. Load versioned prompt
    const promptPath = path.join(
      process.cwd(),
      "prompts",
      "triage-v1.md"
    );

    const template = await fs.readFile(promptPath, "utf-8");
    const prompt = template.replace("{{text}}", text);

    // 5. First LLM call
    const result = await callLLM(prompt);

    // 6. Parse + validate
    let parsedResult = parseAndValidate(result.content);

    // 7. If invalid → repair exactly once
    if (!parsedResult.success) {
      console.log("Invalid LLM output. Attempting one repair...");

      const repaired = await repairOutput(
        callLLM,
        result.content
      );

      parsedResult = parseAndValidate(repaired.content);

      // 8. If repair also fails → quarantine
      if (!parsedResult.success) {
        await quarantine({
          originalOutput: result.content,
          repairedOutput: repaired.content,
          error: parsedResult.error,
        });

        return res.status(422).json({
          error: "LLM returned invalid output after repair",
        });
      }
    }

    // 9. Return validated output
    return res.json(parsedResult.data);

  } catch (error) {
    console.error("LLM error:", error.message);

    return res.status(502).json({
      error: "LLM request failed",
    });
  }
});

export default router;