import { KeyRound, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section, btn, input } from "@/components/ui-kit";
import { api } from "@/lib/api";

export function SettingsSection() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    freeTrialQuestions: 5,
    telebirrNumber: "0911 234 567",
    telebirrInstructions: "Transfer via Telebirr and submit receipt.",
    cbeAccount: "1000 2345 6789 0",
    cbeInstructions: "Transfer to CBE account and attach receipt.",
    passMarkPercentage: 50,
  });

  const [adminPasswordForm, setAdminPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getSettings();
      const adminSettings = res?.data ?? res;
      if (adminSettings) {
        setSettingsForm({
          freeTrialQuestions: adminSettings.freeTrialQuestions ?? 5,
          telebirrNumber: adminSettings.telebirr?.accountNumber ?? "0911 234 567",
          telebirrInstructions: adminSettings.telebirr?.instructions ?? "",
          cbeAccount: adminSettings.cbe?.accountNumber ?? "1000 2345 6789 0",
          cbeInstructions: adminSettings.cbe?.instructions ?? "",
          passMarkPercentage: adminSettings.passMarkPercentage ?? 50,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.admin.updateSettings({
        telebirrNumber: settingsForm.telebirrNumber,
        telebirrInstructions: settingsForm.telebirrInstructions,
        cbeAccount: settingsForm.cbeAccount,
        cbeInstructions: settingsForm.cbeInstructions,
        freeTrialQuestions: Number(settingsForm.freeTrialQuestions),
        passMarkPercentage: Number(settingsForm.passMarkPercentage),
      });
      toast.success("Platform settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordForm.currentPassword) {
      toast.error("Please enter your current administrator password.");
      return;
    }
    if (adminPasswordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setPasswordUpdating(true);
    try {
      const res = await api.auth.changePassword({
        currentPassword: adminPasswordForm.currentPassword,
        newPassword: adminPasswordForm.newPassword,
      });
      toast.success(res.message || "Administrator password updated successfully!");
      setAdminPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to update administrator password.");
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Platform Settings"
        description="Configure payment gateway credentials, pass marks, and trial policies."
      />

      <div className="space-y-6 max-w-2xl">
        <Section title="System Settings & Payment Gateway">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-brand" />
              <span>Loading configuration...</span>
            </div>
          ) : (
            <form className="grid gap-5 p-5" onSubmit={handleSaveSettings}>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Free Trial Questions Quota
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Number of practice questions granted free to newly registered candidates.
                </p>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settingsForm.freeTrialQuestions}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, freeTrialQuestions: Number(e.target.value) })
                  }
                  className={input}
                  required
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-semibold mb-1">Telebirr Account Number</label>
                <input
                  type="text"
                  value={settingsForm.telebirrNumber}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, telebirrNumber: e.target.value })
                  }
                  className={input}
                  required
                />
                <label className="block text-xs font-medium text-muted-foreground mt-2 mb-1">
                  Telebirr Instructions
                </label>
                <textarea
                  value={settingsForm.telebirrInstructions}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, telebirrInstructions: e.target.value })
                  }
                  className={`${input} min-h-20`}
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-semibold mb-1">
                  Commercial Bank of Ethiopia (CBE) Account
                </label>
                <input
                  type="text"
                  value={settingsForm.cbeAccount}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cbeAccount: e.target.value })}
                  className={input}
                  required
                />
                <label className="block text-xs font-medium text-muted-foreground mt-2 mb-1">
                  CBE Transfer Instructions
                </label>
                <textarea
                  value={settingsForm.cbeInstructions}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, cbeInstructions: e.target.value })
                  }
                  className={`${input} min-h-20`}
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-semibold mb-1">Exam Pass Mark (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settingsForm.passMarkPercentage}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, passMarkPercentage: Number(e.target.value) })
                  }
                  className={input}
                  required
                />
              </div>

              <div className="border-t pt-4">
                <button type="submit" disabled={submitting} className={btn.primary}>
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Platform Settings"
                  )}
                </button>
              </div>
            </form>
          )}
        </Section>

        <Section
          title="Security & Administrator Credentials"
          action={
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="size-4 text-emerald-600" />
              <span>Privileged Account</span>
            </div>
          }
        >
          <form className="space-y-4 p-5" onSubmit={handleAdminChangePassword}>
            <div>
              <label className="block text-sm font-semibold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={adminPasswordForm.currentPassword}
                onChange={(e) =>
                  setAdminPasswordForm({ ...adminPasswordForm, currentPassword: e.target.value })
                }
                className={input}
                placeholder="Enter current password"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={adminPasswordForm.newPassword}
                  onChange={(e) =>
                    setAdminPasswordForm({ ...adminPasswordForm, newPassword: e.target.value })
                  }
                  className={input}
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={adminPasswordForm.confirmPassword}
                  onChange={(e) =>
                    setAdminPasswordForm({
                      ...adminPasswordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={input}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={passwordUpdating} className={btn.primary}>
                {passwordUpdating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <KeyRound className="size-4" />
                    Update Password
                  </span>
                )}
              </button>
            </div>
          </form>
        </Section>
      </div>
    </>
  );
}
