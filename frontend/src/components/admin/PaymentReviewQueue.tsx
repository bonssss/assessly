'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  Check,
  X,
  CreditCard,
  Calendar,
  User,
  ArrowUpRight
} from 'lucide-react';
import { PaymentStatus, PaymentSubmission } from '@/types';

export default function PaymentReviewQueue() {
  const {
    paymentSubmissions,
    approvePayment,
    rejectPayment,
    setPreviewReceipt,
    showToast,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('Pending');
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [approvingPaymentId, setApprovingPaymentId] = useState<string | null>(null);
  const [approvalNote, setApprovalNote] = useState<string>('Verified bank statement. Entitlement approved.');

  const filtered = paymentSubmissions.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = paymentSubmissions.filter((p) => p.status === 'Pending').length;

  const handleApproveConfirm = (paymentId: string) => {
    approvePayment(paymentId, approvalNote);
    setApprovingPaymentId(null);
  };

  const handleRejectConfirm = (paymentId: string) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a specific rejection reason for the candidate.');
      return;
    }
    rejectPayment(paymentId, rejectionReason.trim());
    setRejectingPaymentId(null);
    setRejectionReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Filter Controls */}
      <div
        className="clean-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Manual Payment Review Queue
            </h2>
            {pendingCount > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'var(--warning-light)',
                  color: 'var(--warning-text)',
                  border: '1px solid var(--warning-border)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                {pendingCount} Pending Verification
              </span>
            )}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Inspect student payment receipts, verify against Telebirr/CBE logs, and approve access entitlements.
          </p>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border-hairline)',
            padding: '3px',
            borderRadius: '8px',
            gap: '2px',
          }}
        >
          {(['Pending', 'Approved', 'Rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: filterStatus === status ? 600 : 500,
                backgroundColor: filterStatus === status ? '#FFFFFF' : 'transparent',
                color: filterStatus === status ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: filterStatus === status ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {status === 'all' ? 'All Records' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Fraud Alert Notification if Duplicate Detected */}
      {paymentSubmissions.some((p) => p.isSuspectedDuplicate && p.status === 'Pending') && (
        <div
          style={{
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertTriangle size={18} color="var(--danger)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--danger-text)' }}>
              Potential Duplicate Reference Warning (SRS BR-11, FR-PAY-11)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--danger-text)', opacity: 0.9, marginTop: '2px' }}>
              One or more pending submissions share identical transaction references with prior payments.
              Please verify bank statement records carefully before granting entitlement.
            </div>
          </div>
        </div>
      )}

      {/* Main Submissions Table */}
      <div className="clean-card" style={{ padding: '20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              No submissions found under &ldquo;{filterStatus}&rdquo;
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              All incoming payments have been processed or none match the selected filter.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((item) => {
              const isApproving = approvingPaymentId === item.id;
              const isRejecting = rejectingPaymentId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: item.isSuspectedDuplicate ? '#FFFBFB' : '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: `1px solid ${
                      item.isSuspectedDuplicate
                        ? 'var(--danger-border)'
                        : item.status === 'Approved'
                        ? 'var(--border-hairline)'
                        : item.status === 'Rejected'
                        ? 'var(--border-hairline)'
                        : 'var(--border-hairline)'
                    }`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {/* Top Bar of item */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-subtle)',
                          border: '1px solid var(--border-hairline)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {item.channel === 'Telebirr' ? 'TB' : 'CBE'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.studentName}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {item.studentEmail}
                          </span>

                          {item.isSuspectedDuplicate && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                backgroundColor: 'var(--danger-light)',
                                color: 'var(--danger-text)',
                                border: '1px solid var(--danger-border)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              DUPLICATE REF
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Submitted: {new Date(item.submittedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor:
                          item.status === 'Approved'
                            ? 'var(--success-light)'
                            : item.status === 'Rejected'
                            ? 'var(--danger-light)'
                            : 'var(--warning-light)',
                        color:
                          item.status === 'Approved'
                            ? 'var(--success-text)'
                            : item.status === 'Rejected'
                            ? 'var(--danger-text)'
                            : 'var(--warning-text)',
                        border: `1px solid ${
                          item.status === 'Approved'
                            ? 'var(--success-border)'
                            : item.status === 'Rejected'
                            ? 'var(--danger-border)'
                            : 'var(--warning-border)'
                        }`,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '12px',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      border: '1px solid var(--border-hairline)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Requested Plan
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {item.packageName}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Payment Channel
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {item.channel}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Transaction Ref
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                        {item.transactionRef}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Amount Paid
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {item.amount} {item.currency}
                      </div>
                    </div>
                  </div>

                  {/* Decision Note if processed */}
                  {item.decisionNote && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-page)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-hairline)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Decision Note ({item.reviewedBy || 'Admin'}):</strong> {item.decisionNote}
                    </div>
                  )}

                  {/* Inline Rejection Prompt */}
                  {isRejecting && (
                    <div
                      className="animate-fade-in"
                      style={{
                        backgroundColor: 'var(--danger-light)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px',
                        border: '1px solid var(--danger-border)',
                      }}
                    >
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--danger-text)' }}>
                        Enter Rejection Reason (Sent to Student):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Reference code not found on statement"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        style={{
                          width: '100%',
                          marginTop: '6px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--danger-border)',
                          fontSize: '12.5px',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => handleRejectConfirm(item.id)}
                          style={{
                            backgroundColor: 'var(--danger)',
                            color: '#FFFFFF',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => setRejectingPaymentId(null)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-hairline)',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Approval Confirmation */}
                  {isApproving && (
                    <div
                      className="animate-fade-in"
                      style={{
                        backgroundColor: 'var(--success-light)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px',
                        border: '1px solid var(--success-border)',
                      }}
                    >
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success-text)' }}>
                        Approval Decision Note (Optional):
                      </label>
                      <input
                        type="text"
                        value={approvalNote}
                        onChange={(e) => setApprovalNote(e.target.value)}
                        style={{
                          width: '100%',
                          marginTop: '6px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--success-border)',
                          fontSize: '12.5px',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => handleApproveConfirm(item.id)}
                          style={{
                            backgroundColor: '#111827',
                            color: '#FFFFFF',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Confirm & Unlock Entitlement
                        </button>
                        <button
                          onClick={() => setApprovingPaymentId(null)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-hairline)',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-hairline)', paddingTop: '12px' }}>
                    <button
                      onClick={() => setPreviewReceipt(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-hairline)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                      }}
                    >
                      <Eye size={14} />
                      <span>Inspect Receipt Evidence</span>
                    </button>

                    {item.status === 'Pending' && !isApproving && !isRejecting && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setRejectingPaymentId(item.id);
                            setApprovingPaymentId(null);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: '#FFFFFF',
                            color: 'var(--danger-text)',
                            border: '1px solid var(--danger-border)',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => {
                            setApprovingPaymentId(item.id);
                            setRejectingPaymentId(null);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: '#111827',
                            color: '#FFFFFF',
                            padding: '6px 16px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          <Check size={14} />
                          <span>Approve & Unlock</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
