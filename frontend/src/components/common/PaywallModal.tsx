'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  X,
  ArrowRight,
  Zap
} from 'lucide-react';

export default function PaywallModal() {
  const {
    isPaywallOpen,
    closePaywall,
    packages,
    setActiveTab,
    setSelectedPackageForCheckout,
  } = useApp();

  if (!isPaywallOpen) return null;

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackageForCheckout(pkg);
    closePaywall();
    setActiveTab('payments');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 21, 41, 0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '32px',
          width: '100%',
          maxWidth: '820px',
          boxShadow: '0 25px 50px -12px rgba(7, 21, 41, 0.35)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={closePaywall}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '6px',
            borderRadius: '6px',
            color: '#627D98',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', maxWidth: '580px', margin: '0 auto 28px auto' }}>
          <div
            className="badge-azure"
            style={{
              marginBottom: '12px',
              padding: '4px 14px',
              fontSize: '11px',
            }}
          >
            <Sparkles size={13} color="#0066F5" />
            <span>Trial Limit Reached (5/5 Free Questions)</span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#071529', letterSpacing: '-0.5px' }}>
            Unlock Full National Licensure Preparation
          </h2>
          <p style={{ fontSize: '13px', color: '#627D98', marginTop: '6px', lineHeight: 1.5 }}>
            You have exhausted your 5 free question trial. Select an academic plan below, transfer via Telebirr or CBE Birr, and enjoy unlimited exit exam access.
          </p>
        </div>

        {/* Packages Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {packages.map((pkg) => {
            const isPro = pkg.popular;

            return (
              <div
                key={pkg.id}
                style={{
                  borderRadius: '12px',
                  padding: '24px',
                  backgroundColor: isPro ? '#F8FAFD' : '#FFFFFF',
                  border: isPro ? '2px solid #0066F5' : '1px solid #CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: isPro ? '0 10px 25px -5px rgba(0, 102, 245, 0.15)' : 'none',
                }}
              >
                {isPro && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-11px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#0066F5',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: '9999px',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 8px rgba(0, 102, 245, 0.3)',
                    }}
                  >
                    Recommended Plan
                  </span>
                )}

                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#071529' }}>
                    {pkg.name}
                  </div>
                  <p style={{ fontSize: '12px', color: '#627D98', marginTop: '4px', minHeight: '32px', lineHeight: 1.4 }}>
                    {pkg.description}
                  </p>

                  <div style={{ margin: '16px 0 14px 0' }}>
                    <span style={{ fontSize: '32px', fontWeight: 900, color: isPro ? '#0066F5' : '#071529' }}>
                      {pkg.price}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#627D98', marginLeft: '5px' }}>
                      {pkg.currency} / {pkg.durationDays} days
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#334E68' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#059669" />
                      <span>{pkg.questionLimit === 'unlimited' ? 'Unlimited Exit MCQs' : `${pkg.questionLimit} Questions`}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#059669" />
                      <span>Timed Mock Exams with Review</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#059669" />
                      <span>Instant Telebirr & CBE Birr</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className={isPro ? 'btn-azure' : 'btn-navy'}
                  style={{
                    marginTop: '22px',
                    width: '100%',
                    padding: '10px',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Select & Transfer</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '12px', color: '#627D98' }}>
          🔒 Payments are securely made via Telebirr or CBE Birr with verified admin entitlement activation.
        </div>
      </div>
    </div>
  );
}
