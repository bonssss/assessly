import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, CheckCircle2, CreditCard, Download, FileText, ListChecks } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { PageHeader, Section, Stat, StatusBadge, btn, td } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Assessly" },
      { name: "description", content: "Your exam preparation overview." },
      { property: "og:title", content: "Dashboard — Assessly" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [trialUsage, setTrialUsage] = useState<any>(null);
  const [entitlementStatus, setEntitlementStatus] = useState<any>(null);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
      return;
    }

    if (user) {
      Promise.all([
        api.auth.getMe().catch(() => null),
        api.entitlements.getStatus().catch(() => null),
        api.exams.getHistory().catch(() => []),
        api.questions.list({ limit: 4 }).catch(() => ({ questions: [] })),
      ]).then(([meData, entData, history, qData]) => {
        if (meData) {
          setDepartments(meData.departments || []);
          setTrialUsage(meData.trialUsage || null);
        }
        setEntitlementStatus(entData);
        setExamHistory(history || []);
        setRecentQuestions(qData?.questions || []);
        setLoading(false);
      });
    }
  }, [user, authLoading, navigate]);

  const completedExams = examHistory.filter((h) => h.status === "COMPLETED");
  const avgScore =
    completedExams.length > 0
      ? Math.round(
          completedExams.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0) /
            completedExams.length
        )
      : 0;

  const used = trialUsage?.usedCount ?? 0;
  const limit = trialUsage?.quotaLimit ?? 5;
  const isPaid = entitlementStatus?.hasActiveEntitlement;

  return (
    <StudentShell>
      <PageHeader
        title={`Welcome back, ${user?.fullName || "Student"}`}
        description="Exit exam preparation & practice dashboard"
        action={
          <Link to="/exams" className={btn.primary}>
            <FileText className="size-4" />
            Start Exam
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Free Questions Used"
          value={`${used}/${limit}`}
          hint={used >= limit ? "Trial quota reached" : `${limit - used} free questions remaining`}
          icon={ListChecks}
        />
        <Stat
          label="Completed Exams"
          value={String(completedExams.length)}
          hint={completedExams.length > 0 ? "Attempts recorded" : "No exams taken yet"}
          icon={CheckCircle2}
        />
        <Stat
          label="Average Score"
          value={completedExams.length > 0 ? `${avgScore}%` : "—"}
          hint="Pass mark is 50%"
          icon={Award}
        />
        <Stat
          label="Subscription Status"
          value={<StatusBadge status={isPaid ? "Approved" : used >= limit ? "Rejected" : "Pending"} />}
          hint={isPaid ? "Full access active" : "Purchase package for full access"}
          icon={CreditCard}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Section title="My Enrolled Departments" className="lg:col-span-1">
          <div className="divide-y">
            {departments.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No departments enrolled.</p>
            )}
            {departments.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.code}</div>
                </div>
                <StatusBadge status={isPaid ? "Approved" : "Pending"} />
              </div>
            ))}
          </div>
          <p className="border-t px-4 py-3 text-xs text-muted-foreground">
            {isPaid
              ? "All access is unlocked for your enrolled departments."
              : "Full access unlocks once your Telebirr or CBE payment is approved."}
          </p>
        </Section>

        <Section
          title="Practice Questions"
          className="lg:col-span-2"
          action={
            <Link to="/practice" className="text-sm text-brand font-medium">
              Open Practice Arena →
            </Link>
          }
        >
          <ul className="divide-y">
            {recentQuestions.length === 0 ? (
              <li className="p-4 text-sm text-muted-foreground">No questions loaded yet.</li>
            ) : (
              recentQuestions.map((q, i) => (
                <li key={q.id} className="flex items-start gap-4 px-4 py-3">
                  <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                    Q{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{q.body}</div>
                    <div className="text-xs text-muted-foreground">
                      {q.topic || "General"} · Difficulty: {q.difficulty}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Section>
      </div>

      <div className="mt-6">
        <Section
          title="Recent Exam Attempts"
          action={
            <Link to="/exams" className="text-sm text-brand font-medium">
              View All Exams →
            </Link>
          }
        >
          {examHistory.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No exam attempts recorded yet.</p>
          ) : (
            <table className="w-full">
              <tbody className="divide-y">
                {examHistory.slice(0, 5).map((attempt) => (
                  <tr key={attempt.id}>
                    <td className={td}>
                      <div className="font-medium">{attempt.exam?.title || "Timed Exam"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(attempt.startedAt).toLocaleDateString()} · Status: {attempt.status}
                      </div>
                    </td>
                    <td className={`${td} text-right font-semibold`}>
                      {attempt.percentage !== null ? `${attempt.percentage}%` : "In Progress"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </div>
    </StudentShell>
  );
}
