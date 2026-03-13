export type ExperienceLevel = "JUNIOR" | "MID" | "SENIOR";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type SkillLevel = "WEAK" | "MEDIUM" | "STRONG";
export type InterviewStatus = "SETUP" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
export type SubmissionStatus =
  | "PENDING"
  | "RUNNING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR";

export type SupportedLanguage = "python" | "javascript" | "java" | "cpp" | "go";

export const LANGUAGE_IDS: Record<SupportedLanguage, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  go: 60,
};

export const DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks & Queues",
  "Hash Maps",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Sorting & Searching",
  "Recursion & Backtracking",
  "Greedy",
  "Bit Manipulation",
  "Math",
  "Two Pointers",
  "Sliding Window",
] as const;

export type DSATopic = (typeof DSA_TOPICS)[number];

export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface GeneratedQuestion {
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  difficulty: Difficulty;
  topics: string[];
  tags: string[];
  hints: string[];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
  starterCode: Record<SupportedLanguage, string>;
}

export interface CodeScore {
  correctness: number;
  timeComplexity: string;
  optimalTimeComplexity: string;
  spaceComplexity: string;
  optimalSpaceComplexity: string;
  codeQuality: number;
  edgeCaseHandling: number;
  overallScore: number;
  feedback: string;
  optimalSolution?: string;
}

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  status: SubmissionStatus;
  runtime: number | null;
  memory: number | null;
}

export interface InterviewReport {
  communication: number;
  problemSolving: number;
  codeQuality: number;
  timeManagement: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}
