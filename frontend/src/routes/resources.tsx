import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Lock, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StudentShell } from "@/components/StudentShell";
import { PageHeader, Section, btn, input, td, th } from "@/components/ui-kit";
import { api } from "@/lib/api";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Learning Resources — Assessly" },
      { name: "description", content: "Department learning materials, syllabi, and lecture notes." },
      { property: "og:title", content: "Resources — Assessly" },
    ],
  }),
  component: ResourcesComponent,
});

function ResourcesComponent() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    api.resources
      .list()
      .then((res) => {
        setResources(res?.data || []);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load resources");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDownload = async (resourceId: string, title: string) => {
    setDownloadingId(resourceId);
    try {
      const data = await api.resources.getDownloadUrl(resourceId);
      if (data?.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
        toast.success(`Opening ${title}...`);
      }
    } catch (err: any) {
      if (err.code === "PAYWALL_REQUIRED") {
        toast.error("This resource requires an active subscription for this department.");
      } else {
        toast.error(err.message || "Download failed");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = resources.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.topic && r.topic.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <StudentShell>
      <PageHeader
        title="Learning Resources"
        description="Official syllabi, lecture notes, formula sheets, and study materials."
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search study guides, topics, notes..."
            className={`${input} pl-9`}
          />
        </div>
      </div>

      <Section title={`${filtered.length} Resources Available`}>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading resources...</p>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No resources available matching your search.</p>
          ) : (
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  {["Title", "Department", "Topic", "Access Level", ""].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className={td}>
                      <span className="flex items-center gap-3 font-medium">
                        <FileText className="size-4 text-muted-foreground shrink-0" />
                        <div>
                          <div>{r.title}</div>
                          {r.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-sm">
                              {r.description}
                            </div>
                          )}
                        </div>
                      </span>
                    </td>
                    <td className={`${td} text-muted-foreground text-xs`}>
                      {r.department?.name || r.department?.code}
                    </td>
                    <td className={`${td} text-muted-foreground text-xs`}>{r.topic || "General"}</td>
                    <td className={td}>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          r.accessLevel === "PAID"
                            ? "bg-brand/10 text-brand"
                            : r.accessLevel === "FREE"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.accessLevel}
                      </span>
                    </td>
                    <td className={`${td} text-right`}>
                      {r.hasAccess ? (
                        <button
                          disabled={downloadingId === r.id}
                          onClick={() => handleDownload(r.id, r.title)}
                          className={`${btn.ghost} inline-flex items-center gap-1.5 text-xs`}
                        >
                          <Download className="size-3.5" />
                          {downloadingId === r.id ? "Preparing..." : "Download"}
                        </button>
                      ) : (
                        <Link
                          to="/payments"
                          className={`${btn.ghost} inline-flex items-center gap-1.5 text-xs text-muted-foreground`}
                        >
                          <Lock className="size-3.5" /> Unlock
                        </Link>
                      )}
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
