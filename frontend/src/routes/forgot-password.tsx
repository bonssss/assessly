import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/AuthCard";
import { api } from "@/lib/api";
import { Mail, CheckCircle2, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Assessly" },
      { name: "description", content: "Reset your Assessly account password." },
      { property: "og:title", content: "Forgot Password — Assessly" },
    ],
  }),
  component: ForgotPasswordComponent,
});

function ForgotPasswordComponent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      setSubmitted(true);
      if (res?.resetToken) {
        setDevToken(res.resetToken);
      }
      toast.success("Password reset instructions dispatched!");
    } catch (err: any) {
      toast.error(err.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your registered email address and we'll send you recovery instructions."
      cta="Send Reset Link"
      loading={loading}
      onSubmit={handleSubmit}
      footer={
        <>
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline"
          >
            Back to log in
          </Link>
        </>
      }
    >
      {submitted ? (
        <div className="space-y-4 text-center py-2 animate-in fade-in">
          <div className="mx-auto size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Check Your Email</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              If an account is associated with{" "}
              <span className="font-semibold text-slate-700">{email}</span>, we have sent
              instructions to reset your password.
            </p>
          </div>

          {devToken && (
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <KeyRound className="size-3.5 text-amber-600" />
                <span>Development / Testing Access</span>
              </div>
              <p className="text-[11px] text-amber-700">
                A valid 1-hour reset token was generated. You can proceed directly:
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: `/reset-password?token=${devToken}` })}
                className="w-full mt-1.5 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer shadow-sm transition-all"
              >
                <span>Continue to Set New Password</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setDevToken(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Try a different email</span>
            </button>
          </div>
        </div>
      ) : (
        <Field label="Email address">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
              placeholder="you@university.edu.et"
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </Field>
      )}
    </AuthCard>
  );
}
