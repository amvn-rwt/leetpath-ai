"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [height, setHeight] = useState(400);
  const [width, setWidth] = useState(640);

  const handleMount: OnMount = useCallback((editor) => {
    editor.focus();
    const container = containerRef.current;
    if (!container) return;
    const updateSize = () => {
      const { clientHeight, clientWidth } = container;
      if (clientHeight > 0 && clientWidth > 0) {
        setHeight(clientHeight);
        setWidth(clientWidth);
        editor.layout();
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    cleanupRef.current = () => ro.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-0 min-w-0"
      style={{ overflow: "hidden" }}
    >
      <Editor
        height={height}
        width={width}
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
    </div>
  );
}
