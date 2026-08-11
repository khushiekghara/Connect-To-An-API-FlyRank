export async function repairOutput(callLLM, originalOutput) {
  const repairPrompt = `
The following response is invalid.

Return ONLY valid JSON matching this exact structure:

{
  "category": "billing | bug | feature | other",
  "urgency": "low | normal | high",
  "confidence": 0.0,
  "reason": "one short sentence"
}

Do not add extra fields.

Invalid response:
${originalOutput}
`;

  return await callLLM(repairPrompt);
}