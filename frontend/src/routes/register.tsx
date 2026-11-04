import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/AuthCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Assessly" },
      { name: "description", content: "Create a student account and get five free questions." },
      { property: "og:title", content: "Register — Assessly" },
    ],
  }),
  component: RegisterComponent,
});

function RegisterComponent() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.departments
      .list()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data as any)?.data || [];
        setDepartments(list);
        if (list.length > 0) {
          setDepartmentId(list[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch departments", err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId) {
      toast.error("Please select a department");
      return;
    }

    setLoading(true);
    try {
      const user = await register(fullName, email, password, [departmentId]);
      toast.success(`Account created! Welcome, ${user.fullName}`);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create student account"
      subtitle="Includes 5 free practice questions. No payment required."
      cta="Start Free Trial"
      loading={loading}
      onSubmit={handleSubmit}
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline">
            Log in here
          </Link>
        </>
      }
    >
      <Field label="Full name">
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
          placeholder="e.g. Abebe Bikila"
        />
      </Field>
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
      <Field label="Academic Department">
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
          required
        >
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Password">
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
          placeholder="At least 8 characters"
        />
      </Field>
    </AuthCard>
  );
}
