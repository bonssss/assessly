import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/AdminShell";
import { QuestionsSection } from "@/components/admin/sections/QuestionsSection";
import { DepartmentsSection } from "@/components/admin/sections/DepartmentsSection";
import { ResourcesSection } from "@/components/admin/sections/ResourcesSection";
import { StudentsSection } from "@/components/admin/sections/StudentsSection";
import { PaymentsSection } from "@/components/admin/sections/PaymentsSection";
import { ExamsSection } from "@/components/admin/sections/ExamsSection";
import { ReportsSection } from "@/components/admin/sections/ReportsSection";
import { SettingsSection } from "@/components/admin/sections/SettingsSection";
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

function AdminSectionComponent() {
  const { section } = Route.useParams();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const loadDepartments = async () => {
    setLoadingDepts(true);
    try {
      const depts = await api.departments.list().catch(() => []);
      setDepartments(Array.isArray(depts) ? depts : depts?.data || []);
    } catch {
      // silently handle
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        toast.error("Administrator privileges required.");
        navigate({ to: "/login" });
        return;
      }
      loadDepartments();
    }
  }, [user, isAdmin, authLoading]);

  const getDeptName = (idOrCode: string) =>
    departments.find((d) => d.id === idOrCode || d.code === idOrCode)?.name ?? idOrCode;

  const renderSection = () => {
    switch (section) {
      case "questions":
        return <QuestionsSection departments={departments} getDeptName={getDeptName} />;
      case "departments":
        return (
          <DepartmentsSection
            departments={departments}
            loading={loadingDepts}
            onRefresh={loadDepartments}
          />
        );
      case "resources":
        return <ResourcesSection departments={departments} getDeptName={getDeptName} />;
      case "students":
        return <StudentsSection />;
      case "payments":
        return <PaymentsSection />;
      case "exams":
        return <ExamsSection departments={departments} getDeptName={getDeptName} />;
      case "reports":
        return <ReportsSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return null;
    }
  };

  return <AdminShell>{renderSection()}</AdminShell>;
}
