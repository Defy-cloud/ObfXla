"use client";

interface ToggleRowProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  desc: string;
  disabled?: boolean;
}

export default function ToggleRow({ id, checked, onChange, title, desc, disabled }: ToggleRowProps) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-ink-700 ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-signal"
      />
      <span className="flex flex-col">
        <span className="text-sm text-text">{title}</span>
        <span className="text-xs text-text-faint">{desc}</span>
      </span>
    </label>
  );
}
