'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  Award,
  Check,
  Star,
  Users,
  Timer,
  Lightbulb,
  RotateCcw,
  Smartphone,
  Building2,
  HelpCircle,
  BarChart3,
  Flame,
  Zap,
  Activity,
  Compass
} from 'lucide-react';

interface SampleQuestion {
  dept: string;
  code: string;
  competency: string;
  question: string;
  options: { label: string; text: string }[];
  correctIdx: number;
  rationale: string;
}

const SAMPLE_QUESTIONS: SampleQuestion[] = [
  {
    dept: 'Computer Science',
    code: 'CS-2026',
    competency: 'Database Systems & Normalization',
    question: 'In Relational Database Design, which Normal Form guarantees the complete absence of transitive functional dependencies on candidate keys?',
    options: [
      { label: 'A', text: 'First Normal Form (1NF)' },
      { label: 'B', text: 'Second Normal Form (2NF)' },
      { label: 'C', text: 'Third Normal Form (3NF)' },
      { label: 'D', text: 'Boyce-Codd Normal Form (BCNF)' }
    ],
    correctIdx: 2,
    rationale: 'Third Normal Form (3NF) requires 2NF plus no non-prime attribute may transitively depend on any candidate key. This directly eliminates transitive dependencies.'
  },
  {
    dept: 'Clinical Medicine',
    code: 'MED-2026',
    competency: 'Clinical Pharmacology & Therapeutics',
    question: 'A 45-year-old patient with newly diagnosed Type 2 Diabetes Mellitus and normal renal function is initiating pharmacotherapy. What is the standard first-line oral agent recommended by clinical guidelines?',
    options: [
      { label: 'A', text: 'Glibenclamide (Sulfonylurea)' },
      { label: 'B', text: 'Metformin (Biguanide)' },
      { label: 'C', text: 'Pioglitazone (Thiazolidinedione)' },
      { label: 'D', text: 'Sitagliptin (DPP-4 Inhibitor)' }
    ],
    correctIdx: 1,
    rationale: 'Metformin is universally recommended as first-line monotherapy for Type 2 Diabetes due to proven glycemic efficacy, weight neutrality, and cardiovascular safety.'
  },
  {
    dept: 'Electrical Engineering',
    code: 'ECE-2026',
    competency: 'Signals & Communication Systems',
    question: 'According to the Nyquist-Shannon Sampling Theorem, what is the minimum sampling frequency required to perfectly reconstruct a bandlimited signal with a maximum frequency component of 12 kHz?',
    options: [
      { label: 'A', text: '12 kHz' },
      { label: 'B', text: '18 kHz' },
      { label: 'C', text: '24 kHz' },
      { label: 'D', text: '48 kHz' }
    ],
    correctIdx: 2,
    rationale: 'The Nyquist rate requires sampling frequency fs ≥ 2 × fmax. For fmax = 12 kHz, minimum fs = 24 kHz.'
  }
];

