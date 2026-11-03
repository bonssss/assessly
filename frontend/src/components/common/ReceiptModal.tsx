'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  CreditCard,
  User,
  ShieldCheck
} from 'lucide-react';

export default function ReceiptModal() {
  const { previewReceipt, setPreviewReceipt, currentRole, approvePayment } = useApp();

  if (!previewReceipt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: '20px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-hairline)',
          padding: '24px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Payment Receipt Evidence
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Verification and Transaction Reference Details
            </p>
          </div>
          <button
            onClick={() => setPreviewReceipt(null)}
            style={{ padding: '6px', borderRadius: '4px', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Receipt Image / Proof Card */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            border: '1px solid var(--border-hairline)',
            backgroundColor: '#0F172A',
            height: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewReceipt.receiptUrl}
            alt="Payment Receipt"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              insetInline: 0,
              padding: '10px 14px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
              color: '#FFFFFF',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{previewReceipt.receiptFileName}</span>
            <span style={{ fontWeight: 600 }}>{previewReceipt.channel}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div
          style={{
            backgroundColor: 'var(--bg-page)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-hairline)',
            padding: '14px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '12px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Candidate:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{previewReceipt.studentName}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Amount Transferred:</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {previewReceipt.amount} {previewReceipt.currency}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Transaction Reference:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
              {previewReceipt.transactionRef}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Review Status:</span>
            <div style={{ fontWeight: 600, color: previewReceipt.status === 'Approved' ? 'var(--success-text)' : 'var(--warning-text)', marginTop: '2px' }}>
              {previewReceipt.status}
            </div>
          </div>
        </div>

        {/* Duplicate Reference Alert */}
        {previewReceipt.isSuspectedDuplicate && (
          <div
            style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '12px',
              color: 'var(--danger-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={15} color="var(--danger)" />
            <span>Warning: Duplicate reference code matches another submitted receipt.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => setPreviewReceipt(null)}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)',
              fontSize: '12.5px',
              fontWeight: 500,
            }}
          >
            Close
          </button>

          {currentRole === 'admin' && previewReceipt.status === 'Pending' && (
            <button
              onClick={() => {
                approvePayment(previewReceipt.id);
                setPreviewReceipt(null);
              }}
              className="btn-azure"
              style={{
                padding: '8px 18px',
                fontSize: '12.5px',
              }}
            >
              Approve Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
