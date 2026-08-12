import fs from "fs/promises";
import path from "path";

export async function logUsage(data) {
  const logDirectory = path.join(process.cwd(), "logs");
  const logFile = path.join(logDirectory, "usage.jsonl");

  await fs.mkdir(logDirectory, { recursive: true });

  const record = {
    timestamp: new Date().toISOString(),
    ...data,
  };

  await fs.appendFile(
    logFile,
    JSON.stringify(record) + "\n"
  );
}
