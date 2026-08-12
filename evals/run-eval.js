import "dotenv/config";
import fs from "fs/promises";

const cases = JSON.parse(
  await fs.readFile("./evals/cases.json", "utf-8")
);

const baseUrl = "http://localhost:5000";

let passed = 0;

for (const testCase of cases) {
  try {
    const response = await fetch(`${baseUrl}/api/triage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: testCase.text,
      }),
    });

    const result = await response.json();

    const success =
      response.ok &&
      result.category === testCase.expectedCategory &&
      ["billing", "bug", "feature", "other"].includes(
        result.category
      ) &&
      ["low", "normal", "high"].includes(result.urgency) &&
      typeof result.confidence === "number" &&
      result.confidence >= 0 &&
      result.confidence <= 1 &&
      typeof result.reason === "string";

    if (success) {
      console.log(`PASS: ${testCase.name}`);
      passed++;
    } else {
      console.log(`FAIL: ${testCase.name}`);
      console.log("Response:", result);
    }
  } catch (error) {
    console.log(`FAIL: ${testCase.name}`);
    console.log("Error:", error.message);
  }
}

console.log("");
console.log(`Passed: ${passed}/${cases.length}`);

if (passed !== cases.length) {
  process.exit(1);
}