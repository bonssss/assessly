'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Download,
  Lock,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  BookOpen,
  Filter,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function StudyResourcesView() {
  const {
    resources,
    departments,
    currentUser,
    hasActiveEntitlement,
    openPaywall,
    showToast,
  } = useApp();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [readingResource, setReadingResource] = useState<any | null>(null);

  const isPro = hasActiveEntitlement();

  const filtered = resources.filter((res) => {
    if (selectedDeptId !== 'all' && res.departmentId !== selectedDeptId) return false;
    return true;
  });

  const handleAccessResource = (res: any) => {
    if (res.accessLevel === 'paid' && !isPro) {
      openPaywall();
      showToast('This resource requires a verified Pro Entitlement. Upgrade below.');
      return;
    }

    setReadingResource(res);
    showToast(`Opened "${res.title}" in secure viewer`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Filter */}
      <div
        className="cockpit-frame"
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <span className="badge-navy">Official MoE Syllabus Kits</span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#071529', marginTop: '6px', letterSpacing: '-0.4px' }}>
            Academic Blueprints & Handouts
          </h2>
          <p style={{ fontSize: '13px', color: '#627D98', marginTop: '4px' }}>
            Curated syllabus summaries, high-yield clinical guides, and exit exam preparation kits.
          </p>
        </div>

        <select
          value={selectedDeptId}
          onChange={(e) => setSelectedDeptId(e.target.value)}
          style={{
            backgroundColor: '#EDF3FB',
            border: '1.5px solid #CBD5E1',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#071529',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Resources Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {filtered.map((res) => {
          const dept = departments.find((d) => d.id === res.departmentId);
          const isLocked = res.accessLevel === 'paid' && !isPro;

          return (
            <div
              key={res.id}
              className="cockpit-frame"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge-azure">{dept?.code || 'STREAM'}</span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor: isLocked ? '#FFF7ED' : '#ECFDF5',
                      color: isLocked ? '#C2410C' : '#065F46',
                      border: `1px solid ${isLocked ? '#FFEDD5' : '#A7F3D0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isLocked ? <Lock size={12} color="#EA580C" /> : <CheckCircle2 size={12} color="#059669" />}
                    <span>{isLocked ? 'Pro Access' : 'Free Access'}</span>
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#071529', margin: '14px 0 6px 0', lineHeight: 1.35 }}>
                  {res.title}
                </h3>

                <p style={{ fontSize: '12.5px', color: '#627D98', lineHeight: 1.55 }}>
                  {res.description}
                </p>

                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '11.5px', color: '#627D98', fontWeight: 600 }}>
                  <span>PDF Document</span>
                  <span>•</span>
                  <span>{res.fileSize}</span>
                  <span>•</span>
                  <span>{res.downloadCount} Downloads</span>
                </div>
              </div>

              <button
                onClick={() => handleAccessResource(res)}
                className={isLocked ? 'btn-navy' : 'btn-azure'}
                style={{
                  marginTop: '22px',
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isLocked ? (
                  <>
                    <Lock size={13} />
                    <span>Unlock with Pro Plan</span>
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    <span>Open & Read Handout</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Reader Modal */}
      {readingResource && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 21, 41, 0.65)',
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
              maxWidth: '720px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(7, 21, 41, 0.35)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <span className="badge-azure">Official Syllabus Handout</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071529', marginTop: '6px' }}>
                  {readingResource.title}
                </h3>
              </div>

              <button
                onClick={() => setReadingResource(null)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  color: '#627D98',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px 0', fontSize: '13.5px', color: '#334E68', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '16px' }}>
                {readingResource.description}
              </p>

              <div
                style={{
                  backgroundColor: '#F8FAFD',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  marginTop: '16px',
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#071529', marginBottom: '8px' }}>
                  Curriculum Competencies Verified
                </h4>
                <p style={{ fontSize: '12.5px', color: '#627D98', lineHeight: 1.6 }}>
                  This curriculum material covers the core high-yield competencies tested in the 2026 Ethiopian Higher Education Exit Examinations. Use in conjunction with our single-choice question bank for maximum recall and retention.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setReadingResource(null)}
                style={{
                  backgroundColor: '#EDF3FB',
                  color: '#071529',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                }}
              >
                Close Viewer
              </button>

              <button
                onClick={() => {
                  showToast('Downloaded official PDF syllabus bundle.');
                  setReadingResource(null);
                }}
                className="btn-azure"
                style={{
                  fontSize: '12.5px',
                  padding: '8px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={13} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
