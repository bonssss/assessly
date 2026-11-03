import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Field } from "@/components/AuthCard";
import { StudentShell } from "@/components/StudentShell";
import { PageHeader, Section, btn, input } from "@/components/ui-kit";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Assessly" },
      { name: "description", content: "Manage your personal details and account settings." },
      { property: "og:title", content: "Profile — Assessly" },
    ],
  }),
  component: ProfileComponent,
});

function ProfileComponent() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile saved successfully");
  };

  return (
    <StudentShell>
      <PageHeader title="Profile" description="Your personal details and account settings." />
      <Section title="Personal Information" className="max-w-2xl">
        <form className="grid gap-4 p-4 sm:grid-cols-2" onSubmit={handleSave}>
          <Field label="Full name">
            <input
              className={input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input className={input} value={email} disabled />
          </Field>
          <Field label="Account Role">
            <input className={input} value={user?.role || "STUDENT"} disabled />
          </Field>
          <Field label="Account Status">
            <input className={input} value={user?.status || "ACTIVE"} disabled />
          </Field>
          <div className="sm:col-span-2">
            <button className={btn.primary}>Save changes</button>
          </div>
        </form>
      </Section>
    </StudentShell>
  );
}
