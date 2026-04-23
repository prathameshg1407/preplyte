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
  proctoringSettings?: {
    rightClickDisabled: boolean;
    detectCopyPaste: boolean;
  } | null;
}

export function MonacoEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = "100%",
  className,
  proctoringSettings,
}: MonacoEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;

    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "var(--font-mono), 'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontLigatures: true,
      lineNumbers: "on",
      renderLineHighlight: "line",
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: "on",
      folding: true,
      bracketPairColorization: { enabled: false },
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
      lineHeight: 1.6,
      letterSpacing: 0.5,
      contextmenu: !proctoringSettings?.rightClickDisabled,
      copySelection: !proctoringSettings?.detectCopyPaste,
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
          <div className="flex h-full items-center justify-center bg-secondary/30">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading editor...</span>
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
