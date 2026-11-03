'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Archive,
  BookOpen,
  FileSpreadsheet,
  Check,
  Edit,
  Trash2,
  Eye,
  Sparkles,
  X
} from 'lucide-react';
import { Question } from '@/types';

export default function QuestionBankManager() {
  const {
    questions,
    departments,
    createQuestion,
    updateQuestionStatus,
    showToast,
  } = useApp();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newDeptId, setNewDeptId] = useState<string>(departments[0]?.id || 'dept-cs');
  const [newTopic, setNewTopic] = useState<string>('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newMarks, setNewMarks] = useState<number>(1);
  const [newBody, setNewBody] = useState<string>('');
  const [options, setOptions] = useState<string[]>([
    'Option A content',
    'Option B content',
    'Option C content',
    'Option D content',
  ]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState<string>('');
  const [saveAsDraft, setSaveAsDraft] = useState<boolean>(false);

  const filtered = questions.filter((q) => {
    if (selectedDeptId !== 'all' && q.departmentId !== selectedDeptId) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedStatus !== 'all' && q.status !== selectedStatus) return false;
    if (
      searchKeyword &&
      !q.body.toLowerCase().includes(searchKeyword.toLowerCase()) &&
      !q.topic.toLowerCase().includes(searchKeyword.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBody.trim() || !newTopic.trim()) {
      showToast('Please enter both question topic and body.');
      return;
    }

    if (options.some((opt) => !opt.trim())) {
      showToast('All 4 answer options must be filled.');
      return;
    }

    const questionOptions = options.map((opt, idx) => ({
      id: `opt-${idx + 1}`,
      text: opt.trim(),
    }));

    createQuestion({
      departmentId: newDeptId,
      topic: newTopic.trim(),
      difficulty: newDifficulty,
      marks: newMarks,
      body: newBody.trim(),
      options: questionOptions,
      correctOptionId: questionOptions[correctIndex].id,
      explanation: newExplanation.trim() || 'Reference concept explained.',
      status: saveAsDraft ? 'Draft' : 'Published',
    });

    setIsModalOpen(false);
    setNewBody('');
    setNewTopic('');
    setNewExplanation('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Search / Filters */}
      <div
        className="clean-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Curated Question Bank ({questions.length} Items)
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Curate, edit, validate, and publish multiple-choice exit examination questions.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: '#111827',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} />
            <span>Add Question</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '6px',
              padding: '6px 12px',
              minWidth: '220px',
              flex: 1,
            }}
          >
            <Search size={14} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search questions or topics..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '12.5px',
                width: '100%',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Streams</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div className="clean-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={36} color="#9CA3AF" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>No Questions Found</div>
            <div style={{ fontSize: '12px', marginTop: '2px' }}>Try adjusting your filters or search keywords.</div>
          </div>
        ) : (
          filtered.map((q) => {
            const dept = departments.find((d) => d.id === q.departmentId);

            return (
              <div
                key={q.id}
                className="clean-card clean-card-hover"
                style={{
                  padding: '18px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Meta Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      {dept?.code || 'STREAM'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {q.topic}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: 'var(--text-muted)',
                      }}
                    >
                      • {q.difficulty} • {q.marks} Mark
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor:
                          q.status === 'Published'
                            ? 'var(--success-light)'
                            : q.status === 'Draft'
                            ? 'var(--warning-light)'
                            : 'var(--bg-subtle)',
                        color:
                          q.status === 'Published'
                            ? 'var(--success-text)'
                            : q.status === 'Draft'
                            ? 'var(--warning-text)'
                            : 'var(--text-muted)',
                        border: `1px solid ${
                          q.status === 'Published'
                            ? 'var(--success-border)'
                            : q.status === 'Draft'
                            ? 'var(--warning-border)'
                            : 'var(--border-hairline)'
                        }`,
                      }}
                    >
                      {q.status}
                    </span>

                    {q.status !== 'Published' ? (
                      <button
                        onClick={() => updateQuestionStatus(q.id, 'Published')}
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#111827',
                          color: '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: '4px',
                        }}
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => updateQuestionStatus(q.id, 'Archived')}
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--border-hairline)',
                          color: 'var(--text-muted)',
                          padding: '3px 10px',
                          borderRadius: '4px',
                        }}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {q.body}
                </p>

                {/* Options List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {q.options.map((opt, idx) => {
                    const isCorrect = opt.id === q.correctOptionId;
                    return (
                      <div
                        key={opt.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: isCorrect ? 'var(--success-light)' : 'var(--bg-page)',
                          border: `1px solid ${isCorrect ? 'var(--success-border)' : 'var(--border-hairline)'}`,
                          fontSize: '12px',
                          color: isCorrect ? 'var(--success-text)' : 'var(--text-secondary)',
                          fontWeight: isCorrect ? 600 : 400,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + idx)}.</span>
                        <span>{opt.text}</span>
                        {isCorrect && <CheckCircle2 size={13} color="var(--success)" style={{ marginLeft: 'auto' }} />}
                      </div>
                    );
                  })}
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-hairline)', paddingTop: '8px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Rationale:</strong> {q.explanation}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
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
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Create Licensure Examination Question
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Designate one strictly validated correct answer according to SRS FR-Q-06.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '6px', borderRadius: '4px', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department Stream</label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    style={{ width: '100%', marginTop: '4px', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', backgroundColor: 'var(--bg-page)' }}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Asymptotic Analysis"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    required
                    style={{ width: '100%', marginTop: '4px', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', backgroundColor: 'var(--bg-page)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    style={{ width: '100%', marginTop: '4px', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', backgroundColor: 'var(--bg-page)' }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newMarks}
                    onChange={(e) => setNewMarks(Number(e.target.value))}
                    style={{ width: '100%', marginTop: '4px', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', backgroundColor: 'var(--bg-page)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Question Prompt</label>
                <textarea
                  rows={3}
                  placeholder="Enter the full question prompt..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  required
                  style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', backgroundColor: 'var(--bg-page)' }}
                />
              </div>

              {/* 4 Options */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Options (Radio marks single correct answer):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {options.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctIndex === idx}
                        onChange={() => setCorrectIndex(idx)}
                        style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 600, width: '16px', color: 'var(--text-secondary)' }}>
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx] = e.target.value;
                          setOptions(updated);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${correctIndex === idx ? 'var(--primary)' : 'var(--border-hairline)'}`,
                          backgroundColor: correctIndex === idx ? 'var(--primary-light)' : 'var(--bg-page)',
                          fontSize: '12.5px',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Academic Explanation
                </label>
                <textarea
                  rows={2}
                  placeholder="Rationale why the designated option is correct..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12.5px', backgroundColor: 'var(--bg-page)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '7px 14px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-hairline)', color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 500 }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  onClick={() => setSaveAsDraft(true)}
                  style={{ padding: '7px 14px', borderRadius: '6px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)', fontSize: '12.5px', fontWeight: 600 }}
                >
                  Save Draft
                </button>

                <button
                  type="submit"
                  onClick={() => setSaveAsDraft(false)}
                  style={{ padding: '7px 18px', borderRadius: '6px', backgroundColor: '#111827', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 600 }}
                >
                  Publish Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
