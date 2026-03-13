"use client";

import { useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { SupportedLanguage } from "@/types";

const LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "cpp",
  go: "go",
};

interface CodeEditorProps {
  language: SupportedLanguage;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ language, value, onChange, readOnly }: CodeEditorProps) {
  const handleMount: OnMount = useCallback((editor) => {
    editor.focus();
  }, []);

  return (
    <Editor
      height="100%"
      language={LANGUAGE_MAP[language]}
      value={value}
      onChange={(val) => onChange(val ?? "")}
      onMount={handleMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        readOnly,
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
}
