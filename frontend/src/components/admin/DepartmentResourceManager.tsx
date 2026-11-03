'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FolderKanban,
  Plus,
  FileText,
  UploadCloud,
  CheckCircle2,
  Archive,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

export default function DepartmentResourceManager() {
  const {
    departments,
    resources,
    createDepartment,
    showToast,
  } = useApp();

  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptColor, setDeptColor] = useState('#4F46E5');

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      showToast('Please provide department name and code.');
      return;
    }

    createDepartment({
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      description: deptDesc.trim() || 'Curriculum exit exam stream',
      status: 'active',
      color: deptColor,
      icon: 'BookOpen',
    });

    setIsAddDeptModalOpen(false);
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        className="clean-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Academic Streams & Handout Files
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Organize degree streams, assign question bank categories, and publish learning materials.
          </p>
        </div>

        <button
          onClick={() => setIsAddDeptModalOpen(true)}
          style={{
            backgroundColor: '#111827',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '12.5px',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Plus size={15} />
          <span>Add Academic Stream</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Configured Degree Streams ({departments.length})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {departments.map((d) => (
            <div
              key={d.id}
              className="clean-card clean-card-hover"
              style={{
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-hairline)',
                      color: 'var(--text-secondary)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {d.code}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--success-text)',
                      backgroundColor: 'var(--success-light)',
                      border: '1px solid var(--success-border)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {d.status}
                  </span>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '10px 0 4px 0' }}>
                  {d.name}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {d.description}
                </p>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                <span><strong>{d.questionCount}</strong> Questions</span>
                <span><strong>{d.resourceCount}</strong> Handouts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources Table */}
      <div className="clean-card" style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Protected Syllabus Files & Manuals ({resources.length})
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Served via authorized, signed access URLs without exposing private storage keys (SRS FR-RES-05).
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-hairline)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>File Title</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Size</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Gating</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Downloads</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((res) => {
                const dept = departments.find((d) => d.id === res.departmentId);
                return (
                  <tr key={res.id} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {res.title}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      {dept?.code}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {res.fileSize}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          backgroundColor: res.accessLevel === 'paid' ? 'var(--warning-light)' : 'var(--success-light)',
                          color: res.accessLevel === 'paid' ? 'var(--warning-text)' : 'var(--success-text)',
                          border: `1px solid ${res.accessLevel === 'paid' ? 'var(--warning-border)' : 'var(--success-border)'}`,
                        }}
                      >
                        {res.accessLevel.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      {res.downloadCount}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {new Date(res.uploadedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddDeptModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.4)',
            backdropFilter: 'blur(3px)',
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
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-hairline)',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Add Academic Stream
              </h3>
              <button
                onClick={() => setIsAddDeptModalOpen(false)}
                style={{ padding: '6px', borderRadius: '4px', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stream Name</label>
                <input
                  type="text"
                  placeholder="e.g. Civil & Environmental Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                  style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', backgroundColor: 'var(--bg-page)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stream Code</label>
                <input
                  type="text"
                  placeholder="e.g. CENG"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  required
                  style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', backgroundColor: 'var(--bg-page)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of exit examination syllabus scope..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', backgroundColor: 'var(--bg-page)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  style={{ padding: '7px 14px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-hairline)', color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '7px 18px', borderRadius: '6px', backgroundColor: '#111827', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 600 }}
                >
                  Create Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
