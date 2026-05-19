import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "violet";

const TONES: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700 border-ink-200",
  brand:   "bg-brand-50 text-brand-700 border-brand-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  danger:  "bg-red-50 text-red-700 border-red-200",
  info:    "bg-sky-50 text-sky-700 border-sky-200",
  violet:  "bg-violet-50 text-violet-700 border-violet-200",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium uppercase tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone = "neutral" }: { tone?: Tone }) {
  const colorMap: Record<Tone, string> = {
    neutral: "bg-ink-400",
    brand: "bg-brand-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-sky-500",
    violet: "bg-violet-500",
  };
  return <span className={cn("inline-block w-2 h-2 rounded-full", colorMap[tone])} />;
}
