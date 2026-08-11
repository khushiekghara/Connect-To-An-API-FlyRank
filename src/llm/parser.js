import { outputSchema } from "./schema.js";

export function parseAndValidate(content) {
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    return {
      success: false,
      error: "invalid_json",
    };
  }

  const result = outputSchema.safeParse(parsed);

  if (!result.success) {
    return {
      success: false,
      error: "invalid_schema",
      details: result.error.flatten(),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

