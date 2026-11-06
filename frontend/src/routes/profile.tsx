import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Field } from "@/components/AuthCard";
import { StudentShell } from "@/components/StudentShell";
import { PageHeader, Section, btn, input } from "@/components/ui-kit";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Lock, ShieldCheck, KeyRound } from "lucide-react";

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

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.auth.changePassword({
        currentPassword,
        newPassword,
      });

      toast.success(res.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password. Please check your current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <StudentShell>
      <PageHeader
        title="Profile & Security"
        description="Your personal details, department enrollments, and account credentials."
      />

      <div className="space-y-6 max-w-2xl">
        {/* Personal Information */}
        <Section title="Personal Information">
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

        {/* Change Password Card */}
        <Section
          title="Change Password"
          action={
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Encrypted & Secured</span>
            </div>
          }
        >
          <form className="space-y-4 p-4" onSubmit={handleChangePassword}>
            <Field label="Current Password">
              <div className="relative">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={input}
                  placeholder="Enter current password"
                />
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New Password">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={input}
                  placeholder="Min 6 characters"
                />
              </Field>

              <Field label="Confirm New Password">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={input}
                  placeholder="Re-enter new password"
                />
              </Field>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={passwordLoading} className={btn.primary}>
                {passwordLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Updating...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <KeyRound className="size-3.5" />
                    Update Password
                  </span>
                )}
              </button>
            </div>
          </form>
        </Section>
      </div>
    </StudentShell>
  );
}
