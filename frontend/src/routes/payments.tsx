import { createFileRoute } from "@tanstack/react-router";
import { Building2, Info, Smartphone, Upload, CheckCircle2, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/AuthCard";
import { StudentShell } from "@/components/StudentShell";
import { PageHeader, Section, StatusBadge, btn, input, td, th } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments & Verification — Assessly" },
      { name: "description", content: "Pay via Telebirr or CBE bank transfer and upload your receipt." },
      { property: "og:title", content: "Payments — Assessly" },
    ],
  }),
  component: Payments,
});

function Payments() {
  const [packages, setPackages] = useState<any[]>([]);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("TELEBIRR");
  const [transactionRef, setTransactionRef] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [pkgs, instrs, myPayments] = await Promise.all([
        api.payments.getPackages().catch(() => []),
        api.payments.getInstructions().catch(() => []),
        api.payments.listMyPayments().catch(() => []),
      ]);

      setPackages(pkgs);
      if (pkgs.length > 0 && !selectedPackageId) {
        setSelectedPackageId(pkgs[0].id);
      }
      setInstructions(instrs);
      if (instrs.length > 0) {
        setPaymentMethod((prev) => (instrs.some((i: any) => i.method === prev) ? prev : instrs[0].method));
      }
      setHistory(myPayments);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payment options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedPkg = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const activeInstruction = instructions.find((i) => i.method === paymentMethod) || instructions[0];

  const handleCopy = (text: string, id: string, label: string) => {
    // Strip parenthetical text for clean account number copy
    const cleanNumber = text.split("(")[0].trim();
    navigator.clipboard.writeText(cleanNumber);
    setCopiedId(id);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      toast.error("Please select a receipt screenshot or PDF file.");
      return;
    }

    if (!selectedPackageId) {
      toast.error("Please select a package.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("packageId", selectedPackageId);
    formData.append("paymentMethod", paymentMethod);
    formData.append("transactionReference", transactionRef);
    formData.append("receipt", receiptFile);

    try {
      await api.payments.submitPayment(formData);
      toast.success("Receipt submitted! Awaiting administrator verification.");
      setTransactionRef("");
      setReceiptFile(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment receipt.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentShell>
      <PageHeader
        title="Payment & Subscriptions"
        description="Choose a qualification package, transfer via Telebirr or CBE, and upload your receipt."
      />

      <div className="mb-6 flex gap-3 rounded-xl border border-brand/30 bg-accent/60 p-4 text-sm text-slate-700">
        <Info className="mt-0.5 size-5 shrink-0 text-brand" />
        <span>
          Payments are verified manually by administrators. <strong>Full departmental access is automatically activated once approved</strong>, typically within 2 to 12 hours.
        </span>
      </div>

      {/* Package Selection Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {packages.map((p) => {
          const isSelected = selectedPackageId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPackageId(p.id)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-all cursor-pointer relative",
                isSelected
                  ? "border-brand bg-brand/5 ring-2 ring-brand shadow-sm"
                  : "bg-card hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{p.name}</span>
                {isSelected && (
                  <CheckCircle2 className="size-4 text-brand" />
                )}
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  {Number(p.price).toLocaleString()}
                </span>{" "}
                <span className="text-xs font-semibold text-slate-500">{p.currency || "ETB"}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 font-medium">
                Validity: <strong className="text-slate-700">{p.durationDays} days</strong> · Scope: <strong className="text-slate-700">{p.scope.replace("_", " ")}</strong>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Dynamic Bank & Telebirr Instructions */}
        <Section
          title="Payment Instructions"
          action={
            <span className="text-xs text-muted-foreground">Click a method to select</span>
          }
        >
          <div className="divide-y text-sm">
            {instructions.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground">No active payment channels configured.</p>
            ) : (
              instructions.map((inst) => {
                const isActive = inst.method === paymentMethod;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setPaymentMethod(inst.method)}
                    className={cn(
                      "p-4 transition-colors cursor-pointer",
                      isActive ? "bg-brand/5" : "hover:bg-slate-50/60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        {inst.method === "TELEBIRR" ? (
                          <Smartphone className="size-4.5 text-emerald-600" />
                        ) : (
                          <Building2 className="size-4.5 text-blue-600" />
                        )}
                        <span>{inst.displayName}</span>
                      </div>
                      {isActive && (
                        <span className="text-[11px] font-semibold text-brand px-2 py-0.5 rounded-full bg-brand/10">
                          Active Channel
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 bg-slate-100/80 border border-slate-200/80 px-3 py-2 rounded-xl text-xs font-mono">
                      <div className="truncate">
                        <span className="text-slate-500 font-sans font-medium">Account: </span>
                        <strong className="text-slate-900">{inst.accountDetails}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(inst.accountDetails, inst.id, inst.displayName);
                        }}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        title="Copy account number"
                      >
                        {copiedId === inst.id ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>

                    <pre className="mt-2.5 text-xs text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">
                      {inst.instructions}
                    </pre>
                  </div>
                );
              })
            )}
          </div>
        </Section>

        {/* Upload Receipt Form */}
        <Section title="Upload Payment Receipt">
          <form className="space-y-4 p-5" onSubmit={handleSubmit}>
            {selectedPkg && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Selected Package: </span>
                  <span className="font-bold text-slate-800">{selectedPkg.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900">{Number(selectedPkg.price).toLocaleString()} {selectedPkg.currency || "ETB"}</span>
                </div>
              </div>
            )}

            <Field label="Payment Method Used">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={input}
              >
                {instructions.map((inst) => (
                  <option key={inst.id} value={inst.method}>
                    {inst.displayName} ({inst.accountDetails})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Transaction Reference Code">
              <input
                required
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className={`${input} font-mono`}
                placeholder="e.g. TXN-TB-98234190 or FT26288C44"
              />
            </Field>

            <Field label="Receipt Screenshot or PDF (Max 5 MB)">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-4 py-6 text-center text-xs sm:text-sm text-slate-500 hover:border-brand hover:bg-slate-50 transition-colors">
                <Upload className="size-5 text-slate-400" />
                <span className="font-medium text-slate-700">
                  {receiptFile ? receiptFile.name : "Click to select JPG, PNG, or PDF receipt"}
                </span>
                <span className="text-[11px] text-slate-400">Accepted formats: JPG, PNG, PDF up to 5 MB</span>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceiptFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className={`${btn.primary} w-full flex items-center justify-center gap-2 py-3 rounded-full shadow-md cursor-pointer`}
            >
              {submitting ? "Uploading Receipt..." : "Submit Receipt for Verification"}
            </button>
          </form>
        </Section>
      </div>

      {/* Payment History Table */}
      <Section title="My Payment History" className="mt-6">
        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <p className="p-5 text-xs text-muted-foreground">No payment submissions recorded yet.</p>
          ) : (
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  {["Date", "Package", "Amount", "Method", "Reference", "Status"].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className={td}>{p.package?.name || "Pass"}</td>
                    <td className={td}>
                      {Number(p.amount).toLocaleString()} {p.currency}
                    </td>
                    <td className={td}>{p.paymentMethod}</td>
                    <td className={`${td} font-mono text-xs`}>{p.transactionReference}</td>
                    <td className={td}>
                      <StatusBadge
                        status={p.status === "APPROVED" ? "Approved" : p.status === "REJECTED" ? "Rejected" : "Pending"}
                      />
                      {p.adminNote && (
                        <div className="mt-1 text-xs text-muted-foreground">Note: {p.adminNote}</div>
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
