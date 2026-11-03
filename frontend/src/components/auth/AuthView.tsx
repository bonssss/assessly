'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  User,
  BookOpen,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '@/types';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export default function AuthView({ initialMode, onSuccess }: AuthViewProps) {
  const {
    login,
    registerStudent,
    departments,
    showToast,
    closeAuth,
    authInitialTab,
    isAuthenticated,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode || authInitialTab || 'login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartmentId, setRegDepartmentId] = useState(departments[0]?.id || 'dept-cs');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast('Please enter both email and password.');
      return;
    }
    const success = login(loginEmail.trim(), selectedRole);
    if (success && onSuccess) onSuccess();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      showToast('Please fill in all required registration fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match. Please verify.');
      return;
    }

    if (regPassword.length < 6) {
      showToast('Password should be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      showToast('Please accept the examination honor code.');
      return;
    }

    registerStudent({
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      departmentId: regDepartmentId,
    });

    if (onSuccess) onSuccess();
  };

  const quickLoginAs = (email: string, role: UserRole) => {
    setSelectedRole(role);
    setLoginEmail(email);
    setLoginPassword('DemoPassword123');
    login(email, role);
    if (onSuccess) onSuccess();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header with Back to Home button */}
      <header
        style={{
          height: '60px',
          borderBottom: '1px solid var(--border-hairline)',
          backgroundColor: '#FFFFFF',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={closeAuth}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-hairline)',
            padding: '6px 12px',
            borderRadius: '6px',
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              backgroundColor: '#0A2540',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              boxShadow: '0 2px 6px rgba(10, 37, 64, 0.2)',
            }}
          >
            A
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0A2540' }}>
            Apex Assess
          </span>
        </div>
      </header>

      {/* Main Split Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '880px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          {/* Left Column: Educational Context & Benefits */}
          <div
            style={{
              backgroundColor: 'var(--bg-page)',
              borderRight: '1px solid var(--border-hairline)',
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-hairline)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                }}
              >
                <Sparkles size={12} color="var(--primary)" />
                <span>Academic Year 2026</span>
              </div>

              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', lineHeight: 1.3 }}>
                Higher Education Exit & Licensure Exam System
              </h1>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.5 }}>
                Log in to your designated role (Candidate or Administrator) to access curriculum mock exams, question banks, and progress analytics.
              </p>

              {/* Benefits Checklist */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--success-light)', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={11} color="var(--success-text)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      5 Free Trial Questions on Sign Up
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Interactive test environment with instant explanation rationale.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--success-light)', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={11} color="var(--success-text)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Separate Candidate & Admin Workspaces
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Log in to your respective role. No switching after logging in.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-hairline)',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                1-Click Fast Demo Login
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => quickLoginAs('abebe.kebede@aau.edu.et', 'student')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-hairline)',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>Login as Student</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>(Abebe Kebede)</span>
                  </div>
                  <ArrowRight size={13} color="var(--text-muted)" />
                </button>

                <button
                  type="button"
                  onClick={() => quickLoginAs('almaz.tesfaye@mohe.gov.et', 'admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-hairline)',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>Login as Administrator</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>(Dr. Almaz)</span>
                  </div>
                  <ArrowRight size={13} color="var(--text-muted)" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Form Controls */}
          <div style={{ padding: '36px' }}>
            {/* Mode Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-hairline)',
                borderRadius: '8px',
                padding: '3px',
                marginBottom: '20px',
              }}
            >
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: mode === 'login' ? 600 : 500,
                  backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
                  color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: mode === 'login' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.12s ease',
                }}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => setMode('register')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: mode === 'register' ? 600 : 500,
                  backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
                  color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: mode === 'register' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.12s ease',
                }}
              >
                Create Student Account
              </button>
            </div>

            {/* SIGN IN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Sign In
                  </h2>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Select your designated role to enter your workspace.
                  </p>
                </div>

                {/* Role Selector: Student vs Admin */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Sign In Role:
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginTop: '4px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: `1.5px solid ${selectedRole === 'student' ? '#0066F5' : 'var(--border-hairline)'}`,
                        backgroundColor: selectedRole === 'student' ? '#EBF4FF' : '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: selectedRole === 'student' ? 700 : 500,
                        color: selectedRole === 'student' ? '#0066F5' : 'var(--text-primary)',
                        textAlign: 'center',
                      }}
                    >
                      🎓 Student Candidate
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: `1.5px solid ${selectedRole === 'admin' ? '#0A2540' : 'var(--border-hairline)'}`,
                        backgroundColor: selectedRole === 'admin' ? '#EDF2F9' : '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: selectedRole === 'admin' ? 700 : 500,
                        color: selectedRole === 'admin' ? '#0A2540' : 'var(--text-primary)',
                        textAlign: 'center',
                      }}
                    >
                      🛡️ Administrator
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Email Address
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      marginTop: '4px',
                    }}
                  >
                    <Mail size={15} color="var(--text-muted)" />
                    <input
                      type="email"
                      placeholder={selectedRole === 'student' ? 'e.g. abebe.kebede@aau.edu.et' : 'e.g. almaz.tesfaye@mohe.gov.et'}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast('Password reset link sent to your email.')}
                      style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: 500 }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      marginTop: '4px',
                    }}
                  >
                    <Lock size={15} color="var(--text-muted)" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px', color: 'var(--text-primary)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ color: 'var(--text-muted)', padding: '2px' }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="rememberMe" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Remember my session for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-azure"
                  style={{
                    fontSize: '13px',
                    padding: '10px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  <span>Sign In as {selectedRole === 'student' ? 'Student' : 'Administrator'}</span>
                  <ArrowRight size={14} />
                </button>

                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Need a candidate account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Register here
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER FORM (No university, no student id, dropdown for departments) */
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Student Registration
                  </h2>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Create your profile to start practicing exit exam questions.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Full Name
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      marginTop: '3px',
                    }}
                  >
                    <User size={14} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="e.g. Hanna Tadesse"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                      style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '12.5px', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Email Address
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      marginTop: '3px',
                    }}
                  >
                    <Mail size={14} color="var(--text-muted)" />
                    <input
                      type="email"
                      placeholder="e.g. hanna.tadesse@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '12.5px', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Academic Department Dropdown */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Academic Degree Stream (Department)
                  </label>
                  <div style={{ position: 'relative', marginTop: '3px' }}>
                    <select
                      value={regDepartmentId}
                      onChange={(e) => setRegDepartmentId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-hairline)',
                        backgroundColor: 'var(--bg-page)',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code}) - {dept.questionCount} Questions
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        marginTop: '3px',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-hairline)',
                        backgroundColor: 'var(--bg-page)',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        marginTop: '3px',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-hairline)',
                        backgroundColor: 'var(--bg-page)',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="agreeTerms" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    I agree to the National Exam Preparation honor code and terms of service.
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-azure"
                  style={{
                    fontSize: '13px',
                    padding: '10px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  <span>Create Account & Get 5 Free Questions</span>
                  <ArrowRight size={14} />
                </button>

                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
