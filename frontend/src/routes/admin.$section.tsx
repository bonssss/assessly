import { createFileRoute, notFound } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { AdminShell } from "@/components/AdminShell";
import { PageHeader, Section, StatusBadge, btn, input, td, th } from "@/components/ui-kit";
import { adminPayments, departments, examQuestions, examsList, resources, students, type PayStatus } from "@/lib/data";

const titles: Record<string, [string, string]> = {
  questions: ["Questions", "Create, edit and assign multiple-choice questions to departments."],
  departments: ["Departments", "Manage academic departments and their content."],
  resources: ["Resources", "Upload and manage learning materials."],
  students: ["Students", "Manage student accounts and access."],
  payments: ["Payments", "Review uploaded receipts and approve or reject submissions."],
  exams: ["Exams", "Configure timed exams and monitor performance."],
  reports: ["Reports", "Student activity and examination performance."],
  settings: ["Settings", "Payment details, trial policy and platform settings."],
};

export const Route = createFileRoute("/admin/$section")({
  beforeLoad: ({ params }) => { if (!titles[params.section]) throw notFound(); },
  head: ({ params }) => {
    const t = `${titles[params.section]?.[0] ?? "Admin"} — Assessly Admin`;
    return { meta: [{ title: t }, { name: "description", content: titles[params.section]?.[1] ?? "" }, { property: "og:title", content: t }, { property: "og:description", content: titles[params.section]?.[1] ?? "" }] };
  },
  component: AdminSection,
});

type Col<T> = { h: string; r: (row: T) => ReactNode };
const PAGE = 5;

function DataTable<T extends { id: string }>({ rows, cols, search, filters, actions }: {
  rows: T[]; cols: Col<T>[]; search: (r: T) => string; filters?: { key: (r: T) => string; options: string[] }; actions?: (r: T) => ReactNode;
}) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const [page, setPage] = useState(0);
  const list = useMemo(() => rows.filter((r) => search(r).toLowerCase().includes(q.toLowerCase()) && (f === "All" || filters?.key(r) === f)), [rows, q, f, search, filters]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const view = list.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <Section title={`${list.length} records`} action={
      <div className="flex gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search" className={`${input} w-48 py-1.5 pl-8`} />
        </div>
        {filters && (
          <select value={f} onChange={(e) => { setF(e.target.value); setPage(0); }} className={`${input} w-auto py-1.5`}>
            {["All", ...filters.options].map((o) => <option key={o}>{o}</option>)}
          </select>
        )}
      </div>
    }>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50"><tr>{cols.map((c) => <th key={c.h} className={th}>{c.h}</th>)}{actions && <th className={`${th} text-right`}>Actions</th>}</tr></thead>
          <tbody className="divide-y">
            {view.map((r) => <tr key={r.id} className="hover:bg-muted/40">{cols.map((c) => <td key={c.h} className={td}>{c.r(r)}</td>)}{actions && <td className={`${td} text-right`}><div className="flex justify-end gap-1">{actions(r)}</div></td>}</tr>)}
            {view.length === 0 && <tr><td colSpan={cols.length + 1} className="px-4 py-10 text-center text-sm text-muted-foreground">No records found.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-2.5 text-sm text-muted-foreground">
        <span>Page {page + 1} of {pages}</span>
        <div className="flex gap-1">
          <button className={btn.ghost} disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></button>
          <button className={btn.ghost} disabled={page >= pages - 1} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="size-4" /></button>
        </div>
      </div>
    </Section>
  );
}

const icon = (I: typeof Pencil, label: string, onClick?: () => void, tone = "") => (
  <button aria-label={label} title={label} onClick={onClick} className={`rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground ${tone}`}><I className="size-4" /></button>
);
const deptName = (c: string) => departments.find((d) => d.code === c)?.name ?? c;

