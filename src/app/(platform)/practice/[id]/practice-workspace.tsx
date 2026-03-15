"use client";

import { useState, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeEditor } from "@/components/editor/code-editor";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDifficultyBadgeClass } from "@/lib/difficulty";
import type {
  SupportedLanguage,
  TestCase,
  ExecutionResult,
} from "@/types";
import { Loader2Icon, CheckCircleIcon, XCircleIcon, PlayIcon } from "lucide-react";

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

function QuestionContent({ question }: { question: PracticeQuestionData }) {
  return (
    <div className="p-6 text-card-foreground">
      <h2 className="text-xl font-bold">{question.title}</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className={getDifficultyBadgeClass(question.difficulty)}>
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
  );
}

export function PracticeWorkspace({ question }: PracticeWorkspaceProps) {
  const isMobile = useIsMobile();
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
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full w-full"
    >
      {/* Left: question description */}
      <ResizablePanel defaultSize={35} minSize={25}>
        <ScrollArea className="h-full">
          <div className="bg-card">
            <QuestionContent question={question} />
          </div>
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right: editor (top) + execution results (bottom) */}
      <ResizablePanel defaultSize={65} minSize={40} className="flex flex-col">
        <ResizablePanelGroup orientation="vertical" className="flex-1">
          <ResizablePanel defaultSize={70} minSize={30} className="min-h-0">
            <div className="flex h-full min-h-0 flex-col border-l">
              <Tabs
                value={language}
                onValueChange={(v) => switchLanguage(v as SupportedLanguage)}
                className="min-h-0 flex-1 flex gap-0 flex-col"
              >
                <div className="flex items-center justify-between border-b p-2">
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
                <div className="min-h-0 min-w-0 flex-1">
                  <CodeEditor
                    language={language}
                    value={code}
                    onChange={setCode}
                  />
                </div>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={30} minSize={15} className="overflow-y-auto">
            <div className="flex h-full flex-col border-t bg-muted/30 p-3">
              <h3 className="text-sm font-semibold">Execution results</h3>
              {results.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
                  <PlayIcon className="size-8 opacity-50" />
                  <p>Run your code to see test results here.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runTests}
                    disabled={running || question.testCases.length === 0}
                  >
                    {running ? "Running…" : "Run tests"}
                  </Button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-1">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm"
                    >
                      {r?.status === "ACCEPTED" ? (
                        <CheckCircleIcon className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircleIcon className="size-4 shrink-0 text-destructive" />
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
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
