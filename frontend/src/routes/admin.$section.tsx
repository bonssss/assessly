import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  X,
  Shield,
  FileText,
  KeyRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/AdminShell";
import { PageHeader, Section, StatusBadge, btn, input, td, th } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const titles: Record<string, [string, string]> = {
  questions: ["Question Bank", "Create, manage, and assign examination questions by department."],
  departments: ["Academic Departments", "Manage university faculties, curricula, and enrollments."],
  resources: [
    "Learning Resources",
    "Upload lecture notes, past papers, worksheets, and study guides.",
  ],
  students: [
    "Student Directory",
    "Manage registered candidate accounts, access levels, and trial quotas.",
  ],
  payments: [
    "Payment Verification",
    "Review submitted bank receipts, approve transactions, and grant access.",
  ],
  exams: [
    "Timed Examinations",
    "Configure exam durations, question sets, and evaluation policies.",
  ],
  reports: [
    "Performance Reports",
    "Department-level analytics, student completion metrics, and pass rates.",
  ],
  settings: [
    "Platform Settings",
    "Configure payment gateway credentials, pass marks, and trial policies.",
  ],
};

export const Route = createFileRoute("/admin/$section")({
  beforeLoad: ({ params }) => {
    if (!titles[params.section]) throw notFound();
  },
  head: ({ params }) => {
    const pageTitle = `${titles[params.section]?.[0] ?? "Admin"} — Assessly Portal`;
    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: titles[params.section]?.[1] ?? "" },
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: titles[params.section]?.[1] ?? "" },
      ],
    };
  },
  component: AdminSectionComponent,
});

type Col<T> = { h: string; r: (row: T) => ReactNode };
const PAGE_SIZE = 8;

