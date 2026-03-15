import { LANGUAGE_IDS, type SupportedLanguage, type ExecutionResult } from "@/types";

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface Judge0Response {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

export async function submitCode(
  code: string,
  language: SupportedLanguage,
  stdin?: string,
  expectedOutput?: string
): Promise<string> {
  const submission: Judge0Submission = {
    source_code: Buffer.from(code).toString("base64"),
    language_id: LANGUAGE_IDS[language],
    stdin: stdin ? Buffer.from(stdin).toString("base64") : undefined,
    expected_output: expectedOutput
      ? Buffer.from(expectedOutput).toString("base64")
      : undefined,
    cpu_time_limit: 5,
    memory_limit: 256000,
  };

  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": JUDGE0_API_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error(`Judge0 submission failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.token;
}

export async function getSubmissionResult(token: string): Promise<ExecutionResult> {
  const response = await fetch(
    `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`,
    {
      headers: {
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Judge0 result fetch failed: ${response.statusText}`);
  }

  const data: Judge0Response = await response.json();

  const statusMap: Record<number, ExecutionResult["status"]> = {
    1: "RUNNING",
    2: "RUNNING",
    3: "ACCEPTED",
    4: "WRONG_ANSWER",
    5: "TIME_LIMIT",
    6: "COMPILE_ERROR",
    11: "RUNTIME_ERROR",
    12: "RUNTIME_ERROR",
  };

  return {
    stdout: data.stdout ? Buffer.from(data.stdout, "base64").toString() : null,
    stderr: data.stderr
      ? Buffer.from(data.stderr, "base64").toString()
      : data.compile_output
        ? Buffer.from(data.compile_output, "base64").toString()
        : null,
    status: statusMap[data.status.id] || "RUNTIME_ERROR",
    runtime: data.time ? parseFloat(data.time) : null,
    memory: data.memory,
  };
}

export async function executeAndWait(
  code: string,
  language: SupportedLanguage,
  stdin?: string,
  expectedOutput?: string,
  maxRetries = 10
): Promise<ExecutionResult> {
  const token = await submitCode(code, language, stdin, expectedOutput);

  for (let i = 0; i < maxRetries; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result = await getSubmissionResult(token);
    if (result.status !== "RUNNING") {
      return result;
    }
  }

  return {
    stdout: null,
    stderr: "Execution timed out while waiting for result",
    status: "TIME_LIMIT",
    runtime: null,
    memory: null,
  };
}

// ── Batch (same code, multiple test cases) ─────────────────────────────────
// Uses Judge0 batch API: 1 create + 1 get per poll round instead of N creates + N gets.

interface BatchSubmissionInput {
  stdin?: string;
  expected_output?: string;
}

interface BatchSubmissionResponse {
  token?: string;
  language_id?: string[];
  source_code?: string[];
}

const statusMap: Record<number, ExecutionResult["status"]> = {
  1: "RUNNING",
  2: "RUNNING",
  3: "ACCEPTED",
  4: "WRONG_ANSWER",
  5: "TIME_LIMIT",
  6: "COMPILE_ERROR",
  11: "RUNTIME_ERROR",
  12: "RUNTIME_ERROR",
};

interface BatchGetItem {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  status_id?: number;
  time?: string | null;
  memory?: number | null;
}

function mapBatchSubmissionToResult(
  item: BatchGetItem,
  expectedOutput?: string
): ExecutionResult {
  const statusId = item.status_id ?? 0;
  let status = statusMap[statusId] ?? "RUNTIME_ERROR";
  const stdout = item.stdout
    ? Buffer.from(item.stdout, "base64").toString()
    : null;
  const stderr = item.stderr
    ? Buffer.from(item.stderr, "base64").toString()
    : item.compile_output
      ? Buffer.from(item.compile_output, "base64").toString()
      : null;
  if (
    status === "ACCEPTED" &&
    expectedOutput !== undefined &&
    expectedOutput !== null &&
    stdout?.trimEnd() !== expectedOutput.trimEnd()
  ) {
    status = "WRONG_ANSWER";
  }
  return {
    stdout,
    stderr,
    status,
    runtime: item.time ? parseFloat(item.time) : null,
    memory: item.memory ?? null,
  };
}

export async function submitBatch(
  code: string,
  language: SupportedLanguage,
  testCases: BatchSubmissionInput[]
): Promise<string[]> {
  const langId = LANGUAGE_IDS[language];
  const sourceCodeB64 = Buffer.from(code).toString("base64");
  const submissions = testCases.map((tc) => ({
    language_id: langId,
    source_code: sourceCodeB64,
    stdin: tc.stdin ? Buffer.from(tc.stdin).toString("base64") : undefined,
    expected_output: tc.expected_output
      ? Buffer.from(tc.expected_output).toString("base64")
      : undefined,
    cpu_time_limit: 5,
    memory_limit: 256000,
  }));

  const response = await fetch(
    `${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({ submissions }),
    }
  );

  if (!response.ok) {
    throw new Error(`Judge0 batch submission failed: ${response.statusText}`);
  }

  const data: BatchSubmissionResponse[] = await response.json();
  const tokens: string[] = [];
  for (const row of data) {
    if (typeof row?.token === "string") {
      tokens.push(row.token);
    }
  }
  if (tokens.length !== testCases.length) {
    throw new Error(
      `Judge0 batch returned ${tokens.length} tokens, expected ${testCases.length}`
    );
  }
  return tokens;
}

export async function getSubmissionBatch(
  tokens: string[]
): Promise<BatchGetItem[]> {
  const response = await fetch(
    `${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=true&fields=stdout,stderr,compile_output,status_id,time,memory`,
    {
      headers: {
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Judge0 batch get failed: ${response.statusText}`);
  }

  const data = (await response.json()) as { submissions?: BatchGetItem[] };
  return data.submissions ?? [];
}

export async function executeBatchAndWait(
  code: string,
  language: SupportedLanguage,
  testCases: { stdin?: string; expectedOutput?: string }[],
  maxRetries = 15
): Promise<ExecutionResult[]> {
  if (testCases.length === 0) return [];

  const tokens = await submitBatch(
    code,
    language,
    testCases.map((tc) => ({
      stdin: tc.stdin,
      expected_output: tc.expectedOutput,
    }))
  );

  for (let i = 0; i < maxRetries; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const batch = await getSubmissionBatch(tokens);
    const allDone = batch.every(
      (b) => (b.status_id ?? 0) !== 1 && (b.status_id ?? 0) !== 2
    );
    if (allDone) {
      return batch.map((b, idx) =>
        mapBatchSubmissionToResult(b, testCases[idx]?.expectedOutput)
      );
    }
  }

  const batch = await getSubmissionBatch(tokens);
  return batch.map((b, idx) =>
    mapBatchSubmissionToResult(b, testCases[idx]?.expectedOutput)
  );
}
