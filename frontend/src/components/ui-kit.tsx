import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 font-bold tracking-tight text-foreground text-lg", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-extrabold text-white shadow-sm ring-1 ring-blue-500/20">
        A
      </span>
      <span>Assessly</span>
    </span>
  );
}

export function Stat({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: string; icon: LucideIcon }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="size-4" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

const tones = {
  Pending: "bg-warning/10 text-warning",
  Approved: "bg-success/10 text-success",
  Active: "bg-success/10 text-success",
  Completed: "bg-success/10 text-success",
  Published: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
  Locked: "bg-muted text-muted-foreground",
  Draft: "bg-muted text-muted-foreground",
  Trial: "bg-accent text-brand",
  Available: "bg-accent text-brand",
} as const;

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", tones[status as keyof typeof tones] ?? "bg-muted")}>
      {status}
    </span>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const btn = {
  primary: "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
  brand: "inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50",
  outline: "inline-flex items-center justify-center gap-2 rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50",
  ghost: "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted",
};

export const input = "w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-ring/20";
export const th = "px-4 py-2.5 text-left text-xs font-medium text-muted-foreground";
export const td = "px-4 py-3 text-sm";