export default function LandingPage() {
  const { openAuth, departments, packages } = useApp();

  // Interactive Live Exam OS State
  const [activeSampleIdx, setActiveSampleIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(9852);

  // Department stream explorer tab
  const [activeStreamId, setActiveStreamId] = useState('dept-1');

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Timer countdown ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 10800));
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = SAMPLE_QUESTIONS[activeSampleIdx];
  const selectedDept = departments.find((d) => d.id === activeStreamId) || departments[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
  };

  const handleNextSample = () => {
    setSelectedOpt(null);
    setIsAnswered(false);
    setActiveSampleIdx((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
  };

  const faqs = [
    {
      q: 'How does the free trial work?',
      a: 'Every student registration instantly credits your account with 5 free question attempts with zero payment or credit card required. You can experience the real single-choice testing interface with instant rationales before choosing an upgrade package.',
    },
    {
      q: 'How do I pay using Telebirr or CBE Birr?',
      a: 'Select your preferred package, transfer the exact fee to our official Telebirr phone number or CBE account number, and upload your receipt screenshot or reference code. Administrators verify the bank record and activate your account rapidly.',
    },
    {
      q: 'Are the questions aligned with the Ministry Exit Exam blueprints?',
      a: 'Yes. All questions and study blueprints are mapped strictly to the competencies mandated by the Ethiopian Ministry of Education for higher education exit and licensure examinations.',
    },
    {
      q: 'Can I take full timed mock exams during preparation?',
      a: 'Yes! Pro and Complete package subscribers gain unlimited access to timed mock examinations featuring live countdown timers, question palette navigation, auto-submission on timeout, and detailed competency breakdowns.',
    },
  ];

  return (
    <div className="creative-mesh-bg" style={{ minHeight: '100vh', color: 'var(--text-primary)', position: 'relative' }}>
      {/* 1. Floating Island Glass Navigation Bar */}
      <div style={{ position: 'sticky', top: '16px', zIndex: 50, padding: '0 24px', maxWidth: '1120px', margin: '0 auto' }}>
        <header
          className="island-navbar"
          style={{
            height: '58px',
            borderRadius: '9999px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#071529',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px',
                boxShadow: '0 2px 8px rgba(7, 21, 41, 0.25)',
              }}
            >
              A
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#071529', letterSpacing: '-0.3px' }}>
                  Apex Assess
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: '#EBF4FF',
                    color: '#0066F5',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                  }}
                >
                  Exit Exam OS
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px', fontWeight: 600, color: '#334E68' }}>
            <a href="#sandbox" style={{ transition: 'color 0.15s ease' }}>Interactive Studio</a>
            <a href="#bento" style={{ transition: 'color 0.15s ease' }}>Architecture</a>
            <a href="#streams" style={{ transition: 'color 0.15s ease' }}>Degree Streams</a>
            <a href="#pricing" style={{ transition: 'color 0.15s ease' }}>Pricing</a>
            <a href="#faq" style={{ transition: 'color 0.15s ease' }}>FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => openAuth('login')}
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#071529',
                padding: '7px 14px',
                borderRadius: '9999px',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>

            <button
              onClick={() => openAuth('register')}
              className="btn-azure"
              style={{
                fontSize: '12.5px',
                padding: '8px 18px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Get 5 Free Questions</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </header>
      </div>

      {/* 2. Asymmetric Creative Hero Section */}
      <section
        style={{
          padding: '64px 24px 56px 24px',
          maxWidth: '1160px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center',
          }}
          className="responsive-dashboard-grid"
        >
          {/* Left Column: Punchy Editorial Copy */}
          <div>
            <div
              className="badge-azure"
              style={{
                padding: '5px 14px',
                marginBottom: '20px',
              }}
            >
              <span className="live-pulse-azure" />
              <span>Academic Year 2026 Ethiopian Higher Education Exit Exam Platform</span>
            </div>

            <h1
              style={{
                fontSize: '46px',
                fontWeight: 900,
                color: '#071529',
                letterSpacing: '-1.4px',
                lineHeight: 1.1,
              }}
            >
              The Next-Gen <span className="gradient-text-azure">Exam OS</span> For Ethiopian Graduates
            </h1>

            <p
              style={{
                fontSize: '16px',
                color: '#627D98',
                marginTop: '18px',
                lineHeight: 1.6,
                maxWidth: '520px',
              }}
            >
              Replace anxiety with blueprint certainty. Practice single-choice verified MCQs mapped directly to Ministry competencies, simulate real high-stakes timed exams, and unlock access via Telebirr or CBE Birr.
            </p>

            {/* Direct CTA */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '30px', flexWrap: 'wrap' }}>
              <button
                onClick={() => openAuth('register')}
                className="btn-azure"
                style={{
                  fontSize: '14px',
                  padding: '13px 26px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Claim 5 Free Questions</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => openAuth('login')}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#071529',
                  border: '1px solid #CBD5E1',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '13px 22px',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                Sign In to Workspace
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '28px', fontSize: '12px', color: '#627D98' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#0066F5" />
                <strong>35,400+</strong> Candidates
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#00A3C4" />
                <strong>94.2%</strong> Pass Rate
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#059669" />
                <strong>Instant</strong> Telebirr & CBE
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Live Exam OS Studio Card */}
          <div id="sandbox" style={{ position: 'relative' }}>
            {/* Corner floating pill 1 */}
            <div
              style={{
                position: 'absolute',
                top: '-16px',
                right: '20px',
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid #B9D9FE',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#0066F5',
                boxShadow: '0 8px 20px -4px rgba(0, 102, 245, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Trophy size={14} color="#0066F5" />
              <span>94.2% Predictive Pass Index</span>
            </div>

            {/* Main Interactive Studio Terminal Window */}
            <div
              className="bento-card"
              style={{
                borderRadius: '18px',
                boxShadow: '0 25px 50px -12px rgba(7, 21, 41, 0.16), 0 0 0 1px rgba(0, 102, 245, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Terminal Window Header Bar in Midnight Navy */}
              <div
                style={{
                  backgroundColor: '#071529',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginLeft: '6px', letterSpacing: '0.4px' }}>
                    EXAM OS • {currentQ.code}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'rgba(0, 102, 245, 0.2)',
                      border: '1px solid rgba(0, 102, 245, 0.4)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#60A5FA',
                    }}
                  >
                    <Timer size={12} />
                    <span>⏱ {formatTimer(secondsRemaining)}</span>
                  </div>

                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {currentQ.dept}
                  </span>
                </div>
              </div>

              {/* Terminal Body */}
              <div style={{ padding: '24px 26px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0066F5', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Competency: {currentQ.competency}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9FB3C8', fontWeight: 600 }}>
                    Question {activeSampleIdx + 1} of {SAMPLE_QUESTIONS.length}
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#071529', lineHeight: 1.5, marginBottom: '20px' }}>
                  {currentQ.question}
                </h3>

                {/* 4 Interactive Option Pills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentQ.options.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    const isCorrect = oIdx === currentQ.correctIdx;

                    let bg = '#FFFFFF';
                    let border = '#E2E8F0';
                    let text = '#071529';

                    if (isAnswered) {
                      if (isCorrect) {
                        bg = '#ECFDF5';
                        border = '#059669';
                        text = '#065F46';
                      } else if (isSelected) {
                        bg = '#FEF2F2';
                        border = '#DC2626';
                        text = '#991B1B';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          backgroundColor: bg,
                          border: `1.5px solid ${border}`,
                          color: text,
                          cursor: isAnswered ? 'default' : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: `1.5px solid ${isAnswered && isCorrect ? '#059669' : '#CBD5E1'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {opt.label}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>
                          {opt.text}
                        </span>
                        {isAnswered && isCorrect && <CheckCircle2 size={18} color="#059669" />}
                      </button>
                    );
                  })}
                </div>

                {/* Instant Rationale Pop-in */}
                {isAnswered && (
                  <div
                    className="animate-fade-in"
                    style={{
                      marginTop: '16px',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      backgroundColor: selectedOpt === currentQ.correctIdx ? '#ECFDF5' : '#FFF7ED',
                      border: `1px solid ${selectedOpt === currentQ.correctIdx ? '#A7F3D0' : '#FED7AA'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Lightbulb size={15} color={selectedOpt === currentQ.correctIdx ? '#059669' : '#EA580C'} />
                      <strong style={{ fontSize: '12px', color: selectedOpt === currentQ.correctIdx ? '#065F46' : '#9A3412' }}>
                        {selectedOpt === currentQ.correctIdx ? '✓ Correct Answer!' : 'Ministry Syllabus Reference:'}
                      </strong>
                    </div>
                    <p style={{ fontSize: '12px', color: selectedOpt === currentQ.correctIdx ? '#047857' : '#9A3412', lineHeight: 1.5 }}>
                      {currentQ.rationale}
                    </p>

                    <button
                      onClick={handleNextSample}
                      style={{
                        marginTop: '10px',
                        backgroundColor: '#071529',
                        color: '#FFFFFF',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>Try Next Stream Sample</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4-Cell Creative Bento Grid Architecture */}
      <section id="bento" style={{ padding: '64px 24px', maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge-navy">High-Performance Exam Engine</span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#071529', marginTop: '8px', letterSpacing: '-0.8px' }}>
            Built With Examination Blueprint Rigor
          </h2>
          <p style={{ fontSize: '14px', color: '#627D98', marginTop: '6px', maxWidth: '600px', margin: '6px auto 0 auto' }}>
            Everything you need to surpass the 70% benchmark pass mark on your first sitting.
          </p>
        </div>

        {/* 4 Creative Bento Tiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '20px',
          }}
          className="responsive-dashboard-grid"
        >
          {/* Bento Tile 1: Interactive Blueprint Radar & Competency Weightings */}
          <div className="bento-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={20} color="#0066F5" />
              </div>
              <span className="badge-azure">Direct Ministry Alignment</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071529' }}>
              National Blueprint Competency Weights
            </h3>
            <p style={{ fontSize: '13px', color: '#627D98', marginTop: '4px', lineHeight: 1.5 }}>
              Questions aren&apos;t random. They strictly match the percentage distributions dictated by the Ethiopian Ministry of Education.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  <span>Domain Core Competencies (Level 1-3)</span>
                  <span style={{ color: '#0066F5' }}>30% Weight</span>
                </div>
                <div style={{ width: '100%', height: '7px', backgroundColor: '#EDF3FB', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '30%', height: '100%', backgroundColor: '#0066F5' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  <span>Applied Problem Solving & Synthesis</span>
                  <span style={{ color: '#00A3C4' }}>25% Weight</span>
                </div>
                <div style={{ width: '100%', height: '7px', backgroundColor: '#EDF3FB', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', backgroundColor: '#00A3C4' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  <span>Clinical / Engineering Practical Analysis</span>
                  <span style={{ color: '#6B21A8' }}>25% Weight</span>
                </div>
                <div style={{ width: '100%', height: '7px', backgroundColor: '#EDF3FB', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', backgroundColor: '#6B21A8' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  <span>Professional Ethics & Regulatory Standards</span>
                  <span style={{ color: '#EA580C' }}>20% Weight</span>
                </div>
                <div style={{ width: '100%', height: '7px', backgroundColor: '#EDF3FB', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '20%', height: '100%', backgroundColor: '#EA580C' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bento Tile 2: Timed Mock Simulation Engine */}
          <div className="bento-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="#EA580C" />
              </div>
              <span className="badge-orange">Real Hall Conditions</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071529' }}>
              Pressure Simulator
            </h3>
            <p style={{ fontSize: '13px', color: '#627D98', marginTop: '4px', lineHeight: 1.5 }}>
              Live countdown clock, full 100-question matrix palette, and auto-submission on timeout.
            </p>

            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#071529',
                color: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>PALETTE NAVIGATION</span>
                <span style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 700 }}>⏱ 02:59:45</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: i === 0 ? '#0066F5' : i < 6 ? 'rgba(0, 102, 245, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bento Bottom Row: 2 Cells */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px',
          }}
          className="responsive-dashboard-grid"
        >
          {/* Bento Tile 3: Telebirr & CBE 1-Tap Workflow */}
          <div className="bento-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#E0F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} color="#00A3C4" />
              </div>
              <span className="badge-cyan">Official Payment Channels</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071529' }}>
              Telebirr & CBE Birr Instant Grant
            </h3>
            <p style={{ fontSize: '13px', color: '#627D98', marginTop: '4px', lineHeight: 1.5 }}>
              Transfer via your banking app, upload your receipt screenshot or enter the transaction reference number, and receive instant administrative activation.
            </p>

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFD', border: '1px solid #E2E8F0', fontSize: '11.5px', fontWeight: 700, color: '#071529' }}>
                📱 Telebirr: 0911223344
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFD', border: '1px solid #E2E8F0', fontSize: '11.5px', fontWeight: 700, color: '#071529' }}>
                🏦 CBE: 1000123456789
              </div>
            </div>
          </div>

          {/* Bento Tile 4: Predictive Pass Probability */}
          <div className="bento-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={20} color="#6B21A8" />
              </div>
              <span className="badge-purple">Pass Probability AI</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071529' }}>
              Competency Predictive Score
            </h3>
            <p style={{ fontSize: '13px', color: '#627D98', marginTop: '4px', lineHeight: 1.5 }}>
              Our analytics correlate your practice accuracy with past national exit exam thresholds so you know exactly when you are ready to sit for the real exam.
            </p>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0066F5' }}>
                94.2%
              </div>
              <div style={{ fontSize: '11.5px', color: '#627D98', lineHeight: 1.4 }}>
                Candidates scoring ≥75% on our mock exams passed the Ministry exit exam on their first attempt.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Degree Streams Showcase */}
      <section id="streams" style={{ backgroundColor: '#FFFFFF', padding: '72px 24px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span className="badge-azure">National Higher Education Streams</span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#071529', marginTop: '8px', letterSpacing: '-0.8px' }}>
              Curriculum Mapped For Your Degree
            </h2>
            <p style={{ fontSize: '14px', color: '#627D98', marginTop: '6px' }}>
              Select your academic discipline to preview active questions and blueprint weighting.
            </p>

            {/* Department Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
              {departments.map((dept) => {
                const isSelected = dept.id === activeStreamId;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setActiveStreamId(dept.id)}
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      padding: '8px 18px',
                      borderRadius: '9999px',
                      border: isSelected ? '1px solid #0066F5' : '1px solid #CBD5E1',
                      backgroundColor: isSelected ? '#0066F5' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#334E68',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 102, 245, 0.25)' : 'none',
                    }}
                  >
                    {dept.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Stream Feature Spotlight */}
          <div
            className="bento-card responsive-dashboard-grid"
            style={{
              padding: '36px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '36px',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge-azure">{selectedDept.code}</span>
                <span style={{ fontSize: '12px', color: '#627D98', fontWeight: 600 }}>
                  {selectedDept.questionCount} Validated MCQs Ready
                </span>
              </div>

              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#071529', marginTop: '6px' }}>
                {selectedDept.name} Exit Blueprint
              </h3>

              <p style={{ fontSize: '13.5px', color: '#627D98', marginTop: '10px', lineHeight: 1.6 }}>
                {selectedDept.description}
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button
                  onClick={() => openAuth('register')}
                  className="btn-azure"
                  style={{
                    padding: '10px 22px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Practice {selectedDept.code} Questions</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Visual Modules Card */}
            <div
              style={{
                backgroundColor: '#F8FAFD',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#071529', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={16} color="#0066F5" />
                <span>Syllabus Competency Coverage</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                  <span>Core Theory & System Design</span>
                  <span style={{ color: '#0066F5' }}>30% of Exam</span>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                  <span>Applied Problem Solving</span>
                  <span style={{ color: '#00A3C4' }}>25% of Exam</span>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                  <span>Case Analysis & Diagnosis</span>
                  <span style={{ color: '#6B21A8' }}>25% of Exam</span>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                  <span>Professional Ethics & Law</span>
                  <span style={{ color: '#EA580C' }}>20% of Exam</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Creative Modern Pricing */}
      <section id="pricing" style={{ padding: '72px 24px', maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span className="badge-azure">Transparent Academic Plans</span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#071529', marginTop: '8px', letterSpacing: '-0.8px' }}>
            Start With 5 Free Questions, Upgrade When Ready
          </h2>
          <p style={{ fontSize: '14px', color: '#627D98', marginTop: '6px' }}>
            Instant account activation via Telebirr or CBE Birr receipt verification.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {packages.map((pkg) => {
            const isPro = pkg.popular;

            return (
              <div
                key={pkg.id}
                className="bento-card"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isPro ? '2px solid #0066F5' : '1px solid #E2E8F0',
                  boxShadow: isPro ? '0 12px 30px -4px rgba(0, 102, 245, 0.2)' : 'var(--shadow-card)',
                  position: 'relative',
                }}
              >
                {isPro && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#0066F5',
                      color: '#FFFFFF',
                      fontSize: '10.5px',
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
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#071529' }}>
                    {pkg.name}
                  </div>
                  <p style={{ fontSize: '12px', color: '#627D98', marginTop: '4px', minHeight: '34px' }}>
                    {pkg.description}
                  </p>

                  <div style={{ margin: '18px 0 16px 0' }}>
                    <span style={{ fontSize: '32px', fontWeight: 900, color: '#071529' }}>
                      {pkg.price}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#627D98', marginLeft: '4px' }}>
                      {pkg.currency} / {pkg.durationDays}d
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#334E68' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#0066F5" />
                      <span>{pkg.questionLimit === 'unlimited' ? 'Unlimited Questions' : `${pkg.questionLimit} Questions`}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#0066F5" />
                      <span>Timed Exit Mock Exams</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#0066F5" />
                      <span>Telebirr & CBE Birr</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#0066F5" />
                      <span>Instant Answer Rationales</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openAuth('register')}
                  className={isPro ? 'btn-azure' : ''}
                  style={{
                    marginTop: '24px',
                    width: '100%',
                    backgroundColor: isPro ? undefined : '#FFFFFF',
                    color: isPro ? '#FFFFFF' : '#071529',
                    border: isPro ? 'none' : '1px solid #CBD5E1',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '10px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <span>Select Plan</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Creative FAQ Accordion */}
      <section id="faq" style={{ padding: '64px 24px', maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge-navy">Candidate Support</span>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#071529', marginTop: '6px' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bento-card"
                style={{
                  padding: '18px 22px',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedFaq(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#071529' }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    color="#627D98"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>

                {isOpen && (
                  <p style={{ fontSize: '13px', color: '#627D98', marginTop: '12px', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Footer */}
      <footer
        style={{
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          padding: '36px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '12px',
          color: '#627D98',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 800, color: '#071529' }}>Apex Assess</span>
          <span>•</span>
          <span>National Higher Education Exit & Licensure Exam System</span>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => openAuth('login')} style={{ color: '#334E68', fontWeight: 600 }}>Candidate Login</button>
          <button onClick={() => openAuth('register')} style={{ color: '#334E68', fontWeight: 600 }}>Student Registration</button>
          <button onClick={() => openAuth('login')} style={{ color: '#334E68', fontWeight: 600 }}>Administrator Portal</button>
        </div>
      </footer>
    </div>
  );
}

function Trophy(props: { size?: number; color?: string }) {
  return <Award {...props} />;
}
