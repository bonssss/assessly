import { Link } from "@tanstack/react-router";
import type { ReactNode, FormEvent } from "react";
import { AuthVectorIllustration } from "./EducationVectors";
import { Logo } from "./ui-kit";

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
    <div className="min-h-screen bg-gradient-to-br from-[#cffafe] via-[#a7f3d0]/35 to-[#bae6fd]/50 flex items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-brand/10 selection:text-brand">
      {/* Main Floating Rounded Card */}
      <div className="w-full max-w-4xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl shadow-cyan-950/10 border border-white/80 overflow-hidden grid md:grid-cols-2 animate-in fade-in zoom-in-95 duration-200">
        {/* Left Side: Friendly Education Vector & Welcome */}
        <div className="hidden md:flex flex-col justify-between items-center bg-gradient-to-b from-[#f0fdfa] to-[#e0f2fe]/70 p-8 lg:p-12 border-r border-slate-100 text-center select-none">
          <div className="w-full flex justify-start">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <Logo />
            </Link>
          </div>

          <div className="my-auto py-6 flex flex-col items-center">
            <AuthVectorIllustration className="w-full max-w-[340px]" />
            <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-800">
              Prepare Smart. Succeed Confidently.
            </h2>
            <p className="mt-2 text-xs text-slate-500 max-w-xs leading-relaxed">
              Access university exit exam questions, mock tests, and curated learning resources at
              home.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Assessly Online Assessment System
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Mobile Logo Header */}
          <div className="mb-6 md:hidden flex justify-between items-center">
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
              Online Education
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">{subtitle}</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {children}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-white py-2.5 sm:py-3 px-6 text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Please wait...
                  </span>
                ) : (
                  cta
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs sm:text-sm text-slate-500">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs sm:text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
