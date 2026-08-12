# Connect to an AI API — Support Triage

A production-style Node.js API that connects to an LLM through OpenRouter and automatically classifies customer support messages into categories and urgency levels.

The project focuses on **structured LLM output, validation, reliability, retries, repair handling, usage logging, and evaluation**.

## 🚀 Features

* 🤖 OpenRouter LLM integration
* 🔐 Environment-based API key configuration
* 📝 Versioned prompt (`triage-v1.md`)
* ✅ Input validation using Zod
* 📦 Structured JSON output validation
* 🔧 One-time LLM output repair
* 🗃️ Quarantine of invalid repaired responses
* ⏱️ LLM request timeout
* 🔁 Automatic retry with exponential backoff
* 📊 Token and latency usage logging
* 🧪 Automated evaluation suite
* 🛡️ Prompt-injection test case
* 🔀 Git-based development with meaningful commits

## 🛠️ Tech Stack

* Node.js
* Express.js
* OpenRouter
* OpenAI Node.js SDK
* Zod
* dotenv
* JavaScript (ES Modules)
* Git & GitHub

## 📁 Project Structure

```text
Connect to an AI API/
│
├── evals/
│   ├── cases.json
│   └── run-eval.js
│
├── logs/
│   └── usage.jsonl
│
├── prompts/
│   └── triage-v1.md
│
├── src/
│   ├── llm/
│   │   ├── client.js
│   │   ├── logger.js
│   │   ├── parser.js
│   │   ├── retry.js
│   │   └── schema.js
│   │
│   ├── routes/
│   │   └── triage.js
│   │
│   └── server.js
│
├── .env.example
├── .gitignore
├── JOB_CARD.md
├── package.json
├── package-lock.json
└── README.md
```

> `.env` and generated log files are intentionally excluded from Git.

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/khushiekghara/Connect-To-An-API-FlyRank.git
cd Connect-To-An-API-FlyRank
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

Create a `.env` file in the project root:

```env
LLM_API_KEY=your_openrouter_api_key
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=openrouter/free
LLM_STUB=0
LLM_ENABLED=true
```

**Never commit `.env` to GitHub.**

### 4. Start the server

Development mode:

```bash
npm run dev
```

Or:

```bash
npm start
```

The API runs on:

```text
http://localhost:5000
```

## 🔌 API Endpoint

### POST `/api/triage`

Classifies a customer support message.

#### Request

```http
POST /api/triage
Content-Type: application/json
```

```json
{
  "text": "I was charged twice for my subscription."
}
```

#### Response

```json
{
  "category": "billing",
  "urgency": "normal",
  "confidence": 0.95,
  "reason": "The customer reports being charged twice."
}
```

## 📌 Allowed Categories

The API supports four categories:

```text
billing
bug
feature
other
```

## 🚦 Allowed Urgency Levels

```text
low
normal
high
```

## 🔄 LLM Processing Flow

```text
Client Request
      │
      ▼
Input Validation
      │
      ▼
Versioned Prompt
      │
      ▼
OpenRouter LLM
      │
      ▼
Timeout + Retry
      │
      ▼
Parse JSON
      │
      ▼
Zod Output Validation
      │
      ├── Valid ──────────────► Return Response
      │
      └── Invalid
             │
             ▼
       Repair Once
             │
             ▼
       Validate Again
             │
       ┌─────┴─────┐
       │           │
     Valid       Invalid
       │           │
       ▼           ▼
   Response     Quarantine
                    │
                    ▼
                 HTTP 422
```

## 🛡️ Reliability

### Timeout

LLM requests have a configured timeout so the application does not wait indefinitely for a response.

### Retry

Temporary failures such as:

* HTTP 429
* HTTP 5xx
* Timeout errors

can be retried automatically.

The retry delay uses exponential backoff.

### Output Validation

LLM output is validated using a Zod schema.

Invalid output is not blindly returned to the client.

### Repair

If the LLM produces invalid JSON or an invalid schema, the application attempts **one repair request**.

If the repaired output is still invalid, the response is quarantined and the API returns an error.

## 📊 Usage Logging

Successful LLM requests record usage information in:

```text
logs/usage.jsonl
```

Example:

```json
{
  "timestamp": "2026-08-12T18:59:38.557Z",
  "model": "openrouter/free",
  "inputTokens": 542,
  "outputTokens": 69,
  "totalTokens": 611,
  "latencyMs": 17670
}
```

The generated log file is ignored by Git.

## 🧪 Evaluation

Run the evaluation suite while the server is running:

```bash
node evals/run-eval.js
```

Current evaluation cases include:

* Billing classification
* Bug classification
* Feature classification
* Other classification
* Prompt-injection handling

### Current Result

```text
PASS: billing
PASS: bug
PASS: feature
PASS: other
PASS: prompt-injection

Passed: 5/5
```

## 🔐 Security

The project uses environment variables for secrets.

The following files/directories are ignored:

```text
.env
node_modules/
logs/*.jsonl
```

The actual API key must never be committed to GitHub.

## 📝 Git Commit History

The project was developed using meaningful incremental commits:

```text
Stage 6: add triage evaluation suite
Stage 5: add token and latency usage logging
Stage 4: add LLM timeout and retry handling
Stage 3: validate repair and quarantine LLM output
Stage 2: integrate LLM with versioned triage prompt
Stage 0-1: setup LLM API and validation
```

## 👩‍💻 Author

**Khushi Kumari**

GitHub:
https://github.com/khushiekghara

## 📄 License

This project was created for educational and assignment purposes.
