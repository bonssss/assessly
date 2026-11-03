import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/AuthCard";
import { input } from "@/components/ui-kit";
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
      title="Log in"
      subtitle="Welcome back. Continue your preparation."
      cta="Log in"
      loading={loading}
      onSubmit={handleSubmit}
      footer={
        <>
          No account?{" "}
          <Link to="/register" className="font-medium text-brand">
            Register
          </Link>
        </>
      }
    >
      <Field label="Email">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={input}
          placeholder="you@university.edu.et"
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
          placeholder="••••••••"
        />
      </Field>
    </AuthCard>
  );
}
