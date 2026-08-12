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

function isRetryableError(error) {
  if (!error) return false;

  if (error.code === "TIMEOUT") {
    return true;
  }

  const status = error.status ?? error.statusCode;

  return status === 429 || (status >= 500 && status <= 599);
}

function withTimeout(task, timeoutMs) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(
        `LLM request timed out after ${timeoutMs}ms`
      );

      error.code = "TIMEOUT";
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([
    Promise.resolve(task),
    timeout
  ]);
}

export async function callWithRetry(
  callLLM,
  prompt,
  {
    timeoutMs = 10000,
    maxRetries = 2,
    baseDelayMs = 500
  } = {}
) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(
        callLLM(prompt),
        timeoutMs
      );
    } catch (error) {
      lastError = error;

      console.log(
        `Attempt ${attempt + 1} failed: ${error.code || error.message}`
      );

      if (!isRetryableError(error)) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      const delay = baseDelayMs * 2 ** attempt;

      console.log(`Retrying in ${delay}ms...`);

      await new Promise(resolve => {
        setTimeout(resolve, delay);
      });
    }
  }

  throw lastError;
}
