"use client";

import { ObfuscationOptions, VmLevel, VmType } from "./types";
import ToggleRow from "./ToggleRow";

interface OptionsPanelProps {
  options: ObfuscationOptions;
  onChange: (next: ObfuscationOptions) => void;
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 px-2 py-2">
      <span className="text-xs uppercase tracking-wider text-text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-ink-600 bg-ink-900 px-2 py-2 text-sm text-text
                   focus:border-signal focus:outline-none"
      >
        {children}
      </select>
    </label>
  );
}

export default function OptionsPanel({ options, onChange }: OptionsPanelProps) {
  const set = <K extends keyof ObfuscationOptions>(key: K, value: ObfuscationOptions[K]) =>
    onChange({ ...options, [key]: value });

  return (
    <div className="flex flex-col rounded-lg border border-ink-600 bg-ink-800 shadow-glow">
      <div className="border-b border-ink-600 px-3 py-2">
        <span className="text-xs uppercase tracking-wider text-text-muted">Engine config</span>
      </div>

      <fieldset className="border-b border-ink-600 px-1 py-2">
        <legend className="px-2 py-1 text-[11px] uppercase tracking-wider text-signal-dim">AST passes</legend>

        <ToggleRow
          id="opt-rename"
          checked={options.renameLocals}
          onChange={(v) => set("renameLocals", v)}
          title="Rename locals"
          desc="Scope-aware renaming of local variables, params, and loop vars"
        />
        <ToggleRow
          id="opt-preserve"
          checked={options.preserveGlobals}
          onChange={(v) => set("preserveGlobals", v)}
          title="Preserve Roblox / executor globals"
          desc="Never rename game APIs, engine indices, or environment functions"
        />
        <ToggleRow
          id="opt-encode-strings"
          checked={options.encodeStrings}
          onChange={(v) => set("encodeStrings", v)}
          title="Encode strings"
          desc="XOR-encode string literals with an injected runtime decoder"
        />
        <ToggleRow
          id="opt-encode-numbers"
          checked={options.encodeNumbers}
          onChange={(v) => set("encodeNumbers", v)}
          title="Encode numbers"
          desc="Replace integer literals with arithmetic expressions of equal value"
        />
        <ToggleRow
          id="opt-scramble"
          checked={options.scramble}
          onChange={(v) => set("scramble", v)}
          title="Scramble control flow"
          desc="Restructure branches into dispatch-table loops with opaque predicates"
        />
        <ToggleRow
          id="opt-oneline"
          checked={options.oneLine}
          onChange={(v) => set("oneLine", v)}
          title="Minify to one line"
          desc="Strip whitespace and newlines (ignored when a VM is selected)"
          disabled={options.vmType !== "none"}
        />
      </fieldset>

      <fieldset className="px-1 py-2">
        <legend className="px-2 py-1 text-[11px] uppercase tracking-wider text-signal-dim">
          Bytecode virtualization
        </legend>

        <SelectField label="VM architecture" value={options.vmType} onChange={(v) => set("vmType", v as VmType)}>
          <option value="none">None — standard AST output</option>
          <option value="register">Register-based (polymorphic dispatch)</option>
          <option value="stack">Stack-based (classic architecture)</option>
        </SelectField>

        <SelectField
          label="Protection level"
          value={options.vmLevel}
          onChange={(v) => set("vmLevel", v as VmLevel)}
        >
          <option value="max">Max — LZSS + anti-dump + S-box cipher</option>
          <option value="normal">Normal — XOR table + instruction shuffling</option>
          <option value="debug">Debug — readable VM for stack tracing</option>
        </SelectField>
      </fieldset>
    </div>
  );
    }
