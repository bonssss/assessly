import { Download, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { Modal } from "../Modal";
import { PageHeader, StatusBadge, btn, input } from "@/components/ui-kit";
import { api } from "@/lib/api";

interface ResourcesSectionProps {
  departments: any[];
  getDeptName: (id: string) => string;
}

export function ResourcesSection({ departments, getDeptName }: ResourcesSectionProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await api.resources.list();
      setResources(Array.isArray(res) ? res : res?.data || res?.resources || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    if (departments.length > 0 && !newResource.departmentId) {
      setNewResource((prev) => ({ ...prev, departmentId: departments[0].id }));
    }
  }, [departments]);

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
      loadResources();
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

  const handleDownloadResource = async (id: string, _title: string) => {
    try {
      const res = await api.resources.getDownloadUrl(id);
      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not retrieve download link");
    }
  };

  const actionBtn = (
    <button onClick={() => setShowResourceModal(true)} className={btn.primary}>
      <Plus className="size-4" /> Upload Resource
    </button>
  );

  return (
    <>
      <PageHeader
        title="Learning Resources"
        description="Upload lecture notes, past papers, worksheets, and study guides."
        action={actionBtn}
      />

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
    </>
  );
}

