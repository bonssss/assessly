import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { PageHeader, btn } from "@/components/ui-kit";
import { api } from "@/lib/api";

export function ReportsSection() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getDepartmentReports();
      setReports(Array.isArray(res) ? res : res?.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const actionBtn = (
    <button onClick={loadReports} className={btn.outline} title="Refresh data">
      <RefreshCw className="size-4" /> Refresh
    </button>
  );

  return (
    <>
      <PageHeader
        title="Performance Reports"
        description="Department-level analytics, student completion metrics, and pass rates."
        action={actionBtn}
      />

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
    </>
  );
}

