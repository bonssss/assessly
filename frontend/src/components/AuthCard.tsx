import { Link } from "@tanstack/react-router";
import type { ReactNode, FormEvent } from "react";
import { Logo, btn } from "./ui-kit";

export function AuthCard({
  title,
  subtitle,
  cta,
  footer,
  onSubmit,
  loading = false,
  children,
}: {
  title: string;
  subtitle: string;
  cta: string;
  footer: ReactNode;
  onSubmit?: (e: FormEvent) => void;
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 inline-block">
          <Logo />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          {children}
          <button
            type="submit"
            disabled={loading}
            className={`${btn.primary} w-full flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {loading ? "Processing..." : cta}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
