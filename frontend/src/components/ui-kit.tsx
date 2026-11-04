import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 font-bold tracking-tight text-foreground text-lg", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-extrabold text-brand-foreground shadow-sm">
        A
      </span>
      <span>Assessly</span>
    </span>
  );
}

export function Stat({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: string; icon: LucideIcon }) {
  return (
    <div className="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand/40">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="size-4 transition-transform duration-200 group-hover:scale-110 text-muted-foreground group-hover:text-brand" />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
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
  primary: "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-150 hover:bg-primary/90 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer",
  brand: "inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-all duration-150 hover:bg-brand/90 hover:shadow-md hover:shadow-brand/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer",
  outline: "inline-flex items-center justify-center gap-2 rounded-md border bg-card px-4 py-2 text-sm font-medium transition-all duration-150 hover:bg-muted hover:border-foreground/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer",
  ghost: "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 hover:bg-muted active:scale-[0.98] cursor-pointer",
};

export const input = "w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-ring/20";
export const th = "px-4 py-2.5 text-left text-xs font-medium text-muted-foreground";
export const td = "px-4 py-3 text-sm";
