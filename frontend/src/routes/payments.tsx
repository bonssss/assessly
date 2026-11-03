import { createFileRoute } from "@tanstack/react-router";
import { Building2, Info, Smartphone, Upload, CheckCircle2 } from "lucide-react";
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

  const loadData = async () => {
    try {
      const [pkgs, instrs, myPayments] = await Promise.all([
        api.payments.getPackages().catch(() => []),
        api.payments.getInstructions().catch(() => []),
        api.payments.listMyPayments().catch(() => []),
      ]);

      setPackages(pkgs);
      if (pkgs.length > 0) {
        setSelectedPackageId(pkgs[0].id);
      }
      setInstructions(instrs);
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

      <div className="mb-6 flex gap-3 rounded-lg border border-brand/30 bg-accent px-4 py-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>
          Payments are verified manually by administrators. <strong>Full departmental access is automatically activated once approved</strong>, typically within 2 to 12 hours.
        </span>
      </div>

      {/* Package Selection Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {packages.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPackageId(p.id)}
            className={cn(
              "rounded-lg border bg-card p-4 text-left transition-all",
              selectedPackageId === p.id ? "border-brand ring-2 ring-brand" : "hover:border-border"
            )}
          >
            <div className="text-sm font-semibold">{p.name}</div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{Number(p.price).toLocaleString()}</span>{" "}
              <span className="text-sm text-muted-foreground">{p.currency || "ETB"}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Validity: {p.durationDays} days · Scope: {p.scope}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Dynamic Bank & Telebirr Instructions */}
        <Section title="Payment Instructions">
          <div className="divide-y text-sm">
            {instructions.map((inst) => (
              <div key={inst.id} className="p-4">
                <div className="flex items-center gap-2 font-semibold">
                  {inst.method === "TELEBIRR" ? (
                    <Smartphone className="size-4 text-brand" />
                  ) : (
                    <Building2 className="size-4 text-brand" />
                  )}
                  {inst.displayName}
                </div>
                <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
                  Account / Phone: <strong>{inst.accountDetails}</strong>
                </div>
                <pre className="mt-2 text-xs text-muted-foreground font-sans whitespace-pre-wrap leading-relaxed">
                  {inst.instructions}
                </pre>
              </div>
            ))}
          </div>
        </Section>

        {/* Upload Receipt Form */}
        <Section title="Upload Payment Receipt">
          <form className="space-y-4 p-4" onSubmit={handleSubmit}>
            <Field label="Payment Method Used">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={input}
              >
                <option value="TELEBIRR">Telebirr</option>
                <option value="BANK_TRANSFER">Commercial Bank of Ethiopia (CBE)</option>
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
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed bg-background px-4 py-6 text-center text-sm text-muted-foreground hover:border-brand">
                <Upload className="size-5" />
                <span>{receiptFile ? receiptFile.name : "Click to select JPG, PNG, or PDF receipt"}</span>
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
              className={`${btn.primary} w-full flex items-center justify-center gap-2`}
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
            <p className="p-4 text-sm text-muted-foreground">No payment submissions yet.</p>
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
