import express from "express";
import { inputSchema } from "../llm/schema.js";

const router = express.Router();

router.post("/triage", (req, res) => {
  const result = inputSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: result.error.flatten(),
    });
  }

  const { text } = result.data;

  const response = {
    category: "other",
    urgency: "normal",
    confidence: 0.5,
    reason: `Stub response for: ${text}`,
  };

  return res.json(response);
});

export default router;