import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Section, btn, input, td, th } from "@/components/ui-kit";

export type Col<T> = { h: string; r: (row: T) => ReactNode };
const PAGE_SIZE = 8;

export function DataTable<T extends { id: string }>({
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(0);

  const list = useMemo(() => {
    return rows.filter(
      (r) =>
        search(r).toLowerCase().includes(searchTerm.toLowerCase()) &&
        (activeFilter === "All" || filters?.key(r).toUpperCase() === activeFilter.toUpperCase()),
    );
  }, [rows, searchTerm, activeFilter, search, filters]);

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
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Search..."
              className={`${input} w-44 py-1.5 pl-8 text-xs sm:w-56`}
            />
          </div>
          {filters && (
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(0);
              }}
              className={`${input} w-auto py-1.5 text-xs`}
            >
              <option value="All">All {filters.label ?? "Statuses"}</option>
              {filters.options.map((option) => (
                <option key={option} value={option}>
                  {option}
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