function AdminSection() {
  const { section } = Route.useParams();
  const [title, desc] = titles[section]!;
  const [payments, setPayments] = useState(adminPayments);
  const [qs, setQs] = useState(examQuestions.map((q, i) => ({ ...q, status: i % 4 === 3 ? "Draft" : "Published" })));
  const setPay = (id: string, s: PayStatus) => setPayments((p) => p.map((x) => (x.id === id ? { ...x, status: s } : x)));
  const addBtn = (label: string) => <button className={btn.primary}><Plus className="size-4" />{label}</button>;

  let body: ReactNode;
  switch (section) {
    case "questions":
      body = <DataTable rows={qs} search={(r) => r.text + r.topic}
        filters={{ key: (r) => r.status, options: ["Published", "Draft"] }}
        cols={[
          { h: "Question", r: (r) => <div className="max-w-md"><div className="truncate font-medium">{r.text}</div><div className="text-xs text-muted-foreground">Answer: {"ABCD"[r.answer]} · {r.options.length} options</div></div> },
          { h: "Department", r: (r) => deptName(r.dept) },
          { h: "Topic", r: (r) => r.topic },
          { h: "Status", r: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(r) => <>{icon(Pencil, "Edit")}{icon(Trash2, "Delete", () => setQs((x) => x.filter((y) => y.id !== r.id)), "hover:text-destructive")}</>} />;
      break;
    case "departments":
      body = <DataTable rows={departments.map((d) => ({ ...d, id: d.code }))} search={(r) => r.name}
        cols={[{ h: "Code", r: (r) => <span className="font-mono">{r.code}</span> }, { h: "Name", r: (r) => <span className="font-medium">{r.name}</span> }, { h: "Questions", r: (r) => r.questions.toLocaleString() }, { h: "Resources", r: (r) => r.resources }, { h: "Status", r: () => <StatusBadge status="Active" /> }]}
        actions={() => icon(Pencil, "Edit")} />;
      break;
    case "resources":
      body = <DataTable rows={resources} search={(r) => r.title} filters={{ key: (r) => r.type, options: ["PDF", "Past Paper", "Video", "Worksheet"] }}
        cols={[{ h: "Title", r: (r) => <span className="font-medium">{r.title}</span> }, { h: "Department", r: (r) => deptName(r.dept) }, { h: "Type", r: (r) => r.type }, { h: "Size", r: (r) => r.size }, { h: "Updated", r: (r) => r.updated }]}
        actions={() => <>{icon(Pencil, "Edit")}{icon(Trash2, "Delete", undefined, "hover:text-destructive")}</>} />;
      break;
    case "students":
      body = <DataTable rows={students} search={(r) => r.name + r.email} filters={{ key: (r) => r.access, options: ["Trial", "Pending", "Active"] }}
        cols={[{ h: "Student", r: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></div> }, { h: "Department", r: (r) => deptName(r.dept) }, { h: "Free used", r: (r) => r.trial }, { h: "Access", r: (r) => <StatusBadge status={r.access} /> }, { h: "Joined", r: (r) => r.joined }]}
        actions={() => <>{icon(Eye, "View")}{icon(Pencil, "Edit")}</>} />;
      break;
    case "payments":
      body = <DataTable rows={payments} search={(r) => r.student + r.ref} filters={{ key: (r) => r.status, options: ["Pending", "Approved", "Rejected"] }}
        cols={[{ h: "ID", r: (r) => <span className="font-mono">{r.id}</span> }, { h: "Student", r: (r) => <span className="font-medium">{r.student}</span> }, { h: "Plan", r: (r) => `${r.plan} · ${r.dept}` }, { h: "Amount", r: (r) => `${r.amount.toLocaleString()} ETB` }, { h: "Method", r: (r) => r.channel }, { h: "Reference", r: (r) => <span className="font-mono">{r.ref}</span> }, { h: "Status", r: (r) => <StatusBadge status={r.status} /> }]}
        actions={(r) => <>{icon(Eye, "View receipt")}{r.status === "Pending" && <>
          <button onClick={() => setPay(r.id, "Approved")} className="inline-flex items-center gap-1 rounded border border-success/40 px-2 py-1 text-xs font-medium text-success hover:bg-success/10"><Check className="size-3.5" />Approve</button>
          <button onClick={() => setPay(r.id, "Rejected")} className="inline-flex items-center gap-1 rounded border border-destructive/40 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"><X className="size-3.5" />Reject</button>
        </>}</>} />;
      break;
    case "exams":
      body = <DataTable rows={examsList} search={(r) => r.title}
        cols={[{ h: "Exam", r: (r) => <span className="font-medium">{r.title}</span> }, { h: "Department", r: (r) => deptName(r.dept) }, { h: "Questions", r: (r) => r.questions }, { h: "Duration", r: (r) => `${r.minutes} min` }, { h: "Attempts", r: (r) => (r.questions * 7) % 140 + 12 }]}
        actions={() => icon(Pencil, "Edit")} />;
      break;
    case "reports":
      body = <DataTable rows={departments.map((d, i) => ({ id: d.code, name: d.name, students: 120 + i * 53, exams: 340 + i * 91, avg: 58 + ((i * 7) % 20) }))} search={(r) => r.name}
        cols={[{ h: "Department", r: (r) => <span className="font-medium">{r.name}</span> }, { h: "Active students", r: (r) => r.students }, { h: "Exams taken", r: (r) => r.exams }, { h: "Average score", r: (r) => `${r.avg}%` }, { h: "Pass rate", r: (r) => `${r.avg + 12}%` }]} />;
      break;
    default:
      body = (
        <Section title="Platform settings" className="max-w-2xl">
          <form className="grid gap-4 p-4" onSubmit={(e) => e.preventDefault()}>
            {[["Free trial questions per student", "5"], ["Telebirr number", "0911 234 567"], ["Bank account (CBE)", "1000 2345 6789 0"], ["Exam pass mark (%)", "50"]].map(([l, v]) => (
              <label key={l} className="block"><span className="mb-1.5 block text-sm font-medium">{l}</span><input className={input} defaultValue={v} /></label>
            ))}
            <div><button className={btn.primary}>Save settings</button></div>
          </form>
        </Section>
      );
  }

  const add = { questions: "New question", departments: "New department", resources: "Upload resource", exams: "New exam" }[section];
  return (
    <AdminShell>
      <PageHeader title={title} description={desc} action={add && addBtn(add)} />
      {body}
    </AdminShell>
  );
}
