import express from "express";
import fs from "fs/promises";
import path from "path";
import { inputSchema, outputSchema } from "../llm/schema.js";
import { callLLM } from "../llm/client.js";

const router = express.Router();

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

  try {
    // 3. Stub mode
    if (process.env.LLM_STUB === "1") {
      return res.json({
        category: "other",
        urgency: "normal",
        confidence: 0.5,
        reason: `Stub response for: ${text}`,
      });
    }

    // 4. Load versioned prompt
    const promptPath = path.join(
      process.cwd(),
      "prompts",
      "triage-v1.md"
    );

    const template = await fs.readFile(promptPath, "utf-8");

    const prompt = template.replace("{{text}}", text);

    // 5. Call LLM
    const result = await callLLM(prompt);

    // 6. Parse JSON
    let parsed;

    try {
      parsed = JSON.parse(result.content);
    } catch {
      return res.status(422).json({
        error: "LLM returned invalid JSON",
      });
    }

    // 7. Validate LLM output
    const validated = outputSchema.safeParse(parsed);

    if (!validated.success) {
      return res.status(422).json({
        error: "LLM returned invalid output",
        details: validated.error.flatten(),
      });
    }

    // 8. Return clean response
    return res.json(validated.data);

  } catch (error) {
    console.error("LLM error:", error.message);

    return res.status(502).json({
      error: "LLM request failed",
    });
  }
});

export default router;