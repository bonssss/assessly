'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  CreditCard,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Smartphone
} from 'lucide-react';

export default function SettingsView() {
  const { paymentSettings, showToast } = useApp();

  const [telebirrAccount, setTelebirrAccount] = useState('0911 23 45 67');
  const [telebirrHolder, setTelebirrHolder] = useState('Alpha Exam Academy Ltd');
  const [cbeAccount, setCbeAccount] = useState('1000 2345 6789 0');
  const [cbeHolder, setCbeHolder] = useState('Alpha Educational Technology Services');
  const [trialQuota, setTrialQuota] = useState(5);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform settings saved. Verification guidelines updated.');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="clean-card" style={{ padding: '20px 24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Payment & Platform Configuration (SRS FR-PAY-01)
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
          Configure verified Telebirr & commercial bank accounts displayed to students during checkout.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Telebirr Settings */}
        <div className="clean-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Smartphone size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Telebirr Merchant / Account Details
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Telebirr Phone / Account
              </label>
              <input
                type="text"
                value={telebirrAccount}
                onChange={(e) => setTelebirrAccount(e.target.value)}
                style={{ width: '100%', marginTop: '4px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-primary)', backgroundColor: 'var(--bg-page)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Account Holder Name
              </label>
              <input
                type="text"
                value={telebirrHolder}
                onChange={(e) => setTelebirrHolder(e.target.value)}
                style={{ width: '100%', marginTop: '4px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-primary)', backgroundColor: 'var(--bg-page)' }}
              />
            </div>
          </div>
        </div>

        {/* CBE Settings */}
        <div className="clean-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CreditCard size={18} color="var(--success)" />
            <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Commercial Bank of Ethiopia (CBE)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                CBE Account Number
              </label>
              <input
                type="text"
                value={cbeAccount}
                onChange={(e) => setCbeAccount(e.target.value)}
                style={{ width: '100%', marginTop: '4px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-primary)', backgroundColor: 'var(--bg-page)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Beneficiary Name
              </label>
              <input
                type="text"
                value={cbeHolder}
                onChange={(e) => setCbeHolder(e.target.value)}
                style={{ width: '100%', marginTop: '4px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-primary)', backgroundColor: 'var(--bg-page)' }}
              />
            </div>
          </div>
        </div>

        {/* Free Trial Policy Config */}
        <div className="clean-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Free Trial Quota Policy (SRS BR-04, TBD-01)
            </h3>
          </div>

          <div style={{ maxWidth: '300px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Free Question Attempts Allowed:
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={trialQuota}
              onChange={(e) => setTrialQuota(Number(e.target.value))}
              style={{ width: '100%', marginTop: '4px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', backgroundColor: 'var(--bg-page)' }}
            />
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Current SRS baseline: 5 attempts per registered student account.
            </p>
          </div>
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#111827',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '13px',
            padding: '10px 20px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Save size={15} />
          <span>Save System Configurations</span>
        </button>
      </form>
    </div>
  );
}
