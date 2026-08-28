"use client";

import { useEffect, useRef, useState } from "react";
import CodeEditor from "./CodeEditor";
import OptionsPanel from "./OptionsPanel";
import StatsBar from "./StatsBar";
import {
  DEFAULT_OPTIONS,
  EXAMPLE_SCRIPT,
  ObfuscationOptions,
  ValidationResult,
} from "./types";

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; ms: number }
  | { kind: "error"; message: string };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export default function ObfuscatorApp() {
  const [source, setSource] = useState(EXAMPLE_SCRIPT);
  const [options, setOptions] = useState<ObfuscationOptions>(DEFAULT_OPTIONS);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");

  // Scoped to window.setTimeout (not the bare global) so this resolves to the
  // DOM lib's number-returning overload even though @types/node is also in
  // the project for the API routes.
  const debounceRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  // Debounced live validation as the user types.
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!source.trim()) {
      setValidation(null);
      return;
    }
    setChecking(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const result = await postJson<ValidationResult>("/api/validate", { code: source });
        setValidation(result);
      } catch {
        setValidation(null);
      } finally {
        setChecking(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [source]);

  const handleObfuscate = async () => {
    if (!source.trim()) return;
    setStatus({ kind: "working" });
    const start = performance.now();
    try {
      const result = await postJson<{ output: string }>("/api/obfuscate", {
        code: source,
        options: {
          noRename: !options.renameLocals,
          noPreserve: !options.preserveGlobals,
          encodeStrings: options.encodeStrings,
          encodeNumbers: options.encodeNumbers,
          scramble: options.scramble,
          oneLine: options.oneLine,
          vmType: options.vmType,
          vmLevel: options.vmLevel,
        },
      });
      setOutput(result.output);
      setStatus({ kind: "done", ms: Math.round(performance.now() - start) });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : String(err) });
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyLabel("Copied");
    } catch {
      setCopyLabel("Copy failed — select manually");
    }
    window.setTimeout(() => setCopyLabel("Copy"), 1500);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "obfuscated.lua";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const firstError = validation?.errors.find((e) => e.severity === "error");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 lg:max-w-5xl">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-blink rounded-full bg-signal" />
          <h1 className="text-lg font-semibold tracking-tight text-text">Luau Obfuscator</h1>
        </div>
        <p className="text-xs text-text-faint">
          AST-based passes + dual bytecode VM protection. Runs entirely server-side.
        </p>
      </header>

      <StatsBar stats={validation?.stats ?? null} checking={checking} />

      {firstError && (
        <div className="rounded-md border border-danger-dim bg-danger-dim/20 px-3 py-2 text-xs text-danger">
          {firstError.line ? `Line ${firstError.line}: ` : ""}
          {firstError.message}
        </div>
      )}

      <CodeEditor
        label="Input · Luau source"
        value={source}
        onChange={setSource}
        placeholder="-- Paste your Luau source code here..."
        minHeight="12rem"
      />

      <OptionsPanel options={options} onChange={setOptions} />

      <div className="flex flex-col gap-2">
        <button
          onClick={handleObfuscate}
          disabled={status.kind === "working" || !source.trim()}
          className="rounded-md bg-signal px-4 py-3 text-sm font-semibold text-ink-950
                     transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status.kind === "working" ? "Obfuscating…" : "Obfuscate script"}
        </button>

        <div className="px-1 text-xs">
          {status.kind === "idle" && <span className="text-text-faint">Ready.</span>}
          {status.kind === "done" && (
            <span className="text-signal-dim">Done in {status.ms}ms — output below.</span>
          )}
          {status.kind === "error" && <span className="text-danger">{status.message}</span>}
        </div>
      </div>

      <CodeEditor
        label="Output · Protected script"
        value={output}
        readOnly
        placeholder="-- Obfuscated output will appear here..."
        minHeight="12rem"
        footer={
          <>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-text
                         hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copyLabel}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-text
                         hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download .lua
            </button>
          </>
        }
      />

      <footer className="pb-4 pt-2 text-center text-[11px] text-text-faint">
        Engine derived from Clyde-Luau-Obfuscator (MIT). Deployed on Vercel.
      </footer>
    </div>
  );
}
