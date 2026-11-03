'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import InteractiveWaveChart from './InteractiveWaveChart';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Clock,
  FileText,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Download,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Search,
  Star,
  Users,
  Check,
  Flame,
  Activity,
  Layers,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

export default function StudentDashboard() {
  const {
    currentUser,
    departments,
    questions,
    exams,
    resources,
    trialRemaining,
    hasActiveEntitlement,
    openPaywall,
    setActiveTab,
  } = useApp();

  const enrolledDepts = departments.filter((d) =>
    currentUser.enrolledDepartmentIds.includes(d.id)
  );

  const isUnlimited = hasActiveEntitlement();

  // Mini Calendar State
  const [selectedDay, setSelectedDay] = useState<number>(2);
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  // Palette accent borders inspired by the image
  const getDeptAccent = (idx: number) => {
    const accents = [
      { text: '#0066F5', bg: '#EBF4FF', border: '#B9D9FE' }, // Electric Azure
      { text: '#00A3C4', bg: '#E0F7FA', border: '#B2EBF2' }, // Teal / Cyan
      { text: '#6B21A8', bg: '#F3E8FF', border: '#E9D5FF' }, // Royal Purple
      { text: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' }, // Coral Orange
      { text: '#0A2540', bg: '#EDF2F9', border: '#CBD5E1' }, // Deep Navy
    ];
    return accents[idx % accents.length];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Executive Navy Welcome Card (styled after the reference image top navy bar) */}
      <div
        className="apex-navy-banner"
        style={{
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(0, 102, 245, 0.25)',
                border: '1px solid rgba(0, 102, 245, 0.45)',
                color: '#60A5FA',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              Academic Year 2026
            </span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
              Ethiopian Higher Education Exit & Licensure Exam System
            </span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            Welcome back, {currentUser.fullName}
          </h1>

          <p style={{ fontSize: '13.5px', color: '#94A3B8', marginTop: '6px', lineHeight: 1.5 }}>
            Access verified single-choice question banks mapped to Ministry blueprints, or simulate timed exit mock examinations.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('practice')}
              className="btn-azure"
              style={{
                padding: '9px 18px',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <BookOpen size={14} />
              <span>Start Practice Mode</span>
              <ArrowRight size={13} />
            </button>

            <button
              onClick={() => setActiveTab('exams')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '12.5px',
                padding: '9px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Clock size={14} />
              <span>Launch Timed Mock</span>
            </button>
          </div>
        </div>

        {/* Right Status Badge */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: '200px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
            Candidate Entitlement
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: '4px 0' }}>
            {isUnlimited ? 'Unlimited Pro' : `${trialRemaining} of 5 Left`}
          </div>
          <span style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 500 }}>
            {isUnlimited ? 'Telebirr/CBE verified' : 'Free trial quota active'}
          </span>
        </div>
      </div>

      {/* 2. Top Metric Cards (colors inspired by reference image numbers: Teal, Azure, Navy, Coral) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Teal / Cyan Accent */}
        <div className="clean-card clean-card-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Enrolled Streams
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E0F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={15} color="#00A3C4" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#00A3C4', marginTop: '6px' }}>
            {enrolledDepts.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Official syllabus streams
          </div>
        </div>

        {/* Card 2: Electric Azure Accent */}
        <div className="clean-card clean-card-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Question Pool
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={15} color="#0066F5" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0066F5', marginTop: '6px' }}>
            {questions.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Single-choice vetted MCQs
          </div>
        </div>

        {/* Card 3: Deep Midnight Navy Accent */}
        <div className="clean-card clean-card-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Benchmark Pass Rate
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EDF2F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={15} color="#0A2540" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0A2540', marginTop: '6px' }}>
            94.2%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Target: ≥70% score
          </div>
        </div>

        {/* Card 4: Coral Orange Accent */}
        <div className="clean-card clean-card-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Timed Mock Exams
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={15} color="#EA580C" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#EA580C', marginTop: '6px' }}>
            {exams.length} Active
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Countdown & auto-submit
          </div>
        </div>
      </div>

      {/* 3. Main Split Grid: Left Analytics & Stream List + Right Sidebar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '24px',
        }}
        className="responsive-dashboard-grid"
      >
        {/* Left Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Visual Analytics Row: Competency Donut + Wave Chart */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '290px 1fr',
              gap: '20px',
            }}
            className="responsive-chart-grid"
          >
            {/* Competency Donut (directly reproducing the "Amount By Asset Class" Donut from the reference image) */}
            <div className="clean-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0A2540' }}>
                  Competency Mastery
                </h3>
                <span className="badge-azure">
                  Blueprinted
                </span>
              </div>

              {/* Multi-Color Donut SVG from Reference Image */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0' }}>
                <div style={{ position: 'relative', width: '145px', height: '145px' }}>
                  <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    {/* Background ring */}
                    <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#F1F5F9" strokeWidth="5" />

                    {/* Slice 1: Electric Azure (30%) */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.9155"
                      fill="transparent"
                      stroke="#0066F5"
                      strokeWidth="5"
                      strokeDasharray="30 70"
                      strokeDashoffset="0"
                    />

                    {/* Slice 2: Deep Midnight Navy (25%) */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.9155"
                      fill="transparent"
                      stroke="#0A2540"
                      strokeWidth="5"
                      strokeDasharray="25 75"
                      strokeDashoffset="-30"
                    />

                    {/* Slice 3: Royal Purple (24%) */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.9155"
                      fill="transparent"
                      stroke="#6B21A8"
                      strokeWidth="5"
                      strokeDasharray="24 76"
                      strokeDashoffset="-55"
                    />

                    {/* Slice 4: Coral Orange (21%) */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.9155"
                      fill="transparent"
                      stroke="#EA580C"
                      strokeWidth="5"
                      strokeDasharray="21 79"
                      strokeDashoffset="-79"
                    />
                  </svg>

                  {/* Donut Center Text */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#0A2540' }}>94.2%</span>
                    <span style={{ fontSize: '9.5px', color: '#627D98', fontWeight: 700, letterSpacing: '0.4px' }}>READINESS</span>
                  </div>
                </div>
              </div>

              {/* Legend with exact colors from reference image */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', borderTop: '1px solid var(--border-hairline)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0066F5' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Core Engineering / Clinical</span>
                  </div>
                  <strong style={{ color: '#0A2540' }}>30%</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0A2540' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Database & Architecture</span>
                  </div>
                  <strong style={{ color: '#0A2540' }}>25%</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6B21A8' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Applied Algorithms</span>
                  </div>
                  <strong style={{ color: '#0A2540' }}>24%</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA580C' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Ethics & Standards</span>
                  </div>
                  <strong style={{ color: '#0A2540' }}>21%</strong>
                </div>
              </div>
            </div>

            {/* Right: Dual Line Performance Chart (Azure & Deep Navy) */}
            <div>
              <InteractiveWaveChart />
            </div>
          </div>

          {/* Enrolled Degree Streams Section */}
          <div className="clean-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0A2540' }}>
                  Enrolled Degree Streams
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Curriculum mapped to Ethiopian Ministry of Education requirements
                </p>
              </div>

              <button
                onClick={() => setActiveTab('departments')}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0066F5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>All Streams</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {enrolledDepts.map((dept, idx) => {
                const accent = getDeptAccent(idx);
                const progressPct = [78, 62, 85, 45, 90][idx % 5];

                return (
                  <div
                    key={dept.id}
                    className="clean-card clean-card-hover"
                    style={{
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid var(--border-hairline)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: accent.bg,
                            border: `1px solid ${accent.border}`,
                            color: accent.text,
                          }}
                        >
                          {dept.code}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {dept.questionCount} Questions
                        </span>
                      </div>

                      <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0A2540', marginBottom: '4px' }}>
                        {dept.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, minHeight: '34px' }}>
                        {dept.description}
                      </p>

                      {/* Progress Bar in Electric Azure */}
                      <div style={{ margin: '14px 0 6px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Blueprint Coverage</span>
                          <span style={{ color: '#0066F5' }}>{progressPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', backgroundColor: '#EDF2F9', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${progressPct}%`,
                              height: '100%',
                              backgroundColor: '#0066F5',
                              borderRadius: '9999px',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('practice')}
                      style={{
                        marginTop: '16px',
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #B9D9FE',
                        color: '#0066F5',
                        fontWeight: 600,
                        fontSize: '12px',
                        padding: '8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>Practice Stream</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (Calendar, Upcoming Mocks, Billing) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Interactive Month Calendar */}
          <div className="clean-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={16} color="#0066F5" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0A2540' }}>
                  November 2026
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#9FB3C8', marginBottom: '8px' }}>
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Days Grid with Azure Highlight */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
              {daysInMonth.map((day) => {
                const isSelected = day === selectedDay;
                const hasEvent = day === 5 || day === 12 || day === 20;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      height: '30px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? '#0066F5' : 'transparent',
                      color: isSelected ? '#FFFFFF' : hasEvent ? '#0066F5' : '#0A2540',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{day}</span>
                    {hasEvent && !isSelected && (
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#0066F5', position: 'absolute', bottom: '2px' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Upcoming Timed Mocks */}
          <div className="clean-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0A2540' }}>
                Upcoming Timed Mocks
              </h3>
              <span className="badge-navy">
                2 Ready
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#EDF2F9',
                  border: '1px solid #CBD5E1',
                }}
              >
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0A2540' }}>
                  National Exit Exam Mock #01
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Tomorrow, 09:00 AM • 100 Questions • 3 Hours
                </div>
                <button
                  onClick={() => setActiveTab('exams')}
                  style={{
                    marginTop: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#0066F5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                  }}
                >
                  <span>Launch Simulation Hall</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0A2540' }}>
                  Database Architecture Review
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Nov 05, 02:00 PM • 50 Questions • 90 Mins
                </div>
                <button
                  onClick={() => setActiveTab('practice')}
                  style={{
                    marginTop: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#0066F5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                  }}
                >
                  <span>Review Question Blueprint</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Payment & Entitlement Card */}
          <div className="clean-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0A2540' }}>
                Entitlement & Billing
              </h3>
              <CreditCard size={15} color="#0066F5" />
            </div>

            <div
              style={{
                backgroundColor: isUnlimited ? '#ECFDF5' : '#FFF7ED',
                border: `1px solid ${isUnlimited ? '#A7F3D0' : '#FED7AA'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: isUnlimited ? '#065F46' : '#9A3412' }}>
                {isUnlimited ? 'Active Pro Subscription' : 'Free Trial (5/5 Attempts)'}
              </div>
              <div style={{ fontSize: '11px', color: isUnlimited ? '#047857' : '#C2410C', marginTop: '2px' }}>
                {isUnlimited ? 'Telebirr & CBE Birr approved' : `${trialRemaining} attempts remaining`}
              </div>
            </div>

            <button
              onClick={openPaywall}
              className="btn-navy"
              style={{
                width: '100%',
                fontSize: '12px',
                padding: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>{isUnlimited ? 'View Receipt Details' : 'Upgrade via Telebirr / CBE'}</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
