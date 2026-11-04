import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/AuthCard";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Assessly" },
      { name: "description", content: "Log in to your Assessly account." },
      { property: "og:title", content: "Log in — Assessly" },
    ],
  }),
  component: LoginComponent,
});

function LoginComponent() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName}!`);

      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue your examination preparation."
      cta="Log in"
      loading={loading}
      onSubmit={handleSubmit}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline">
            Register now
          </Link>
        </>
      }
    >
      <Field label="Email address">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
          placeholder="you@university.edu.et"
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
          placeholder="••••••••"
        />
      </Field>
    </AuthCard>
  );
}
