'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import InteractiveWaveChart from './InteractiveWaveChart';
import {
  Users,
  MousePointerClick,
  CreditCard,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ChevronRight,
  Eye,
  Check,
  Award
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    departments,
    questions,
    paymentSubmissions,
    setActiveTab,
    setPreviewReceipt,
    approvePayment,
  } = useApp();

  const pendingSubmissions = paymentSubmissions.filter((p) => p.status === 'Pending');
  const approvedSubmissions = paymentSubmissions.filter((p) => p.status === 'Approved');
  const totalRevenue = approvedSubmissions.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 4 Minimalist Admin Metric Cards (Palette: Cyan, Azure, Navy, Coral) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Cyan */}
        <div className="cockpit-frame" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#627D98', fontWeight: 600 }}>
              Registered Candidates
            </span>
            <span className="badge-cyan">+14.8%</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#00A3C4', marginTop: '8px' }}>
            35,420
          </div>
          <div style={{ fontSize: '11px', color: '#627D98', marginTop: '4px' }}>
            Active across 5 university streams
          </div>
        </div>

        {/* Card 2: Azure */}
        <div className="cockpit-frame" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#627D98', fontWeight: 600 }}>
              Exams & Quizzes Taken
            </span>
            <span className="badge-azure">+28.4%</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0066F5', marginTop: '8px' }}>
            1,248,900
          </div>
          <div style={{ fontSize: '11px', color: '#627D98', marginTop: '4px' }}>
            Mean session duration: 18m
          </div>
        </div>

        {/* Card 3: Midnight Navy */}
        <div className="cockpit-frame" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#627D98', fontWeight: 600 }}>
              Verified Collections
            </span>
            <span className="badge-navy">Telebirr & CBE</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#071529', marginTop: '8px' }}>
            48,500 <span style={{ fontSize: '14px', fontWeight: 600, color: '#627D98' }}>ETB</span>
          </div>
          <div style={{ fontSize: '11px', color: '#627D98', marginTop: '4px' }}>
            Bank statement reconciliation
          </div>
        </div>

        {/* Card 4: Coral Orange */}
        <div
          className="cockpit-frame"
          onClick={() => setActiveTab('payment-review')}
          style={{
            padding: '20px',
            cursor: 'pointer',
            backgroundColor: pendingSubmissions.length > 0 ? '#FFF7ED' : '#FFFFFF',
            borderColor: pendingSubmissions.length > 0 ? '#FED7AA' : '#E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: pendingSubmissions.length > 0 ? '#EA580C' : '#627D98', fontWeight: 700 }}>
              Pending Receipts Queue
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0066F5', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>Review</span>
              <ArrowUpRight size={13} />
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: pendingSubmissions.length > 0 ? '#EA580C' : '#071529', marginTop: '8px' }}>
            {pendingSubmissions.length} Submissions
          </div>
          <div style={{ fontSize: '11px', color: pendingSubmissions.length > 0 ? '#EA580C' : '#627D98', marginTop: '4px' }}>
            Awaiting administrator grant
          </div>
        </div>
      </div>

      {/* Main Grid: Wave Chart + Department Breakdown Table */}
      <div className="responsive-dashboard-grid">
        <div>
          <InteractiveWaveChart
            title="Candidate Practice & Scoring Curve"
            subtitle="Daily attempts across departments and benchmark pass rate progression"
          />
        </div>

        {/* Academic Streams Table */}
        <div className="cockpit-frame" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#071529' }}>
              Degree Streams
            </h3>
            <button
              onClick={() => setActiveTab('departments-resources')}
              style={{ fontSize: '12px', fontWeight: 700, color: '#0066F5' }}
            >
              Manage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {departments.slice(0, 4).map((d) => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFD',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge-azure">{d.code}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#071529' }}>
                      {d.name.split('&')[0]}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#627D98', marginTop: '3px' }}>
                    {d.questionCount} Questions • {d.resourceCount} Blueprints
                  </div>
                </div>

                <span className="badge-navy">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Queue Fast Actions */}
      <div className="cockpit-frame" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#071529' }}>
              Pending Verification Requests ({pendingSubmissions.length})
            </h3>
            <p style={{ fontSize: '12px', color: '#627D98', marginTop: '2px' }}>
              Inspect student transfer evidence and approve entitlements
            </p>
          </div>
          <button
            onClick={() => setActiveTab('payment-review')}
            style={{ fontSize: '12.5px', fontWeight: 700, color: '#0066F5', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Open Full Queue</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: '#627D98', fontSize: '13px' }}>
            <CheckCircle2 size={30} color="#059669" style={{ margin: '0 auto 8px auto' }} />
            All payment receipts have been reviewed and verified!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingSubmissions.slice(0, 3).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFD',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#071529' }}>
                      {item.studentName}
                    </span>
                    <span className="badge-navy">{item.channel}</span>
                    {item.isSuspectedDuplicate && (
                      <span className="badge-orange">DUPLICATE REF</span>
                    )}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#627D98', marginTop: '3px' }}>
                    {item.packageName} • {item.amount} {item.currency} • Ref: <strong>{item.transactionRef}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setPreviewReceipt(item)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#071529',
                    }}
                  >
                    Inspect Proof
                  </button>
                  <button
                    onClick={() => approvePayment(item.id)}
                    className="btn-azure"
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      borderRadius: '6px',
                    }}
                  >
                    Approve Entitlement
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
