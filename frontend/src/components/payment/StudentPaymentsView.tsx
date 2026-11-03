'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CreditCard,
  Copy,
  Check,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { PaymentChannel } from '@/types';

export default function StudentPaymentsView() {
  const {
    packages,
    paymentSettings,
    paymentSubmissions,
    currentUser,
    submitPayment,
    setPreviewReceipt,
    showToast,
    openPaywall,
    hasActiveEntitlement,
    entitlements,
  } = useApp();

  const [copiedSettingId, setCopiedSettingId] = useState<string | null>(null);

  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[1]?.id || 'pkg-pro');
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('Telebirr');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [amountInput, setAmountInput] = useState<number>(packages[1]?.price || 450);
  const [receiptFileName, setReceiptFileName] = useState<string>('telebirr_receipt.jpg');
  const [receiptUrl, setReceiptUrl] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  );

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[1];
  const studentPayments = paymentSubmissions.filter((p) => p.userId === currentUser.id);
  const userEntitlements = entitlements.filter((e) => e.userId === currentUser.id && e.status === 'active');

  const handleCopyAccount = (settingId: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSettingId(settingId);
    showToast(`Copied ${text} to clipboard`);
    setTimeout(() => setCopiedSettingId(null), 2000);
  };

  const handlePackageChange = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setAmountInput(pkg.price);
    }
  };

  const handlePresetReceipt = (type: 'telebirr' | 'cbe') => {
    if (type === 'telebirr') {
      setSelectedChannel('Telebirr');
      setReceiptFileName('telebirr_payment_proof.jpg');
      setReceiptUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
      setTransactionRef(`TB-${Math.floor(100000000 + Math.random() * 900000000)}`);
      showToast('Loaded sample Telebirr receipt & reference');
    } else {
      setSelectedChannel('Commercial Bank of Ethiopia (CBE)');
      setReceiptFileName('cbe_birr_slip.png');
      setReceiptUrl('https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80');
      setTransactionRef(`FT26110${Math.floor(10000 + Math.random() * 90000)}`);
      showToast('Loaded sample CBE Birr confirmation slip');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      showToast('Please enter the transaction reference code.');
      return;
    }

    submitPayment({
      packageId: selectedPkgId,
      channel: selectedChannel,
      transactionRef: transactionRef.trim(),
      amount: amountInput,
      receiptFileName,
      receiptUrl,
    });

    setTransactionRef('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Active Entitlement Status Banner */}
      {userEntitlements.length > 0 && (
        <div
          className="cockpit-frame"
          style={{
            backgroundColor: '#ECFDF5',
            borderColor: '#A7F3D0',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#065F46' }}>
                Active Licensure Entitlement: {userEntitlements[0].packageName}
              </div>
              <div style={{ fontSize: '12.5px', color: '#047857', marginTop: '2px' }}>
                Unlimited exit exam questions & timed mock exams unlocked until{' '}
                <strong>{new Date(userEntitlements[0].expiresAt).toLocaleDateString()}</strong>.
              </div>
            </div>
          </div>
          <span className="badge-azure" style={{ backgroundColor: '#FFFFFF', borderColor: '#A7F3D0', color: '#059669' }}>
            VERIFIED PRO
          </span>
        </div>
      )}

      {/* Main Grid: Channels + Submission Form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Step 1: Official Bank & Telebirr Accounts */}
        <div className="cockpit-frame" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <span className="badge-navy">Step 1 • Official Channels</span>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071529', marginTop: '8px' }}>
              Official Payment Channels
            </h3>
            <p style={{ fontSize: '13px', color: '#627D98', marginTop: '4px' }}>
              Transfer the package fee using Telebirr or Commercial Bank of Ethiopia (CBE) and copy your transaction reference number.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {paymentSettings.map((setting) => (
              <div
                key={setting.id}
                style={{
                  backgroundColor: '#F8FAFD',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '18px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {setting.method.includes('Telebirr') ? (
                      <Smartphone size={16} color="#0066F5" />
                    ) : (
                      <Building2 size={16} color="#00A3C4" />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#071529' }}>
                      {setting.method}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyAccount(setting.id, setting.accountNumber)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: copiedSettingId === setting.id ? '#059669' : '#0066F5',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    {copiedSettingId === setting.id ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSettingId === setting.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '18px', fontWeight: 800, color: '#071529', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                  {setting.accountNumber}
                </div>
                <div style={{ fontSize: '12px', color: '#627D98', marginTop: '3px', fontWeight: 600 }}>
                  Account Holder: {setting.accountHolder}
                </div>

                <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#334E68', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {setting.instructions}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Upload Receipt Form */}
        <div className="cockpit-frame" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="badge-azure">Step 2 • Verification Claim</span>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071529', marginTop: '8px' }}>
              Submit Transfer Evidence
            </h3>
            <p style={{ fontSize: '13px', color: '#627D98', marginTop: '4px' }}>
              Administrators verify submitted transaction records directly against bank statements.
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#071529' }}>
                  Selected Upgrade Package
                </label>
                <select
                  value={selectedPkgId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: '6px',
                    backgroundColor: '#F8FAFD',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#071529',
                  }}
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {pkg.price} {pkg.currency} ({pkg.durationDays} Days Full Access)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#071529' }}>
                    Payment Channel
                  </label>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value as PaymentChannel)}
                    style={{
                      display: 'block',
                      width: '100%',
                      marginTop: '6px',
                      backgroundColor: '#F8FAFD',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#071529',
                    }}
                  >
                    <option value="Telebirr">Telebirr</option>
                    <option value="Commercial Bank of Ethiopia (CBE)">CBE Birr / Bank</option>
                    <option value="Awash Bank">Awash Bank</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#071529' }}>
                    Amount (ETB)
                  </label>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(Number(e.target.value))}
                    style={{
                      display: 'block',
                      width: '100%',
                      marginTop: '6px',
                      backgroundColor: '#F8FAFD',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#071529',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#071529' }}>
                  Transaction Reference Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. TB-9840284 or FT26110..."
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  required
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #0066F5',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: '#071529',
                  }}
                />
              </div>

              {/* Sample Autofill Presets */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handlePresetReceipt('telebirr')}
                  style={{
                    flex: 1,
                    backgroundColor: '#EDF3FB',
                    color: '#0066F5',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    border: '1px solid #B9D9FE',
                  }}
                >
                  ⚡ Sample Telebirr Code
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetReceipt('cbe')}
                  style={{
                    flex: 1,
                    backgroundColor: '#EDF3FB',
                    color: '#00A3C4',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    border: '1px solid #B2EBF2',
                  }}
                >
                  ⚡ Sample CBE Slip Code
                </button>
              </div>

              {/* Receipt File Attachment Preview */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFD',
                  border: '1.5px dashed #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UploadCloud size={18} color="#0066F5" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#071529' }}>
                      {receiptFileName}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#627D98' }}>
                      JPEG / PNG evidence attached
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPreviewReceipt({
                      id: 'temp',
                      userId: currentUser.id,
                      studentName: currentUser.fullName,
                      studentEmail: currentUser.email,
                      packageId: selectedPkgId,
                      packageName: selectedPkg.name,
                      amount: amountInput,
                      currency: 'ETB',
                      channel: selectedChannel,
                      transactionRef: transactionRef || 'PREVIEW-REF',
                      receiptUrl,
                      receiptFileName,
                      status: 'Pending',
                      submittedAt: new Date().toISOString(),
                    })
                  }
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0066F5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Eye size={13} />
                  <span>Inspect Slip</span>
                </button>
              </div>

              <button
                type="submit"
                className="btn-azure"
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>Submit Verification Claim</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Submissions History */}
      <div className="cockpit-frame" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#071529' }}>
            Payment Claims History
          </h3>
          <span className="badge-navy">{studentPayments.length} Total Submissions</span>
        </div>

        {studentPayments.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#627D98', fontSize: '13px' }}>
            No payment claims recorded yet. Submit your transfer evidence above.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #E2E8F0', textAlign: 'left', color: '#627D98', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Channel</th>
                  <th style={{ padding: '10px 12px' }}>Reference</th>
                  <th style={{ padding: '10px 12px' }}>Package</th>
                  <th style={{ padding: '10px 12px' }}>Amount</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {studentPayments.map((p) => {
                  let badge = <span className="badge-orange">Pending Review</span>;
                  if (p.status === 'Approved') {
                    badge = <span className="badge-azure" style={{ color: '#059669', borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }}>Approved & Active</span>;
                  } else if (p.status === 'Rejected') {
                    badge = <span className="badge-orange" style={{ color: '#DC2626', borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>Rejected</span>;
                  }

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#071529' }}>{p.channel}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#0066F5' }}>{p.transactionRef}</td>
                      <td style={{ padding: '12px', color: '#334E68' }}>{p.packageName}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#071529' }}>{p.amount} {p.currency}</td>
                      <td style={{ padding: '12px' }}>{badge}</td>
                      <td style={{ padding: '12px', color: '#627D98' }}>{new Date(p.submittedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => setPreviewReceipt(p)}
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#0066F5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={12} />
                          <span>View Proof</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
