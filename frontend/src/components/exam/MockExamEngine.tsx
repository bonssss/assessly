'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Exam, Question, ExamAttempt } from '@/types';
import confetti from 'canvas-confetti';
import {
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Timer,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function MockExamEngine() {
  const {
    exams,
    questions,
    departments,
    currentUser,
    recordExamAttempt,
    showToast,
    canAttemptQuestion,
    openPaywall,
  } = useApp();

  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [isExamInProgress, setIsExamInProgress] = useState<boolean>(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [lastAttempt, setLastAttempt] = useState<ExamAttempt | null>(null);

  const examQuestions: Question[] = activeExam
    ? (activeExam.questionIds
        .map((qid) => questions.find((q) => q.id === qid))
        .filter(Boolean) as Question[])
    : [];

  const currentQ = examQuestions[currentQuestionIndex];

  useEffect(() => {
    if (!isExamInProgress || isFinished) return;

    if (secondsRemaining <= 0) {
      handleFinalSubmit('timeout');
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamInProgress, isFinished, secondsRemaining]);

  const handleStartExam = (exam: Exam) => {
    if (!canAttemptQuestion(exam.departmentId)) {
      openPaywall();
      showToast('Free trial quota exhausted. Upgrade for full mock exam access.');
      return;
    }

    setActiveExam(exam);
    setSecondsRemaining(exam.durationMinutes * 60);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setIsFinished(false);
    setLastAttempt(null);
    setIsExamInProgress(true);
    showToast(`Exam started: "${exam.title}" - Timer active.`);
  };

  const handleSelectOption = (optId: string) => {
    if (!currentQ || isFinished) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optId,
    }));
  };

  const toggleFlag = (qid: string) => {
    setFlaggedQuestions((prev) => {
      const updated = new Set(prev);
      if (updated.has(qid)) {
        updated.delete(qid);
        showToast('Question unflagged');
      } else {
        updated.add(qid);
        showToast('Flagged for review before final submit');
      }
      return updated;
    });
  };

  const handleFinalSubmit = (reason: 'manual' | 'timeout' = 'manual') => {
    if (!activeExam) return;

    let totalEarned = 0;
    let maxMarks = 0;

    examQuestions.forEach((q) => {
      maxMarks += q.marks;
      if (userAnswers[q.id] === q.correctOptionId) {
        totalEarned += q.marks;
      }
    });

    const percentage = Math.round((totalEarned / Math.max(1, maxMarks)) * 100);
    const timeSpent = activeExam.durationMinutes * 60 - secondsRemaining;
    const dept = departments.find((d) => d.id === activeExam.departmentId);

    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      examId: activeExam.id,
      examTitle: activeExam.title,
      departmentId: activeExam.departmentId,
      departmentName: dept?.name || 'Department',
      userId: currentUser.id,
      startedAt: new Date(Date.now() - timeSpent * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
      score: totalEarned,
      totalMarks: maxMarks,
      percentage,
      status: 'completed',
      userAnswers,
    };

    setIsFinished(true);
    setIsExamInProgress(false);
    setLastAttempt(attempt);
    recordExamAttempt(attempt);

    if (percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast(`🎉 Congratulations! You achieved ${percentage}% (Passing Benchmark ≥70%).`);
    } else {
      showToast(`Exam completed: ${percentage}%. Benchmark is 70%. Review rationales below.`);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // 1. Exam Result & Rationale View
  if (isFinished && lastAttempt && activeExam) {
    const isPassed = lastAttempt.percentage >= 70;

    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Score Hero Card */}
        <div
          className="cockpit-frame"
          style={{
            padding: '36px 32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: isPassed ? '#ECFDF5' : '#FEF2F2',
              color: isPassed ? '#059669' : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: `2px solid ${isPassed ? '#A7F3D0' : '#FECACA'}`,
            }}
          >
            {isPassed ? <Award size={30} /> : <AlertCircle size={30} />}
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isPassed ? '#ECFDF5' : '#FFF7ED',
              color: isPassed ? '#065F46' : '#C2410C',
              border: `1px solid ${isPassed ? '#A7F3D0' : '#FFEDD5'}`,
              fontSize: '11.5px',
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            {isPassed ? '✓ Qualified National Licensure Benchmark' : 'Needs Reinforcement (Under 70%)'}
          </span>

          <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#071529', margin: '14px 0 4px 0', letterSpacing: '-0.8px' }}>
            Score: {lastAttempt.score} / {lastAttempt.totalMarks} ({lastAttempt.percentage}%)
          </h2>

          <p style={{ fontSize: '13.5px', color: '#627D98', maxWidth: '520px', margin: '0 auto' }}>
            Completed &ldquo;{lastAttempt.examTitle}&rdquo; in {Math.round(lastAttempt.timeSpentSeconds / 60)} minutes under simulated exit exam conditions.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={() => handleStartExam(activeExam)}
              className="btn-azure"
              style={{
                fontSize: '13px',
                padding: '10px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              <span>Retake Mock Exam</span>
            </button>

            <button
              onClick={() => {
                setIsFinished(false);
                setActiveExam(null);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#071529',
                fontWeight: 700,
                fontSize: '13px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
              }}
            >
              Exams Catalog
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#071529' }}>
              Detailed Question Breakdown & Rationales
            </h3>
            <span className="badge-navy">{examQuestions.length} Questions Reviewed</span>
          </div>

          {examQuestions.map((q, idx) => {
            const userAnswer = userAnswers[q.id];
            const isCorrect = userAnswer === q.correctOptionId;

            return (
              <div
                key={q.id}
                className="cockpit-frame"
                style={{
                  padding: '22px 26px',
                  borderLeft: `4px solid ${isCorrect ? '#059669' : '#DC2626'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#071529', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px' }}>
                      Q{idx + 1}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#071529' }}>
                      {q.topic}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: isCorrect ? '#059669' : '#DC2626',
                    }}
                  >
                    {isCorrect ? `+${q.marks} Marks` : '0 Marks'}
                  </span>
                </div>

                <p style={{ fontSize: '14.5px', fontWeight: 700, color: '#071529', marginBottom: '16px', lineHeight: 1.5 }}>
                  {q.body}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isSelected = userAnswer === opt.id;
                    const isRealCorrect = opt.id === q.correctOptionId;

                    let bg = '#FFFFFF';
                    let border = '#E2E8F0';
                    let text = '#334E68';

                    if (isRealCorrect) {
                      bg = '#ECFDF5';
                      border = '#A7F3D0';
                      text = '#065F46';
                    } else if (isSelected && !isRealCorrect) {
                      bg = '#FEF2F2';
                      border = '#FECACA';
                      text = '#991B1B';
                    }

                    return (
                      <div
                        key={opt.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: bg,
                          border: `1.5px solid ${border}`,
                          fontSize: '13px',
                          color: text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 800, fontSize: '11px' }}>[{letter}]</span>
                          <span style={{ fontWeight: isRealCorrect || isSelected ? 700 : 500 }}>{opt.text}</span>
                        </div>
                        {isRealCorrect && <CheckCircle2 size={16} color="#059669" />}
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFD',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    color: '#334E68',
                    lineHeight: 1.55,
                  }}
                >
                  <strong style={{ color: '#071529' }}>Ministry Syllabus Rationale: </strong>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Active Live Exam Mode
  if (isExamInProgress && activeExam) {
    const isTimerUrgent = secondsRemaining < 180;
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 310px',
          gap: '20px',
          alignItems: 'start',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
        className="responsive-dashboard-grid"
      >
        {/* Left Column: Main Question Screen */}
        <div className="cockpit-frame" style={{ padding: '28px 32px' }}>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#071529',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  letterSpacing: '0.3px',
                }}
              >
                Question {currentQuestionIndex + 1} of {examQuestions.length}
              </span>
              <span className="badge-navy">{currentQ?.topic}</span>
            </div>

            {/* Flag for Review */}
            <button
              onClick={() => currentQ && toggleFlag(currentQ.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: currentQ && flaggedQuestions.has(currentQ.id) ? '#FFF7ED' : '#F8FAFD',
                color: currentQ && flaggedQuestions.has(currentQ.id) ? '#EA580C' : '#627D98',
                border: `1px solid ${currentQ && flaggedQuestions.has(currentQ.id) ? '#FED7AA' : '#E2E8F0'}`,
                transition: 'all 0.15s ease',
              }}
            >
              <Flag size={13} fill={currentQ && flaggedQuestions.has(currentQ.id) ? '#EA580C' : 'none'} />
              <span>{currentQ && flaggedQuestions.has(currentQ.id) ? 'Flagged for Review' : 'Flag Question'}</span>
            </button>
          </div>

          {/* Question Text */}
          <h2
            style={{
              fontSize: '16.5px',
              fontWeight: 700,
              color: '#071529',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {currentQ?.body}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQ?.options.map((opt, idx) => {
              const isSelected = userAnswers[currentQ.id] === opt.id;
              const letter = String.fromCharCode(65 + idx);

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`exam-option-card ${isSelected ? 'selected' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#0066F5' : '#EDF3FB',
                        color: isSelected ? '#FFFFFF' : '#071529',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '11.5px',
                        flexShrink: 0,
                      }}
                    >
                      {letter}
                    </div>

                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: isSelected ? 700 : 500,
                        color: '#071529',
                      }}
                    >
                      {opt.text}
                    </span>
                  </div>

                  {isSelected && <CheckCircle2 size={18} color="#0066F5" />}
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '28px',
              paddingTop: '18px',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: currentQuestionIndex === 0 ? '#9FB3C8' : '#334E68',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === examQuestions.length - 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: currentQuestionIndex === examQuestions.length - 1 ? '#9FB3C8' : '#334E68',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: currentQuestionIndex === examQuestions.length - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Column: Digital Countdown HUD & Question Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Digital Timer HUD */}
          <div
            className="cockpit-frame"
            style={{
              padding: '20px',
              textAlign: 'center',
              backgroundColor: isTimerUrgent ? '#FEF2F2' : '#FFFFFF',
              border: isTimerUrgent ? '1.5px solid #FECACA' : '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: isTimerUrgent ? '#DC2626' : '#627D98', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              <Timer size={13} />
              <span>Time Remaining</span>
            </div>

            <div
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: isTimerUrgent ? '#DC2626' : '#071529',
                letterSpacing: '0.5px',
                margin: '6px 0',
                fontFamily: 'monospace',
              }}
            >
              {formatTimer(secondsRemaining)}
            </div>

            <p style={{ fontSize: '11px', color: '#9FB3C8' }}>
              Auto-submits strictly at 00:00
            </p>
          </div>

          {/* Question Palette Matrix */}
          <div className="cockpit-frame" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#071529' }}>
                Questions Matrix
              </div>
              <span className="badge-azure">
                {answeredCount}/{examQuestions.length} Done
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {examQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = !!userAnswers[q.id];
                const isFlagged = flaggedQuestions.has(q.id);

                let btnClass = 'palette-btn';
                if (isCurrent) {
                  btnClass += ' palette-btn-active';
                } else if (isFlagged) {
                  btnClass += ' palette-btn-flagged';
                } else if (isAnswered) {
                  btnClass += ' palette-btn-answered';
                } else {
                  btnClass += ' palette-btn-unanswered';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={btnClass}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleFinalSubmit('manual')}
              className="btn-azure"
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '11px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Send size={14} />
              <span>Submit & Finish Exam</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Catalog View
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="cockpit-frame" style={{ padding: '24px 28px' }}>
        <span className="badge-navy">Ministry Exit & Licensure Simulations</span>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#071529', marginTop: '6px', letterSpacing: '-0.4px' }}>
          Standardized Exit Mock Examinations
        </h2>
        <p style={{ fontSize: '13px', color: '#627D98', marginTop: '4px' }}>
          Timed simulations modeled after Ethiopia&apos;s computer-based test halls. Auto-submission enforced upon timeout with full rationale analysis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {exams.map((exam) => {
          const dept = departments.find((d) => d.id === exam.departmentId);

          return (
            <div
              key={exam.id}
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
                  <span className="badge-azure">{dept?.code}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#627D98', fontWeight: 600 }}>
                    <Clock size={13} color="#0066F5" />
                    <span>{exam.durationMinutes} Minutes</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#071529', margin: '14px 0 6px 0', lineHeight: 1.35 }}>
                  {exam.title}
                </h3>

                <p style={{ fontSize: '12.5px', color: '#627D98', lineHeight: 1.55 }}>
                  {exam.instructions}
                </p>

                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '11.5px', color: '#071529', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={13} color="#00A3C4" />
                    {exam.questionIds.length} MCQs
                  </span>
                  <span>•</span>
                  <span>{exam.totalMarks} Total Marks</span>
                </div>
              </div>

              <button
                onClick={() => handleStartExam(exam)}
                className="btn-azure"
                style={{
                  marginTop: '22px',
                  width: '100%',
                  padding: '11px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>Launch Mock Exam</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
