'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  GraduationCap,
  CheckCircle2,
  PlusCircle,
  BookOpen,
  FileText,
  Clock,
  Sparkles,
  Star,
  ChevronRight,
  Layers,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function DepartmentEnrollmentView() {
  const {
    departments,
    currentUser,
    toggleDepartmentEnrollment,
    setActiveTab,
  } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="cockpit-frame" style={{ padding: '24px 28px' }}>
        <span className="badge-navy">Ethiopian Higher Education Academic Disciplines</span>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#071529', marginTop: '6px', letterSpacing: '-0.4px' }}>
          Academic Stream Enrollments
        </h2>
        <p style={{ fontSize: '13px', color: '#627D98', marginTop: '4px' }}>
          Customize your study workspace. Select which academic curricula you are sitting for. Question banks, mock exams, and syllabus blueprints will dynamically align with your active enrollments.
        </p>
      </div>

      {/* Grid of Department Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {departments.map((dept) => {
          const isEnrolled = currentUser.enrolledDepartmentIds.includes(dept.id);

          return (
            <div
              key={dept.id}
              className="cockpit-frame"
              style={{
                padding: '24px',
                border: isEnrolled ? '1.5px solid #0066F5' : '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isEnrolled ? '0 10px 25px -5px rgba(0, 102, 245, 0.12)' : 'var(--shadow-card)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge-azure">{dept.code}</span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor: isEnrolled ? '#ECFDF5' : '#F8FAFD',
                      color: isEnrolled ? '#065F46' : '#627D98',
                      border: `1px solid ${isEnrolled ? '#A7F3D0' : '#E2E8F0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isEnrolled && <CheckCircle2 size={12} color="#059669" />}
                    <span>{isEnrolled ? 'Active Enrolled' : 'Not Enrolled'}</span>
                  </span>
                </div>

                <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#071529', margin: '14px 0 6px 0', lineHeight: 1.35 }}>
                  {dept.name}
                </h3>

                <p style={{ fontSize: '12.5px', color: '#627D98', lineHeight: 1.55 }}>
                  {dept.description}
                </p>

                {/* Metrics */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '14px', fontSize: '12px', color: '#071529', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BookOpen size={14} color="#0066F5" />
                    {dept.questionCount} Validated MCQs
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FileText size={14} color="#00A3C4" />
                    {dept.resourceCount} Blueprint Handouts
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '22px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => toggleDepartmentEnrollment(dept.id)}
                  style={{
                    flex: 1,
                    backgroundColor: isEnrolled ? '#F8FAFD' : '#071529',
                    color: isEnrolled ? '#334E68' : '#FFFFFF',
                    border: isEnrolled ? '1px solid #CBD5E1' : 'none',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    padding: '9px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isEnrolled ? (
                    <>
                      <CheckCircle2 size={14} color="#059669" />
                      <span>Enrolled (Leave)</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={14} />
                      <span>Enroll in Stream</span>
                    </>
                  )}
                </button>

                {isEnrolled && (
                  <button
                    onClick={() => setActiveTab('practice')}
                    className="btn-azure"
                    style={{
                      fontSize: '12.5px',
                      padding: '9px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Practice</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
