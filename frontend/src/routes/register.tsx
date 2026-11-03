import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/AuthCard";
import { input } from "@/components/ui-kit";
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
        setDepartments(data);
        if (data.length > 0) {
          setDepartmentId(data[0].id);
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
      title="Create your account"
      subtitle="Includes 5 free practice questions. No payment needed to start."
      cta="Create account"
      loading={loading}
      onSubmit={handleSubmit}
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-medium text-brand">
            Log in
          </Link>
        </>
      }
    >
      <Field label="Full name">
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={input}
          placeholder="e.g. Abebe Bikila"
        />
      </Field>
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
      <Field label="Department">
        <select
          required
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className={input}
        >
          <option value="" disabled>
            Select your department
          </option>
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
          placeholder="At least 6 characters"
        />
      </Field>
    </AuthCard>
  );
}
