'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Bookmark,
  Strikethrough,
  Layers,
  Award,
  Zap,
  Target,
  RotateCcw,
  Compass
} from 'lucide-react';

export default function PracticeMode() {
  const {
    departments,
    questions,
    currentUser,
    trialRemaining,
    canAttemptQuestion,
    consumeTrialAttempt,
    openPaywall,
    showToast,
    hasActiveEntitlement,
  } = useApp();

  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    currentUser.enrolledDepartmentIds[0] || departments[0]?.id || 'dept-cs'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [attemptedQuestionIds, setAttemptedQuestionIds] = useState<Record<string, { selected: string; isCorrect: boolean }>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const filteredQuestions = questions.filter((q) => {
    if (q.departmentId !== selectedDeptId) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (q.status !== 'Published') return false;
    return true;
  });

  const currentQ = filteredQuestions[currentIndex];
  const dept = departments.find((d) => d.id === selectedDeptId);
  const isPro = hasActiveEntitlement(selectedDeptId);

  // Calculate session accuracy
  const totalAttemptedInSession = Object.keys(attemptedQuestionIds).length;
  const correctCount = Object.values(attemptedQuestionIds).filter((a) => a.isCorrect).length;
  const sessionAccuracy = totalAttemptedInSession > 0 ? Math.round((correctCount / totalAttemptedInSession) * 100) : 0;

  const handleOptionSelect = (optId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optId);
  };

  const toggleEliminate = (e: React.MouseEvent, optId: string) => {
    e.stopPropagation();
    if (isAnswerSubmitted) return;
    setEliminatedOptions((prev) => {
      const updated = new Set(prev);
      if (updated.has(optId)) {
        updated.delete(optId);
      } else {
        updated.add(optId);
      }
      return updated;
    });
  };

  const toggleBookmark = () => {
    if (!currentQ) return;
    setBookmarkedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(currentQ.id)) {
        updated.delete(currentQ.id);
        showToast('Removed from bookmarked review list');
      } else {
        updated.add(currentQ.id);
        showToast('Question bookmarked for priority revision');
      }
      return updated;
    });
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !currentQ) return;

    if (!canAttemptQuestion(selectedDeptId)) {
      openPaywall();
      showToast('Free trial quota exhausted (5/5). Upgrade for full access.');
      return;
    }

    const allowed = consumeTrialAttempt();
    if (!allowed) return;

    const isCorrect = selectedOptionId === currentQ.correctOptionId;
    setIsAnswerSubmitted(true);
    setAttemptedQuestionIds((prev) => ({
      ...prev,
      [currentQ.id]: { selected: selectedOptionId, isCorrect },
    }));

    if (isCorrect) {
      showToast('✓ Correct answer! Blueprint rationale revealed.');
    } else {
      showToast('Incorrect. Study the syllabus explanation below.');
    }
  };

  const jumpToQuestion = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= filteredQuestions.length) return;
    setCurrentIndex(targetIndex);
    const targetQ = filteredQuestions[targetIndex];
    const prevAttempt = attemptedQuestionIds[targetQ?.id];
    if (prevAttempt) {
      setSelectedOptionId(prevAttempt.selected);
      setIsAnswerSubmitted(true);
    } else {
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    }
    setEliminatedOptions(new Set());
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      jumpToQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      jumpToQuestion(currentIndex - 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. High-Tech Cockpit HUD Header */}
      <div
        className="cockpit-frame"
        style={{
          padding: '18px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Department Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#071529', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Stream:
            </span>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setCurrentIndex(0);
                setIsAnswerSubmitted(false);
                setSelectedOptionId(null);
                setEliminatedOptions(new Set());
              }}
              style={{
                backgroundColor: '#EDF3FB',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#071529',
                cursor: 'pointer',
              }}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#627D98', fontWeight: 600 }}>Tier:</span>
            {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => {
              const isSelected = selectedDifficulty === diff;
              const labels: Record<string, string> = {
                all: 'All',
                Easy: 'Foundation',
                Medium: 'Exit Standard',
                Hard: 'Advanced',
              };

              return (
                <button
                  key={diff}
                  onClick={() => {
                    setSelectedDifficulty(diff);
                    setCurrentIndex(0);
                    setIsAnswerSubmitted(false);
                    setSelectedOptionId(null);
                  }}
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #0066F5' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#EBF4FF' : '#FFFFFF',
                    color: isSelected ? '#0066F5' : '#627D98',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {labels[diff]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Status Badge */}
        <div>
          {isPro ? (
            <span className="badge-azure" style={{ padding: '6px 12px', fontSize: '11.5px' }}>
              <span className="live-pulse-azure" />
              <span>Unlimited Practice Active</span>
            </span>
          ) : (
            <span
              style={{
                backgroundColor: trialRemaining > 0 ? '#EBF4FF' : '#FEF2F2',
                color: trialRemaining > 0 ? '#0066F5' : '#DC2626',
                border: `1px solid ${trialRemaining > 0 ? '#B9D9FE' : '#FECACA'}`,
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={13} />
              <span>{trialRemaining} / 5 Free Trial Questions</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Main Cockpit Split Grid: Left Exam Card + Right Question Matrix Palette */}
      {!currentQ ? (
        <div className="cockpit-frame" style={{ padding: '60px 24px', textAlign: 'center', color: '#627D98' }}>
          <BookOpen size={48} color="#0066F5" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#071529' }}>
            No questions available for this filter
          </h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            Try selecting a different difficulty level or academic stream.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 310px',
            gap: '20px',
            alignItems: 'start',
          }}
          className="responsive-dashboard-grid"
        >
          {/* Left Column: Interactive Question Console */}
          <div className="cockpit-frame" style={{ padding: '28px 32px' }}>
            {/* Top Question Toolbar */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                  Question {currentIndex + 1} of {filteredQuestions.length}
                </span>

                <span className="badge-navy">{currentQ.topic}</span>

                <span
                  style={{
                    fontSize: '11px',
                    color: '#627D98',
                    backgroundColor: '#F8FAFD',
                    border: '1px solid #E2E8F0',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  {currentQ.difficulty} • {currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
                </span>
              </div>

              {/* Bookmark Button */}
              <button
                onClick={toggleBookmark}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: bookmarkedIds.has(currentQ.id) ? '#6B21A8' : '#627D98',
                  backgroundColor: bookmarkedIds.has(currentQ.id) ? '#F3E8FF' : '#F8FAFD',
                  border: `1px solid ${bookmarkedIds.has(currentQ.id) ? '#E9D5FF' : '#E2E8F0'}`,
                  padding: '5px 10px',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Bookmark size={13} fill={bookmarkedIds.has(currentQ.id) ? '#6B21A8' : 'none'} />
                <span>{bookmarkedIds.has(currentQ.id) ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            {/* Question Body */}
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#071529',
                lineHeight: 1.6,
                marginBottom: '22px',
              }}
            >
              {currentQ.body}
            </h2>

            {/* Single-Choice Options with Keyboard Shortcuts & Strike Tool */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQ.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedOptionId === option.id;
                const isEliminated = eliminatedOptions.has(option.id);
                const isCorrectAnswer = isAnswerSubmitted && option.id === currentQ.correctOptionId;
                const isWrongSelection = isAnswerSubmitted && isSelected && !isCorrectAnswer;

                let cardClass = 'exam-option-card';
                if (isCorrectAnswer) {
                  cardClass += ' correct';
                } else if (isWrongSelection) {
                  cardClass += ' incorrect';
                } else if (isSelected) {
                  cardClass += ' selected';
                } else if (isEliminated) {
                  cardClass += ' eliminated';
                }

                return (
                  <div
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={cardClass}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: isCorrectAnswer
                            ? '#059669'
                            : isWrongSelection
                            ? '#DC2626'
                            : isSelected
                            ? '#0066F5'
                            : '#EDF3FB',
                          color: isCorrectAnswer || isWrongSelection || isSelected ? '#FFFFFF' : '#071529',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {letter}
                      </div>

                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: isSelected ? 700 : 500,
                          color: '#071529',
                          lineHeight: 1.45,
                        }}
                      >
                        {option.text}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!isAnswerSubmitted && (
                        <button
                          type="button"
                          onClick={(e) => toggleEliminate(e, option.id)}
                          title={isEliminated ? 'Restore option' : 'Eliminate option'}
                          style={{
                            padding: '4px',
                            borderRadius: '4px',
                            color: isEliminated ? '#DC2626' : '#9FB3C8',
                            backgroundColor: isEliminated ? '#FEF2F2' : 'transparent',
                          }}
                        >
                          <Strikethrough size={14} />
                        </button>
                      )}

                      {isCorrectAnswer && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={16} />
                          <span>Correct</span>
                        </span>
                      )}

                      {isWrongSelection && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={16} />
                          <span>Selected</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: currentIndex === 0 ? '#9FB3C8' : '#334E68',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === filteredQuestions.length - 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: currentIndex === filteredQuestions.length - 1 ? '#9FB3C8' : '#334E68',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: currentIndex === filteredQuestions.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div>
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOptionId}
                    className={selectedOptionId ? 'btn-azure' : ''}
                    style={{
                      backgroundColor: selectedOptionId ? undefined : '#EDF2F9',
                      color: selectedOptionId ? '#FFFFFF' : '#9FB3C8',
                      fontWeight: 700,
                      fontSize: '13px',
                      padding: '10px 22px',
                      borderRadius: '8px',
                      cursor: selectedOptionId ? 'pointer' : 'not-allowed',
                      border: 'none',
                    }}
                  >
                    Confirm & Submit
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="btn-navy"
                    style={{
                      fontSize: '13px',
                      padding: '10px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Next Question</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Detailed Academic Rationale Drawer */}
            {isAnswerSubmitted && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: '22px',
                  padding: '18px 22px',
                  borderRadius: '12px',
                  backgroundColor: selectedOptionId === currentQ.correctOptionId ? '#ECFDF5' : '#FFF7ED',
                  border: `1px solid ${selectedOptionId === currentQ.correctOptionId ? '#A7F3D0' : '#FED7AA'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <HelpCircle size={16} color={selectedOptionId === currentQ.correctOptionId ? '#059669' : '#EA580C'} />
                  <strong style={{ fontSize: '13px', color: selectedOptionId === currentQ.correctOptionId ? '#065F46' : '#9A3412' }}>
                    {selectedOptionId === currentQ.correctOptionId ? '✓ Correct Answer Verified' : 'Ministry Syllabus Reference & Analysis'}
                  </strong>
                </div>

                <p style={{ fontSize: '13px', color: selectedOptionId === currentQ.correctOptionId ? '#047857' : '#9A3412', lineHeight: 1.6 }}>
                  {currentQ.explanation}
                </p>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '11px', color: '#627D98' }}>
                  <span>Unit: <strong>{currentQ.topic}</strong></span>
                  <span>•</span>
                  <span>Competency Level: <strong>{currentQ.difficulty}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Examination Palette Matrix */}
          <div className="cockpit-frame" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#071529' }}>
                Question Palette
              </h3>
              <span className="badge-azure">
                {currentIndex + 1} / {filteredQuestions.length}
              </span>
            </div>

            {/* Session Accuracy Gauge */}
            <div
              style={{
                backgroundColor: '#F8FAFD',
                borderRadius: '10px',
                padding: '12px 14px',
                border: '1px solid #E2E8F0',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#627D98' }}>
                <span>SESSION ACCURACY</span>
                <span style={{ color: sessionAccuracy >= 70 ? '#059669' : '#0066F5' }}>
                  {sessionAccuracy}%
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#EDF3FB', borderRadius: '9999px', overflow: 'hidden', marginTop: '6px' }}>
                <div
                  style={{
                    width: `${sessionAccuracy}%`,
                    height: '100%',
                    backgroundColor: sessionAccuracy >= 70 ? '#059669' : '#0066F5',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10.5px', color: '#9FB3C8' }}>
                <span>Attempted: {totalAttemptedInSession}</span>
                <span>Benchmark: 70%</span>
              </div>
            </div>

            {/* Palette Button Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                maxHeight: '340px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {filteredQuestions.map((q, idx) => {
                const isActive = idx === currentIndex;
                const attempt = attemptedQuestionIds[q.id];
                const isBookmarked = bookmarkedIds.has(q.id);

                let btnClass = 'palette-btn';
                if (isActive) {
                  btnClass += ' palette-btn-active';
                } else if (attempt?.isCorrect) {
                  btnClass += ' palette-btn-answered';
                } else if (attempt && !attempt.isCorrect) {
                  btnClass += ' palette-btn-flagged';
                } else {
                  btnClass += ' palette-btn-unanswered';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={btnClass}
                    title={`Question ${idx + 1}: ${q.topic}`}
                    style={{ position: 'relative' }}
                  >
                    <span>{idx + 1}</span>
                    {isBookmarked && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: '#6B21A8',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #E2E8F0', fontSize: '11px', color: '#627D98' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#0066F5' }} />
                <span>Current Question</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }} />
                <span>Answered (Correct)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }} />
                <span>Needs Review</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
