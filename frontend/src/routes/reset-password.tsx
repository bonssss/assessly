import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/AuthCard";
import { api } from "@/lib/api";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Set New Password — Assessly" },
      { name: "description", content: "Create a new password for your Assessly account." },
      { property: "og:title", content: "Set New Password — Assessly" },
    ],
  }),
  component: ResetPasswordComponent,
});

function ResetPasswordComponent() {
  const { token: searchToken } = Route.useSearch();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      toast.error("Password reset token is required. Please check your reset link.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword({
        token: token.trim(),
        newPassword,
      });

      setIsSuccess(true);
      toast.success(res.message || "Password successfully reset!");
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create New Password"
      subtitle="Enter and confirm your new secure password below."
      cta="Save New Password"
      loading={loading}
      onSubmit={handleSubmit}
      footer={
        <>
          Back to{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {isSuccess ? (
        <div className="space-y-4 text-center py-4 animate-in fade-in">
          <div className="mx-auto size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Password Reset Complete!</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Your password has been securely updated. Redirecting you to login...
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md"
          >
            <span>Go to Log In</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      ) : (
        <>
          {!searchToken && (
            <Field label="Reset Token">
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 font-mono"
                placeholder="Paste reset token here"
              />
            </Field>
          )}

          <Field label="New Password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50/60 pl-10 pr-10 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                placeholder="Minimum 6 characters"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <Field label="Confirm New Password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                placeholder="Re-enter new password"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            </div>
          </Field>
        </>
      )}
    </AuthCard>
  );
}
