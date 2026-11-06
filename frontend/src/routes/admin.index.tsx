import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, FileQuestion, TrendingUp, Users, Check, X, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/AdminShell";
import { PageHeader, Section, Stat, StatusBadge, btn, td, th } from "@/components/ui-kit";
import { AdminAnalyticsChart } from "@/components/AdminAnalyticsChart";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Assessly" },
      { name: "description", content: "Platform overview and real-time operations." },
      { property: "og:title", content: "Admin — Assessly" },
    ],
  }),
  component: AdminDashboardComponent,
});

function AdminDashboardComponent() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentReports, setDepartmentReports] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [overviewData, pendingRes, deptReports] = await Promise.all([
        api.admin.getOverviewKPIs().catch(() => null),
        api.payments.listPendingPayments({ limit: 5 }).catch(() => ({ payments: [] })),
        api.admin.getDepartmentReports().catch(() => []),
      ]);

      if (overviewData) {
        setKpis(overviewData.kpis);
        setDepartments(overviewData.departmentBreakdown || []);
        setRecentActivity(overviewData.recentActivity || []);
        setPaymentBreakdown(overviewData.kpis?.monetization?.paymentBreakdown || []);
      }
      setDepartmentReports(deptReports || []);
      setPendingPayments(pendingRes?.payments || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load admin overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        toast.error("Administrator access required.");
        navigate({ to: "/login" });
        return;
      }
      loadData();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleApprove = async (paymentId: string) => {
    try {
      await api.payments.approve(paymentId, "Approved via dashboard");
      toast.success("Payment approved & entitlement activated!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleReject = async (paymentId: string) => {
    const reason = prompt("Enter rejection reason for the student:") || "Receipt illegible";
    try {
      await api.payments.reject(paymentId, reason);
      toast.success("Payment rejected.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    }
  };

  return (
    <AdminShell>
      <PageHeader
        title="System Overview"
        description="Real-time KPI metrics, revenue telemetry, and pending verification queue"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Total Students"
          value={kpis ? String(kpis.users.totalStudents) : "—"}
          hint="Registered candidates"
          icon={Users}
        />
        <Stat
          label="Pending Payments"
          value={kpis ? String(kpis.monetization.pendingPayments) : "—"}
          hint="Awaiting verification"
          icon={CreditCard}
        />
        <Stat
          label="Total Revenue"
          value={kpis ? `${Number(kpis.monetization.totalRevenueETB).toLocaleString()} ETB` : "—"}
          hint="Approved payments"
          icon={TrendingUp}
        />
        <Stat
          label="Published Questions"
          value={kpis ? String(kpis.content.totalQuestions) : "—"}
          hint={`${kpis?.content?.totalExams || 0} exams configured`}
          icon={FileQuestion}
        />
      </div>

      {/* Admin Visual Analytics & Telemetry Graphs */}
      <div className="mt-6">
        <AdminAnalyticsChart
          departmentReports={departmentReports}
          paymentBreakdown={paymentBreakdown}
          recentActivity={recentActivity}
          totalRevenue={Number(kpis?.monetization?.totalRevenueETB || 0)}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Section
          title="Payments Awaiting Review"
          action={
            <Link
              to="/admin/$section"
              params={{ section: "payments" }}
              className="text-sm text-brand font-medium"
            >
              Review all payments →
            </Link>
          }
        >
          {pendingPayments.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Queue is clean! No payments currently pending review.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    {["Student", "Package", "Amount", "Reference", "Actions"].map((h) => (
                      <th key={h} className={th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingPayments.map((p) => (
                    <tr key={p.id}>
                      <td className={`${td} font-medium`}>
                        <div>{p.user?.fullName}</div>
                        <div className="text-xs text-muted-foreground">{p.user?.email}</div>
                      </td>
                      <td className={td}>{p.package?.name}</td>
                      <td className={td}>
                        {Number(p.amount).toLocaleString()} {p.currency}
                      </td>
                      <td className={`${td} font-mono text-xs`}>{p.transactionReference}</td>
                      <td className={`${td} text-right space-x-1`}>
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="inline-flex items-center gap-1 rounded border border-success/40 px-2 py-1 text-xs font-medium text-success hover:bg-success/10"
                        >
                          <Check className="size-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="inline-flex items-center gap-1 rounded border border-destructive/40 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                        >
                          <X className="size-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Department Health">
          <ul className="divide-y">
            {departments.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">No departments configured.</li>
            )}
            {departments.map((d) => (
              <li key={d.id} className="px-4 py-3 text-sm">
                <div className="flex justify-between font-medium">
                  <span>{d.name}</span>
                  <span className="text-muted-foreground">{d.questionsCount} Qs</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{d.enrolledStudents} students enrolled</span>
                  <span>{d.examsCount} exams</span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </AdminShell>
  );
}
