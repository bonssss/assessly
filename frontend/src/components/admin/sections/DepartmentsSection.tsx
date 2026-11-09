import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { Modal } from "../Modal";
import { PageHeader, StatusBadge, btn, input } from "@/components/ui-kit";
import { api } from "@/lib/api";

interface DepartmentsSectionProps {
  departments: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function DepartmentsSection({ departments, loading, onRefresh }: DepartmentsSectionProps) {
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newDept, setNewDept] = useState({ code: "", name: "", description: "" });

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
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create department");
    } finally {
      setSubmitting(false);
    }
  };

  const actionBtn = (
    <button onClick={() => setShowDeptModal(true)} className={btn.primary}>
      <Plus className="size-4" /> New Department
    </button>
  );

  return (
    <>
      <PageHeader
        title="Academic Departments"
        description="Manage university faculties, curricula, and enrollments."
        action={actionBtn}
      />

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
                  <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>
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
    </>
  );
}
