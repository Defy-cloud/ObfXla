"use client";

interface CodeEditorProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  footer?: React.ReactNode;
  minHeight?: string;
}

export default function CodeEditor({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
  footer,
  minHeight = "16rem",
}: CodeEditorProps) {
  return (
    <div className="flex flex-col rounded-lg border border-ink-600 bg-ink-800 shadow-glow">
      <div className="flex items-center justify-between border-b border-ink-600 px-3 py-2">
        <span className="text-xs uppercase tracking-wider text-text-muted">{label}</span>
        <span className="text-xs text-text-faint">{value.length.toLocaleString()} chars</span>
      </div>
      <textarea
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        spellCheck={false}
        placeholder={placeholder}
        style={{ minHeight }}
        className="w-full flex-1 resize-y bg-transparent px-3 py-3 text-sm leading-relaxed text-text
                   placeholder:text-text-faint focus:outline-none disabled:opacity-60"
      />
      {footer && <div className="flex items-center gap-2 border-t border-ink-600 px-3 py-2">{footer}</div>}
    </div>
  );
}
