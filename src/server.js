import "dotenv/config";
import express from "express";
import triageRouter from "./routes/triage.js";

const app = express();

app.use(express.json());

app.use("/api", triageRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});