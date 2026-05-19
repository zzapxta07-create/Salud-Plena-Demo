import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("px-5 py-4 border-b border-ink-200 flex items-center justify-between gap-4", className)}>{children}</div>;
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h3 className={cn("section-title", className)}>{children}</h3>;
}

export function CardSubtitle({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("section-subtitle mt-0.5", className)}>{children}</p>;
}
