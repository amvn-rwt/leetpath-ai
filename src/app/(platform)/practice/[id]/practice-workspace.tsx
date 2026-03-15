"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/editor/code-editor";
import type {
  SupportedLanguage,
  TestCase,
  ExecutionResult,
} from "@/types";
import { Loader2Icon, CheckCircleIcon, XCircleIcon } from "lucide-react";

export interface PracticeQuestionData {
  id: string;
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  difficulty: string;
  topics: string[];
  tags: string[];
  hints: string[];
  expectedTimeComplexity: string | null;
  expectedSpaceComplexity: string | null;
  testCases: TestCase[];
  starterCode: Record<string, string> | null;
}

interface PracticeWorkspaceProps {
  question: PracticeQuestionData;
}

const LANGUAGES: SupportedLanguage[] = [
  "python",
  "javascript",
  "java",
  "cpp",
  "go",
];

const getStarter = (q: PracticeQuestionData, lang: SupportedLanguage) =>
  (q.starterCode as Record<string, string> | null)?.[lang] ?? "";

export function PracticeWorkspace({ question }: PracticeWorkspaceProps) {
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [codeByLang, setCodeByLang] = useState<Partial<Record<SupportedLanguage, string>>>(() => {
    const starter = question.starterCode as Record<string, string> | null;
    const out: Partial<Record<SupportedLanguage, string>> = {};
    for (const lang of LANGUAGES) {
      out[lang] = starter?.[lang] ?? "";
    }
    return out;
  });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<(ExecutionResult | null)[]>([]);

  const code = codeByLang[language] ?? getStarter(question, language);

  const setCode = useCallback(
    (value: string) => {
      setCodeByLang((prev) => ({ ...prev, [language]: value }));
    },
    [language]
  );

  const switchLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguage(lang);
  }, []);

  const runTests = async () => {
    setRunning(true);
    setResults([]);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          testCases: question.testCases.map((tc) => ({
            stdin: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
        }),
      });
      if (!res.ok) {
        const err = (await res.json()).error ?? "Request failed";
        setResults(
          question.testCases.map(() => ({
            stdout: null,
            stderr: err,
            status: "RUNTIME_ERROR" as const,
            runtime: null,
            memory: null,
          }))
        );
      } else {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } catch {
      setResults(
        question.testCases.map(() => ({
          stdout: null,
          stderr: "Network error",
          status: "RUNTIME_ERROR" as const,
          runtime: null,
          memory: null,
        }))
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="flex-1 overflow-y-auto rounded-lg border bg-card p-6 text-card-foreground">
        <h2 className="text-xl font-bold">{question.title}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            {question.difficulty}
          </span>
          {question.topics.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border px-2 py-0.5 text-xs"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="prose prose-sm dark:prose-invert mt-4 max-w-none">
          <p className="whitespace-pre-wrap text-sm">{question.description}</p>
        </div>
        {question.examples.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold">Examples</h3>
            {question.examples.map((ex, i) => (
              <div key={i} className="mt-2 rounded-md border bg-muted/30 p-3 text-sm">
                <p><strong>Input:</strong> {ex.input}</p>
                <p><strong>Output:</strong> {ex.output}</p>
                {ex.explanation && (
                  <p className="text-muted-foreground">{ex.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}
        {question.constraints.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold">Constraints</h3>
            <ul className="list-disc pl-5 text-sm">
              {question.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {question.expectedTimeComplexity && (
          <p className="mt-2 text-xs text-muted-foreground">
            Expected time: {question.expectedTimeComplexity}, space:{" "}
            {question.expectedSpaceComplexity ?? "—"}
          </p>
        )}
        {question.hints.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">
              Hints
            </summary>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {question.hints.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="flex flex-1 flex-col rounded-lg border">
        <Tabs
          value={language}
          onValueChange={(v) => switchLanguage(v as SupportedLanguage)}
        >
          <div className="flex items-center justify-between border-b px-2">
            <TabsList>
              {LANGUAGES.map((lang) => (
                <TabsTrigger key={lang} value={lang}>
                  {lang}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button
              size="sm"
              onClick={runTests}
              disabled={running || question.testCases.length === 0}
            >
              {running ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Running…
                </>
              ) : (
                "Run tests"
              )}
            </Button>
          </div>
          <div className="h-[calc(100vh-8rem-120px)] min-h-[200px]">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
            />
          </div>
        </Tabs>
        {results.length > 0 && (
          <div className="border-t bg-muted/30 p-3">
            <h3 className="text-sm font-semibold">Test results</h3>
            <div className="mt-2 space-y-1">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm"
                >
                  {r?.status === "ACCEPTED" ? (
                    <CheckCircleIcon className="size-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircleIcon className="size-4 text-destructive" />
                  )}
                  <span>
                    Test {i + 1}:{" "}
                    {r?.status === "ACCEPTED"
                      ? "Passed"
                      : r?.status ?? "Error"}
                    {r?.runtime != null && ` (${r.runtime}s)`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
