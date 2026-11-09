import { RefreshCw, Shield, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { PageHeader, StatusBadge, btn } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function StudentsSection() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.admin.listUsers({ limit: 100 });
      setStudents(Array.isArray(res) ? res : res?.data || res?.users || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleToggleUserStatus = async (userItem: any) => {
    const nextStatus = userItem.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api.admin.updateUserStatus(userItem.id, nextStatus);
      toast.success(`User ${userItem.fullName} marked as ${nextStatus}`);
      setStudents((prev) =>
        prev.map((s) => (s.id === userItem.id ? { ...s, status: nextStatus } : s)),
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    }
  };

  const handleToggleUserRole = async (userItem: any) => {
    const nextRole = userItem.role === "STUDENT" ? "ADMIN" : "STUDENT";
    if (
      !confirm(
        `Are you sure you want to change ${userItem.fullName}'s role from ${userItem.role} to ${nextRole}?`,
      )
    )
      return;
    try {
      await api.admin.updateUserRole(userItem.id, nextRole);
      toast.success(`Role updated to ${nextRole}`);
      setStudents((prev) => prev.map((s) => (s.id === userItem.id ? { ...s, role: nextRole } : s)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update user role");
    }
  };

  const actionBtn = (
    <button onClick={loadStudents} className={btn.outline} title="Refresh data">
      <RefreshCw className="size-4" /> Refresh
    </button>
  );

  return (
    <>
      <PageHeader
        title="Student Directory"
        description="Manage registered candidate accounts, access levels, and trial quotas."
        action={actionBtn}
      />

      <DataTable
        rows={students}
        loading={loading}
        search={(r) => `${r.fullName ?? ""} ${r.email ?? ""}`}
        filters={{
          label: "Statuses",
          key: (r) => r.status,
          options: ["ACTIVE", "SUSPENDED"],
        }}
        cols={[
          {
            h: "Candidate",
            r: (r) => (
              <div>
                <div className="font-medium">{r.fullName}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          {
            h: "Role",
            r: (r) => (
              <span
                className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${
                  r.role === "SUPER_ADMIN"
                    ? "text-purple-600"
                    : r.role === "ADMIN"
                      ? "text-brand"
                      : "text-muted-foreground"
                }`}
              >
                <Shield className="size-3" />
                {r.role}
              </span>
            ),
          },
          {
            h: "Trial Questions",
            r: (r) => (
              <span className="text-xs font-medium">
                {r.trialUsage
                  ? `${r.trialUsage.usedCount} / ${r.trialUsage.quotaLimit}`
                  : "0 / 5"}
              </span>
            ),
          },
          {
            h: "Status",
            r: (r) => <StatusBadge status={r.status === "ACTIVE" ? "Active" : "Rejected"} />,
          },
          {
            h: "Registered",
            r: (r) => (
              <span className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            ),
          },
        ]}
        actions={(r) => (
          <>
            <button
              onClick={() => handleToggleUserStatus(r)}
              className={`rounded p-1.5 transition-colors ${
                r.status === "ACTIVE"
                  ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  : "text-success hover:bg-success/10"
              }`}
              title={r.status === "ACTIVE" ? "Suspend user" : "Activate user"}
            >
              {r.status === "ACTIVE" ? (
                <UserX className="size-4" />
              ) : (
                <UserCheck className="size-4" />
              )}
            </button>
            {user?.role === "SUPER_ADMIN" && r.id !== user.id && (
              <button
                onClick={() => handleToggleUserRole(r)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title={r.role === "STUDENT" ? "Promote to Admin" : "Demote to Student"}
              >
                <Shield className="size-4" />
              </button>
            )}
          </>
        )}
      />
    </>
  );
}
