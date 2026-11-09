import { Check, Eye, FileText, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { Modal } from "../Modal";
import { PageHeader, StatusBadge, btn } from "@/components/ui-kit";
import { api } from "@/lib/api";

export function PaymentsSection() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.payments.listAdminPayments();
      setPayments(Array.isArray(res) ? res : res?.data || res?.payments || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleApprovePayment = async (id: string) => {
    try {
      await api.payments.approve(id, "Verified by Admin");
      toast.success("Payment approved and student entitlement activated!");
      loadPayments();
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleRejectPayment = async (id: string) => {
    const reason = prompt("Enter rejection reason for the candidate:") || "Receipt illegible";
    try {
      await api.payments.reject(id, reason);
      toast.success("Payment rejected.");
      loadPayments();
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

  const actionBtn = (
    <button onClick={loadPayments} className={btn.outline} title="Refresh data">
      <RefreshCw className="size-4" /> Refresh
    </button>
  );

  return (
    <>
      <PageHeader
        title="Payment Verification"
        description="Review submitted bank receipts, approve transactions, and grant access."
        action={actionBtn}
      />

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
    </>
  );
}

