import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, PlayCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/StudentShell";
import { PageHeader, Section, StatusBadge, btn, td, th } from "@/components/ui-kit";
import { api } from "@/lib/api";

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [
      { title: "My Exams — Assessly" },
      { name: "description", content: "Timed mock exams and quizzes for your enrolled departments." },
      { property: "og:title", content: "My Exams — Assessly" },
    ],
  }),
  component: ExamsComponent,
});

function ExamsComponent() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.exams
      .list()
      .then((data) => {
        setExams(data?.exams || []);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load exams");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <StudentShell>
      <PageHeader
        title="Timed Examinations"
        description="Official department exit exams and timed quizzes with automated grading."
      />
      <Section title="Available Exams">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading exams...</p>
          ) : exams.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No exams currently published for your department.</p>
          ) : (
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  {["Exam Title", "Department", "Questions", "Duration", "Feedback Policy", ""].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {exams.map((e) => (
                  <tr key={e.id}>
                    <td className={`${td} font-medium`}>
                      <div>{e.title}</div>
                      {e.instructions && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">{e.instructions}</div>
                      )}
                    </td>
                    <td className={td}>{e.department?.name || e.department?.code}</td>
                    <td className={td}>{e.questionCount} questions</td>
                    <td className={td}>{e.durationMinutes} min</td>
                    <td className={td}>
                      <span className="text-xs font-medium rounded bg-muted px-2 py-0.5">
                        {e.feedbackPolicy}
                      </span>
                    </td>
                    <td className={`${td} text-right`}>
                      <Link
                        to="/exam"
                        search={{ examId: e.id }}
                        className={`${btn.primary} text-xs px-3 py-1.5 inline-flex items-center gap-1.5`}
                      >
                        <PlayCircle className="size-3.5" /> Start Exam
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Section>
    </StudentShell>
  );
}
