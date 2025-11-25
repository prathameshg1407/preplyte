// src/components/practice/machine/monaco-editor.tsx

"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

export function MonacoEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = "100%",
  className,
}: MonacoEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;

    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontLigatures: true,
      lineNumbers: "on",
      renderLineHighlight: "all",
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: "on",
      folding: true,
      bracketPairColorization: { enabled: true },
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
    });

    editor.focus();
  }, []);

  const handleChange: OnChange = useCallback(
    (newValue) => {
      onChange(newValue || "");
    },
    [onChange]
  );

  return (
    <div className={className} style={{ height }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        loading={
          <div className="flex items-center justify-center h-full bg-muted/30">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading editor...</span>
          </div>
        }
        options={{
          readOnly,
          domReadOnly: readOnly,
        }}
      />
    </div>
  );
}