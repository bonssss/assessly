import { Download, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { Modal } from "../Modal";
import { PageHeader, StatusBadge, btn, input } from "@/components/ui-kit";
import { api } from "@/lib/api";

interface QuestionsSectionProps {
  departments: any[];
  getDeptName: (id: string) => string;
}

export function QuestionsSection({ departments, getDeptName }: QuestionsSectionProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDeptId, setImportDeptId] = useState("");
  const [importCsvText, setImportCsvText] = useState("");

  const [newQ, setNewQ] = useState({
    departmentId: "",
    body: "",
    topic: "",
    difficulty: "MEDIUM",
    marks: 1.0,
    explanation: "",
    status: "PUBLISHED",
    options: [
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
  });

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.questions.list({ limit: 100 });
      setQuestions(Array.isArray(res) ? res : res?.questions || res?.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (departments.length > 0 && !newQ.departmentId) {
      setNewQ((prev) => ({ ...prev, departmentId: departments[0].id }));
    }
  }, [departments]);

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this question?")) return;
    try {
      await api.questions.deleteQuestion(id);
      toast.success("Question deleted successfully");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question");
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.body.trim()) {
      toast.error("Question body cannot be empty");
      return;
    }
    const hasEmpty = newQ.options.some((o) => !o.optionText.trim());
    if (hasEmpty) {
      toast.error("Please fill in all 4 option choices");
      return;
    }
    setSubmitting(true);
    try {
      await api.questions.createQuestion({
        ...newQ,
        options: newQ.options.map((opt, i) => ({
          optionText: opt.optionText.trim(),
          isCorrect: opt.isCorrect,
          sortOrder: i,
        })),
      });
      toast.success("Question created and published to bank!");
      setShowQuestionModal(false);
      setNewQ({
        departmentId: departments[0]?.id || "",
        body: "",
        topic: "",
        difficulty: "MEDIUM",
        marks: 1.0,
        explanation: "",
        status: "PUBLISHED",
        options: [
          { optionText: "", isCorrect: true },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ],
      });
      loadQuestions();
    } catch (err: any) {
      toast.error(err.message || "Failed to create question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetDept = importDeptId || departments[0]?.id;
    if (!targetDept) {
      toast.error("Please select a target department");
      return;
    }
    if (!importCsvText.trim()) {
      toast.error("Please provide CSV content or upload a file");
      return;
    }
    setImporting(true);
    try {
      const res = await api.questions.bulkImport({
        departmentId: targetDept,
        csvText: importCsvText,
      });
      toast.success(res.message || `Successfully imported ${res.importedCount} questions!`);
      setShowBulkImportModal(false);
      setImportCsvText("");
      loadQuestions();
    } catch (err: any) {
      toast.error(err.message || "Failed to import questions");
    } finally {
      setImporting(false);
    }
  };

  const downloadCsvTemplate = () => {
    const template = `Body,Topic,Difficulty,Marks,Explanation,OptionA,OptionB,OptionC,OptionD,CorrectOption
"What is the time complexity of binary search on a sorted array of size n?","Algorithms","EASY",1,"Binary search divides the search space in half each step.","O(n)","O(log n)","O(n log n)","O(1)","B"
"Which layer of the OSI model is responsible for end-to-end packet routing?","Networking","MEDIUM",1,"The Network layer handles logical addressing and routing.","Data Link","Transport","Network","Physical","C"`;
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.download = "assessly_questions_template.csv";
    downloadAnchor.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  const actionBtn = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          if (departments.length > 0 && !importDeptId) {
            setImportDeptId(departments[0].id);
          }
          setShowBulkImportModal(true);
        }}
        className={btn.secondary}
      >
        <Upload className="size-4" /> Bulk Import
      </button>
      <button onClick={() => setShowQuestionModal(true)} className={btn.primary}>
        <Plus className="size-4" /> New Question
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Question Bank"
        description="Create, manage, and assign examination questions by department."
        action={actionBtn}
      />

      <DataTable
        rows={questions}
        loading={loading}
        search={(r) => `${r.body} ${r.topic ?? ""} ${r.difficulty}`}
        filters={{
          label: "Statuses",
          key: (r) => r.status,
          options: ["PUBLISHED", "DRAFT"],
        }}
        cols={[
          {
            h: "Question",
            r: (r) => (
              <div className="max-w-md">
                <div className="line-clamp-2 font-medium">{r.body}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {r.options?.length ?? 0} options · {r.marks} marks · {r.difficulty}
                </div>
              </div>
            ),
          },
          {
            h: "Department",
            r: (r) => (
              <span className="font-medium text-xs">
                {r.department?.name ?? getDeptName(r.departmentId)}
              </span>
            ),
          },
          { h: "Topic", r: (r) => <span className="text-xs">{r.topic || "General"}</span> },
          {
            h: "Status",
            r: (r) => <StatusBadge status={r.status === "PUBLISHED" ? "Published" : "Draft"} />,
          },
        ]}
        actions={(r) => (
          <button
            onClick={() => handleDeleteQuestion(r.id)}
            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Delete question"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      />

      <Modal
        title="Add New Question to Bank"
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Department</label>
            <select
              value={newQ.departmentId}
              onChange={(e) => setNewQ({ ...newQ, departmentId: e.target.value })}
              className={input}
              required
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Question Body / Stem</label>
            <textarea
              value={newQ.body}
              onChange={(e) => setNewQ({ ...newQ, body: e.target.value })}
              placeholder="Enter the question text here..."
              className={`${input} min-h-24`}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Topic</label>
              <input
                type="text"
                value={newQ.topic}
                onChange={(e) => setNewQ({ ...newQ, topic: e.target.value })}
                placeholder="e.g. Algorithms"
                className={input}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Difficulty</label>
              <select
                value={newQ.difficulty}
                onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })}
                className={input}
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2">
              Options (Check the radio of the correct answer)
            </label>
            <div className="space-y-2">
              {newQ.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.isCorrect}
                    onChange={() => {
                      const updated = newQ.options.map((o, i) => ({
                        ...o,
                        isCorrect: i === idx,
                      }));
                      setNewQ({ ...newQ, options: updated });
                    }}
                    className="size-4 text-brand cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold text-muted-foreground w-4">
                    {"ABCD"[idx]}
                  </span>
                  <input
                    type="text"
                    value={opt.optionText}
                    onChange={(e) => {
                      const updated = [...newQ.options];
                      updated[idx].optionText = e.target.value;
                      setNewQ({ ...newQ, options: updated });
                    }}
                    placeholder={`Option choice ${"ABCD"[idx]}`}
                    className={`${input} py-1.5 text-xs`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Explanation (Revealed after submission)
            </label>
            <textarea
              value={newQ.explanation}
              onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
              placeholder="Why this answer is correct..."
              className={`${input} min-h-16 text-xs`}
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button type="button" onClick={() => setShowQuestionModal(false)} className={btn.ghost}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={btn.primary}>
              {submitting ? "Saving..." : "Create Question"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Bulk Import Questions (CSV / Excel)"
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
      >
        <form onSubmit={handleBulkImport} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Target Department</label>
            <select
              value={importDeptId || (departments[0]?.id ?? "")}
              onChange={(e) => setImportDeptId(e.target.value)}
              className={input}
              required
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Need the CSV template?</span>
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="size-3.5" /> Download Sample CSV
              </button>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Format:{" "}
              <code>
                Body, Topic, Difficulty, Marks, Explanation, OptionA, OptionB, OptionC, OptionD,
                CorrectOption
              </code>{" "}
              (where CorrectOption is A, B, C, or D).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Upload CSV File</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Or Paste CSV Text</label>
            <textarea
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              placeholder={
                'Body,Topic,Difficulty,Marks,Explanation,OptionA,OptionB,OptionC,OptionD,CorrectOption\n"Sample Question?","General","MEDIUM",1,"Explanation","Choice A","Choice B","Choice C","Choice D","A"'
              }
              className={`${input} min-h-32 font-mono text-xs`}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowBulkImportModal(false)}
              className={btn.ghost}
              disabled={importing}
            >
              Cancel
            </button>
            <button type="submit" className={btn.primary} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  <span>Import Questions</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

