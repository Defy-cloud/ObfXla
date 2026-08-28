"use client";

import { ValidationStats } from "./types";

interface StatsBarProps {
  stats: ValidationStats | null;
  checking: boolean;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-md border border-ink-600 bg-ink-800 px-2 py-2">
      <span className="text-lg font-semibold text-signal">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-text-faint">{label}</span>
    </div>
  );
}

export default function StatsBar({ stats, checking }: StatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <StatCard label="Tokens" value={checking ? "…" : stats?.tokens ?? 0} />
      <StatCard label="Statements" value={checking ? "…" : stats?.statements ?? 0} />
      <StatCard label="Functions" value={checking ? "…" : stats?.functions ?? 0} />
      <StatCard label="Locals" value={checking ? "…" : stats?.locals ?? 0} />
    </div>
  );
}