function DataTable<T extends { id: string }>({
  rows,
  cols,
  search,
  filters,
  actions,
  loading = false,
}: {
  rows: T[];
  cols: Col<T>[];
  search: (r: T) => string;
  filters?: { label?: string; key: (r: T) => string; options: string[] };
  actions?: (r: T) => ReactNode;
  loading?: boolean;
}) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const [page, setPage] = useState(0);

  const list = useMemo(() => {
    return rows.filter(
      (r) =>
        search(r).toLowerCase().includes(q.toLowerCase()) &&
        (f === "All" || filters?.key(r).toUpperCase() === f.toUpperCase()),
    );
  }, [rows, q, f, search, filters]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const view = list.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <Section
      title={`${list.length} records`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="Search..."
              className={`${input} w-44 py-1.5 pl-8 text-xs sm:w-56`}
            />
          </div>
          {filters && (
            <select
              value={f}
              onChange={(e) => {
                setF(e.target.value);
                setPage(0);
              }}
              className={`${input} w-auto py-1.5 text-xs`}
            >
              <option value="All">All {filters.label ?? "Statuses"}</option>
              {filters.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/40">
            <tr>
              {cols.map((c) => (
                <th key={c.h} className={th}>
                  {c.h}
                </th>
              ))}
              {actions && <th className={`${th} text-right`}>Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={cols.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-brand" />
                    <span>Loading data from server...</span>
                  </div>
                </td>
              </tr>
            ) : view.length === 0 ? (
              <tr>
                <td
                  colSpan={cols.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No records match your criteria.
                </td>
              </tr>
            ) : (
              view.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-muted/30">
                  {cols.map((c) => (
                    <td key={c.h} className={td}>
                      {c.r(r)}
                    </td>
                  ))}
                  {actions && (
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-1.5">{actions(r)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
        <span>
          Page {page + 1} of {pages} ({list.length} total)
        </span>
        <div className="flex gap-1">
          <button
            className={btn.ghost}
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            className={btn.ghost}
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </Section>
  );
}

function Modal({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AdminSectionComponent() {
  const { section } = Route.useParams();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Modals state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Bulk Import Questions State
  const [importDeptId, setImportDeptId] = useState("");
  const [importCsvText, setImportCsvText] = useState("");
  const [importing, setImporting] = useState(false);

  // Question Form State
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

  // Department Form State
  const [newDept, setNewDept] = useState({ code: "", name: "", description: "" });

  // Resource Form State
  const [newResource, setNewResource] = useState<{
    title: string;
    departmentId: string;
    accessLevel: string;
    file: File | null;
  }>({
    title: "",
    departmentId: "",
    accessLevel: "FREE",
    file: null,
  });

  // Exam Form State
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

  // Settings Form State
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
  const [passwordUpdating, setPasswordUpdating] = useState(false);

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

  const [submitting, setSubmitting] = useState(false);

  // Fetch data per active section
  const loadSectionData = async () => {
    setLoading(true);
    try {
      // Always ensure departments are loaded
      const depts = await api.departments.list().catch(() => []);
      setDepartments(depts);
      if (depts.length > 0 && !newQ.departmentId) {
        setNewQ((q) => ({ ...q, departmentId: depts[0].id }));
        setNewResource((r) => ({ ...r, departmentId: depts[0].id }));
        setNewExam((e) => ({ ...e, departmentId: depts[0].id }));
      }

      const sectionLoaders: Record<string, () => Promise<void>> = {
        questions: async () => {
          const res = await api.questions.list({ limit: 100 });
          setQuestions(Array.isArray(res) ? res : res?.questions || res?.data || []);
        },
        departments: async () => {
          setDepartments(Array.isArray(depts) ? depts : depts?.data || []);
        },
        resources: async () => {
          const res = await api.resources.list();
          setResources(Array.isArray(res) ? res : res?.data || res?.resources || []);
        },
        students: async () => {
          const res = await api.admin.listUsers({ limit: 100 });
          setStudents(Array.isArray(res) ? res : res?.data || res?.users || []);
        },
        payments: async () => {
          const res = await api.payments.listAdminPayments();
          setPayments(Array.isArray(res) ? res : res?.data || res?.payments || []);
        },
        exams: async () => {
          const [examsRes, qsRes] = await Promise.all([
            api.exams.list({ limit: 100 }),
            api.questions.list({ limit: 100 }),
          ]);
          setExams(Array.isArray(examsRes) ? examsRes : examsRes?.exams || examsRes?.data || []);
          setQuestions(Array.isArray(qsRes) ? qsRes : qsRes?.questions || qsRes?.data || []);
        },
        reports: async () => {
          const res = await api.admin.getDepartmentReports();
          setReports(Array.isArray(res) ? res : res?.data || []);
        },
        settings: async () => {
          const res = await api.admin.getSettings();
          const adminSettings = res?.data ?? res;
          if (adminSettings) {
            setSettings(adminSettings);
            setSettingsForm({
              freeTrialQuestions: adminSettings.freeTrialQuestions ?? 5,
              telebirrNumber: adminSettings.telebirr?.accountNumber ?? "0911 234 567",
              telebirrInstructions: adminSettings.telebirr?.instructions ?? "",
              cbeAccount: adminSettings.cbe?.accountNumber ?? "1000 2345 6789 0",
              cbeInstructions: adminSettings.cbe?.instructions ?? "",
              passMarkPercentage: adminSettings.passMarkPercentage ?? 50,
            });
          }
        },
      };

      const handler = sectionLoaders[section];
      if (handler) {
        await handler();
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to load ${section} data`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        toast.error("Administrator privileges required.");
        navigate({ to: "/login" });
        return;
      }
      loadSectionData();
    }
  }, [section, user, isAdmin, authLoading]);

  // Actions
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
      loadSectionData();
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
      loadSectionData();
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

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.code.trim() || !newDept.name.trim()) {
      toast.error("Code and Name are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.departments.create({
        code: newDept.code.trim().toUpperCase(),
        name: newDept.name.trim(),
        description: newDept.description.trim() || undefined,
      });
      toast.success(`Department ${newDept.name} created!`);
      setShowDeptModal(false);
      setNewDept({ code: "", name: "", description: "" });
      loadSectionData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title.trim() || !newResource.file) {
      toast.error("Title and File are required");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", newResource.title.trim());
      fd.append("departmentId", newResource.departmentId);
      fd.append("accessLevel", newResource.accessLevel);
      fd.append("file", newResource.file);

      await api.resources.upload(fd);
      toast.success("Resource uploaded successfully!");
      setShowResourceModal(false);
      setNewResource({
        title: "",
        departmentId: departments[0]?.id || "",
        accessLevel: "FREE",
        file: null,
      });
      loadSectionData();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to remove this resource?")) return;
    try {
      await api.resources.delete(id);
      toast.success("Resource deleted");
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete resource");
    }
  };

  const handleDownloadResource = async (id: string, title: string) => {
    try {
      const res = await api.resources.getDownloadUrl(id);
      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not retrieve download link");
    }
  };

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

  const handleApprovePayment = async (id: string) => {
    try {
      await api.payments.approve(id, "Verified by Admin");
      toast.success("Payment approved and student entitlement activated!");
      loadSectionData();
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleRejectPayment = async (id: string) => {
    const reason = prompt("Enter rejection reason for the candidate:") || "Receipt illegible";
    try {
      await api.payments.reject(id, reason);
      toast.success("Payment rejected.");
      loadSectionData();
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    }
  };

  const handleViewReceipt = async (paymentId: string) => {
    try {
      const res = await api.payments.getReceiptUrl(paymentId);
      if (res.previewUrl) {
        setPreviewReceiptUrl(res.previewUrl);
      } else {
        toast.info("No preview URL returned for receipt");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not load receipt preview");
    }
  };

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
      loadSectionData();
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

  const [title, desc] = titles[section]!;
  const getDeptName = (idOrCode: string) =>
    departments.find((d) => d.id === idOrCode || d.code === idOrCode)?.name ?? idOrCode;

  let body: ReactNode;
  switch (section) {
    case "questions":
      body = (
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
      );
      break;

    case "departments":
      body = (
        <DataTable
          rows={departments}
          loading={loading}
          search={(r) => `${r.name} ${r.code}`}
          cols={[
            { h: "Code", r: (r) => <span className="font-mono font-semibold">{r.code}</span> },
            {
              h: "Name",
              r: (r) => (
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {r.description}
                    </div>
                  )}
                </div>
              ),
            },
            {
              h: "Questions",
              r: (r) => <span className="font-medium">{r._count?.questions ?? "—"}</span>,
            },
            {
              h: "Resources",
              r: (r) => <span>{r._count?.resources ?? "—"}</span>,
            },
            {
              h: "Exams",
              r: (r) => <span>{r._count?.exams ?? "—"}</span>,
            },
            { h: "Status", r: () => <StatusBadge status="Active" /> },
          ]}
        />
      );
      break;

    case "resources":
      body = (
        <DataTable
          rows={resources}
          loading={loading}
          search={(r) => `${r.title} ${r.fileType ?? ""}`}
          filters={{
            label: "Access",
            key: (r) => r.accessLevel,
            options: ["FREE", "PAID"],
          }}
          cols={[
            {
              h: "Title",
              r: (r) => (
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.fileType ?? "Document"} · {Math.round((r.fileSizeBytes || 0) / 1024)} KB
                  </div>
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
              h: "Access Tier",
              r: (r) => <StatusBadge status={r.accessLevel === "PAID" ? "Trial" : "Available"} />,
            },
            {
              h: "Uploaded",
              r: (r) => (
                <span className="text-xs text-muted-foreground">
                  {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                </span>
              ),
            },
          ]}
          actions={(r) => (
            <>
              <button
                onClick={() => handleDownloadResource(r.id, r.title)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Download / View"
              >
                <Download className="size-4" />
              </button>
              <button
                onClick={() => handleDeleteResource(r.id)}
                className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Delete resource"
              >
                <Trash2 className="size-4" />
              </button>
            </>
          )}
        />
      );
      break;

    case "students":
      body = (
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
      );
      break;

    case "payments":
      body = (
        <DataTable
          rows={payments}
          loading={loading}
          search={(r) => `${r.user?.fullName ?? ""} ${r.transactionRef} ${r.channel}`}
          filters={{
            label: "Statuses",
            key: (r) => r.status,
            options: ["PENDING", "APPROVED", "REJECTED"],
          }}
          cols={[
            {
              h: "Reference",
              r: (r) => <span className="font-mono text-xs font-semibold">{r.transactionRef}</span>,
            },
            {
              h: "Candidate",
              r: (r) => (
                <div>
                  <div className="font-medium text-xs">{r.user?.fullName || "Student"}</div>
                  <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                </div>
              ),
            },
            {
              h: "Package",
              r: (r) => <span className="text-xs">{r.package?.name ?? "Access Plan"}</span>,
            },
            {
              h: "Amount",
              r: (r) => (
                <span className="font-semibold text-xs">
                  {Number(r.amount).toLocaleString()} ETB
                </span>
              ),
            },
            {
              h: "Channel",
              r: (r) => <span className="text-xs">{r.channel}</span>,
            },
            {
              h: "Status",
              r: (r) => (
                <StatusBadge
                  status={
                    r.status === "APPROVED"
                      ? "Approved"
                      : r.status === "REJECTED"
                        ? "Rejected"
                        : "Pending"
                  }
                />
              ),
            },
          ]}
          actions={(r) => (
            <>
              <button
                onClick={() => handleViewReceipt(r.id)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="View uploaded receipt"
              >
                <Eye className="size-4" />
              </button>
              {r.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleApprovePayment(r.id)}
                    className="inline-flex items-center gap-1 rounded border border-success/40 px-2 py-1 text-xs font-medium text-success hover:bg-success/10 transition-colors"
                  >
                    <Check className="size-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectPayment(r.id)}
                    className="inline-flex items-center gap-1 rounded border border-destructive/40 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="size-3.5" /> Reject
                  </button>
                </>
              )}
            </>
          )}
        />
      );
      break;

    case "exams":
      body = (
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
      );
      break;

    case "reports":
      body = (
        <DataTable
          rows={reports}
          loading={loading}
          search={(r) => `${r.name} ${r.code}`}
          cols={[
            {
              h: "Department",
              r: (r) => (
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{r.code}</div>
                </div>
              ),
            },
            { h: "Active Students", r: (r) => <span>{r.students}</span> },
            { h: "Question Bank", r: (r) => <span>{r.questions}</span> },
            { h: "Exams Configured", r: (r) => <span>{r.exams}</span> },
            { h: "Exams Taken", r: (r) => <span>{r.examsTaken}</span> },
            {
              h: "Avg Score",
              r: (r) => <span className="font-semibold text-brand">{r.avgScore}%</span>,
            },
            {
              h: "Pass Rate",
              r: (r) => (
                <span
                  className={`font-semibold ${r.passRate >= 60 ? "text-success" : "text-warning"}`}
                >
                  {r.passRate}%
                </span>
              ),
            },
          ]}
        />
      );
      break;

    case "settings":
      body = (
        <div className="space-y-6 max-w-2xl">
          <Section title="System Settings & Payment Gateway">
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
      );
      break;

    default:
      body = null;
  }

  // Header button configuration
  const actionBtn = useMemo(() => {
    switch (section) {
      case "questions":
        return (
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
      case "departments":
        return (
          <button onClick={() => setShowDeptModal(true)} className={btn.primary}>
            <Plus className="size-4" /> New Department
          </button>
        );
      case "resources":
        return (
          <button onClick={() => setShowResourceModal(true)} className={btn.primary}>
            <Plus className="size-4" /> Upload Resource
          </button>
        );
      case "exams":
        return (
          <button onClick={() => setShowExamModal(true)} className={btn.primary}>
            <Plus className="size-4" /> New Exam
          </button>
        );
      default:
        return (
          <button onClick={loadSectionData} className={btn.outline} title="Refresh data">
            <RefreshCw className="size-4" /> Refresh
          </button>
        );
    }
  }, [section, departments]);

  return (
    <AdminShell>
      <PageHeader title={title} description={desc} action={actionBtn} />

      {body}

      {/* MODAL: New Question */}
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

      {/* MODAL: Bulk Import Questions */}
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

      {/* MODAL: New Department */}
      <Modal
        title="Add Academic Department"
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Code (Unique)</label>
            <input
              type="text"
              value={newDept.code}
              onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
              placeholder="e.g. CS, EE, MED, LAW"
              className={input}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Department Name</label>
            <input
              type="text"
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              placeholder="e.g. Computer Science & Software Engineering"
              className={input}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              value={newDept.description}
              onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
              placeholder="Curriculum overview..."
              className={`${input} min-h-20 text-xs`}
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <button type="button" onClick={() => setShowDeptModal(false)} className={btn.ghost}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={btn.primary}>
              {submitting ? "Creating..." : "Create Department"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Upload Resource */}
      <Modal
        title="Upload Learning Resource"
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
      >
        <form onSubmit={handleUploadResource} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Title</label>
            <input
              type="text"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              placeholder="e.g. Midterm 2024 Solution Guide"
              className={input}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <select
                value={newResource.departmentId}
                onChange={(e) => setNewResource({ ...newResource, departmentId: e.target.value })}
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
              <label className="block text-xs font-semibold mb-1">Access Level</label>
              <select
                value={newResource.accessLevel}
                onChange={(e) => setNewResource({ ...newResource, accessLevel: e.target.value })}
                className={input}
              >
                <option value="FREE">FREE</option>
                <option value="PAID">PAID</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">File Attachment (PDF, DOCX)</label>
            <input
              type="file"
              onChange={(e) =>
                setNewResource({
                  ...newResource,
                  file: e.target.files ? e.target.files[0] : null,
                })
              }
              className={`${input} file:mr-2 file:rounded file:border-0 file:bg-brand file:px-2 file:py-1 file:text-xs file:text-brand-foreground cursor-pointer`}
              required
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <button type="button" onClick={() => setShowResourceModal(false)} className={btn.ghost}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={btn.primary}>
              {submitting ? "Uploading..." : "Upload Resource"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: New Exam */}
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

      {/* MODAL: Receipt Preview */}
      <Modal
        title="Candidate Receipt Preview"
        isOpen={!!previewReceiptUrl}
        onClose={() => setPreviewReceiptUrl(null)}
      >
        <div className="space-y-4">
          {previewReceiptUrl && (
            <div className="overflow-hidden rounded-lg border bg-muted/20 text-center">
              <img
                src={previewReceiptUrl}
                alt="Payment receipt proof"
                className="max-h-[70vh] w-auto mx-auto object-contain"
                onError={(e) => {
                  // If image fails, render link fallback
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="p-4">
                <a
                  href={previewReceiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={btn.outline}
                >
                  <FileText className="size-4" /> Open Receipt in New Tab
                </a>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AdminShell>
  );
}
