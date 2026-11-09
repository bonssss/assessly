import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { Modal } from "../Modal";
import { PageHeader, StatusBadge, btn, input } from "@/components/ui-kit";
import { api } from "@/lib/api";

interface ExamsSectionProps {
  departments: any[];
  getDeptName: (id: string) => string;
}

export function ExamsSection({ departments, getDeptName }: ExamsSectionProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newExam, setNewExam] = useState<{
    departmentId: string;
    title: string;
    durationMinutes: number;
    instructions: string;
    status: string;
    selectedQuestionIds: string[];
  }>({
    departmentId: "",
    title: "",
    durationMinutes: 60,
    instructions: "Answer all questions. Time strictly enforced.",
    status: "PUBLISHED",
    selectedQuestionIds: [],
  });

  const loadExamsAndQuestions = async () => {
    setLoading(true);
    try {
      const [examsRes, qsRes] = await Promise.all([
        api.exams.list({ limit: 100 }),
        api.questions.list({ limit: 100 }),
      ]);
      setExams(Array.isArray(examsRes) ? examsRes : examsRes?.exams || examsRes?.data || []);
      setQuestions(Array.isArray(qsRes) ? qsRes : qsRes?.questions || qsRes?.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load exams data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamsAndQuestions();
  }, []);

  useEffect(() => {
    if (departments.length > 0 && !newExam.departmentId) {
      setNewExam((prev) => ({ ...prev, departmentId: departments[0].id }));
    }
  }, [departments]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title.trim()) {
      toast.error("Exam title is required");
      return;
    }
    if (newExam.selectedQuestionIds.length === 0) {
      toast.error("Please select at least 1 question for this exam");
      return;
    }
    setSubmitting(true);
    try {
      await api.exams.create({
        departmentId: newExam.departmentId,
        title: newExam.title.trim(),
        durationMinutes: Number(newExam.durationMinutes),
        instructions: newExam.instructions.trim(),
        status: newExam.status,
        questionIds: newExam.selectedQuestionIds,
      });
      toast.success("Exam configured and published!");
      setShowExamModal(false);
      setNewExam({
        departmentId: departments[0]?.id || "",
        title: "",
        durationMinutes: 60,
        instructions: "Answer all questions. Time strictly enforced.",
        status: "PUBLISHED",
        selectedQuestionIds: [],
      });
      loadExamsAndQuestions();
    } catch (err: any) {
      toast.error(err.message || "Failed to create exam");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam configuration?")) return;
    try {
      await api.exams.delete(id);
      toast.success("Exam deleted");
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete exam");
    }
  };

  const actionBtn = (
    <button onClick={() => setShowExamModal(true)} className={btn.primary}>
      <Plus className="size-4" /> New Exam
    </button>
  );

  return (
    <>
      <PageHeader
        title="Timed Examinations"
        description="Configure exam durations, question sets, and evaluation policies."
        action={actionBtn}
      />

      <DataTable
        rows={exams}
        loading={loading}
        search={(r) => `${r.title} ${r.department?.name ?? ""}`}
        cols={[
          {
            h: "Exam Title",
            r: (r) => (
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">Policy: {r.feedbackPolicy}</div>
              </div>
            ),
          },
          {
            h: "Department",
            r: (r) => (
              <span className="text-xs font-medium">
                {r.department?.name ?? getDeptName(r.departmentId)}
              </span>
            ),
          },
          {
            h: "Duration",
            r: (r) => <span className="font-mono text-xs">{r.durationMinutes} min</span>,
          },
          {
            h: "Questions",
            r: (r) => {
              const count = r.questionCount ?? r.questions?.length ?? 0;
              return (
                <div>
                  <div className="text-xs font-semibold">
                    {count} {count === 1 ? "question" : "questions"}
                  </div>
                  {r.bankQuestionCount !== undefined && r.bankQuestionCount > 0 && (
                    <div className="text-[10px] text-muted-foreground">
                      {r.bankQuestionCount} in dept pool
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            h: "Status",
            r: (r) => <StatusBadge status={r.status === "PUBLISHED" ? "Published" : "Draft"} />,
          },
        ]}
        actions={(r) => (
          <button
            onClick={() => handleDeleteExam(r.id)}
            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Delete exam"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      />

      <Modal
        title="Configure Timed Exam"
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Exam Title</label>
            <input
              type="text"
              value={newExam.title}
              onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
              placeholder="e.g. Exit Exam Final Mock 2025"
              className={input}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <select
                value={newExam.departmentId}
                onChange={(e) => setNewExam({ ...newExam, departmentId: e.target.value })}
                className={input}
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={newExam.durationMinutes}
                onChange={(e) =>
                  setNewExam({ ...newExam, durationMinutes: Number(e.target.value) })
                }
                className={input}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Instructions</label>
            <textarea
              value={newExam.instructions}
              onChange={(e) => setNewExam({ ...newExam, instructions: e.target.value })}
              className={`${input} min-h-16 text-xs`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold">
                Select Questions ({newExam.selectedQuestionIds.length} selected)
              </label>
              {(() => {
                const deptQuestions = questions.filter(
                  (q) => !newExam.departmentId || q.departmentId === newExam.departmentId,
                );
                if (deptQuestions.length === 0) return null;
                const allSelected = deptQuestions.every((q) =>
                  newExam.selectedQuestionIds.includes(q.id),
                );
                return (
                  <button
                    type="button"
                    onClick={() => {
                      setNewExam({
                        ...newExam,
                        selectedQuestionIds: allSelected ? [] : deptQuestions.map((q) => q.id),
                      });
                    }}
                    className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                  >
                    {allSelected ? "Deselect All" : `Select All (${deptQuestions.length})`}
                  </button>
                );
              })()}
            </div>
            <div className="max-h-48 overflow-y-auto rounded border p-2 space-y-2 bg-muted/20">
              {questions
                .filter((q) => !newExam.departmentId || q.departmentId === newExam.departmentId)
                .map((q) => {
                  const isChecked = newExam.selectedQuestionIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className="flex items-start gap-2 text-xs p-1.5 rounded hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const updated = isChecked
                            ? newExam.selectedQuestionIds.filter((id) => id !== q.id)
                            : [...newExam.selectedQuestionIds, q.id];
                          setNewExam({ ...newExam, selectedQuestionIds: updated });
                        }}
                        className="mt-0.5 size-4 text-brand rounded"
                      />
                      <div className="flex-1">
                        <div className="line-clamp-1 font-medium">{q.body}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {q.topic ?? "General"} · {q.difficulty}
                        </div>
                      </div>
                    </label>
                  );
                })}
              {questions.filter(
                (q) => !newExam.departmentId || q.departmentId === newExam.departmentId,
              ).length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  No questions found for this department. Create questions first.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button type="button" onClick={() => setShowExamModal(false)} className={btn.ghost}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || newExam.selectedQuestionIds.length === 0}
              className={btn.primary}
            >
              {submitting ? "Publishing..." : "Publish Exam"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
