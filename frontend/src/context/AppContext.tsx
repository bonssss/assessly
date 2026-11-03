'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Department,
  Question,
  LearningResource,
  Exam,
  ExamAttempt,
  PackagePlan,
  PaymentSubmission,
  PaymentSetting,
  AuditLog,
  UserProfile,
  Entitlement,
  UserRole,
} from '@/types';
import {
  initialDepartments,
  initialQuestions,
  initialResources,
  initialExams,
  initialPackages,
  initialPaymentSettings,
  initialPaymentSubmissions,
  initialAuditLogs,
  sampleStudentUser,
  sampleAdminUser,
} from '@/lib/mockData';

interface AppContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Data lists
  departments: Department[];
  questions: Question[];
  resources: LearningResource[];
  exams: Exam[];
  packages: PackagePlan[];
  paymentSettings: PaymentSetting[];
  paymentSubmissions: PaymentSubmission[];
  entitlements: Entitlement[];
  auditLogs: AuditLog[];
  examAttempts: ExamAttempt[];

  // Quota & access logic
  trialRemaining: number;
  hasActiveEntitlement: (departmentId?: string) => boolean;
  canAttemptQuestion: (departmentId?: string) => boolean;
  consumeTrialAttempt: () => boolean;

  // Paywall & modal triggers
  isPaywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  selectedPackageForCheckout: PackagePlan | null;
  setSelectedPackageForCheckout: (pkg: PackagePlan | null) => void;
  
  // Receipt Preview
  previewReceipt: PaymentSubmission | null;
  setPreviewReceipt: (sub: PaymentSubmission | null) => void;

  // Actions
  submitPayment: (payload: {
    packageId: string;
    channel: PaymentSubmission['channel'];
    transactionRef: string;
    amount: number;
    receiptFileName: string;
    receiptUrl?: string;
    departmentId?: string;
  }) => void;

  approvePayment: (paymentId: string, decisionNote?: string) => void;
  rejectPayment: (paymentId: string, decisionNote: string) => void;

  createQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'version'>) => void;
  updateQuestionStatus: (id: string, status: Question['status']) => void;

  createDepartment: (dept: Omit<Department, 'id' | 'questionCount' | 'resourceCount'>) => void;
  toggleDepartmentEnrollment: (deptId: string) => void;

  recordExamAttempt: (attempt: ExamAttempt) => void;

  // Search & Toast
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Authentication, Landing Page & Responsive Menu
  isAuthenticated: boolean;
  isAuthView: boolean;
  setIsAuthView: (val: boolean) => void;
  authInitialTab: 'login' | 'register';
  openAuth: (mode?: 'login' | 'register') => void;
  closeAuth: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  login: (email: string, role?: UserRole) => boolean;
  registerStudent: (data: {
    fullName: string;
    email: string;
    departmentId: string;
  }) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Load state or fallback
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile>(sampleStudentUser);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [resources, setResources] = useState<LearningResource[]>(initialResources);
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [packages, setPackages] = useState<PackagePlan[]>(initialPackages);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>(initialPaymentSettings);
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>(initialPaymentSubmissions);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);

  // Modals & UI state
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [selectedPackageForCheckout, setSelectedPackageForCheckout] = useState<PackagePlan | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<PaymentSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication, Landing Page & Mobile Drawer
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthView, setIsAuthView] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialTab(mode);
    setIsAuthView(true);
  };

  const closeAuth = () => {
    setIsAuthView(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const login = (email: string, role?: UserRole): boolean => {
    const selectedRole: UserRole =
      role || (email.toLowerCase().includes('admin') || email.toLowerCase().includes('almaz') ? 'admin' : 'student');

    if (selectedRole === 'admin') {
      setCurrentRole('admin');
      setCurrentUser(sampleAdminUser);
      setActiveTab('admin-dashboard');
      setIsAuthenticated(true);
      setIsAuthView(false);
      showToast('Signed in as Dr. Almaz Tesfaye (Administrator)');
      return true;
    } else {
      setCurrentRole('student');
      setCurrentUser(sampleStudentUser);
      setActiveTab('dashboard');
      setIsAuthenticated(true);
      setIsAuthView(false);
      showToast(`Signed in as ${sampleStudentUser.fullName}`);
      return true;
    }
  };

  const registerStudent = (data: {
    fullName: string;
    email: string;
    departmentId: string;
  }) => {
    const newStudent: UserProfile = {
      id: `user-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      role: 'student',
      status: 'active',
      enrolledDepartmentIds: [data.departmentId],
      trialUsedCount: 0,
      trialQuotaLimit: 5,
      createdAt: new Date().toISOString(),
    };

    setCurrentRole('student');
    setCurrentUser(newStudent);
    setIsAuthenticated(true);
    setIsAuthView(false);
    setActiveTab('dashboard');

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId: newStudent.id,
      actorName: newStudent.fullName,
      actorRole: 'student',
      action: 'Student Registered',
      entityType: 'User',
      entityId: newStudent.id,
      timestamp: new Date().toISOString(),
      details: `Candidate registered for ${data.departmentId}. 5 free trial attempts credited.`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(`Welcome to Alpha Assess, ${data.fullName}! 5 free trial questions ready.`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAuthView(false);
    showToast('Signed out successfully.');
  };

  // Switch role handler
  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'admin') {
      setCurrentUser(sampleAdminUser);
      setActiveTab('admin-dashboard');
      showToast('Switched to Administrator View (Almaz Tesfaye)');
    } else {
      setCurrentUser(sampleStudentUser);
      setActiveTab('dashboard');
      showToast('Switched to Student View (Abebe Kebede)');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Quota calculation
  const trialRemaining = Math.max(0, currentUser.trialQuotaLimit - currentUser.trialUsedCount);

  // Check if user has active entitlement for this department or all
  const hasActiveEntitlement = (deptId?: string): boolean => {
    return entitlements.some(
      (e) =>
        e.userId === currentUser.id &&
        e.status === 'active' &&
        (e.departmentId === 'all' || !deptId || e.departmentId === deptId)
    );
  };

  const canAttemptQuestion = (deptId?: string): boolean => {
    if (currentRole === 'admin') return true;
    if (hasActiveEntitlement(deptId)) return true;
    return trialRemaining > 0;
  };

  const consumeTrialAttempt = (): boolean => {
    if (currentRole === 'admin') return true;
    if (hasActiveEntitlement()) return true;

    if (trialRemaining <= 0) {
      setIsPaywallOpen(true);
      return false;
    }

    setCurrentUser((prev) => ({
      ...prev,
      trialUsedCount: prev.trialUsedCount + 1,
    }));
    return true;
  };

  const openPaywall = () => setIsPaywallOpen(true);
  const closePaywall = () => {
    setIsPaywallOpen(false);
    setSelectedPackageForCheckout(null);
  };

  // Student Submits Payment (FR-PAY-04)
  const submitPayment = ({
    packageId,
    channel,
    transactionRef,
    amount,
    receiptFileName,
    receiptUrl,
    departmentId,
  }: {
    packageId: string;
    channel: PaymentSubmission['channel'];
    transactionRef: string;
    amount: number;
    receiptFileName: string;
    receiptUrl?: string;
    departmentId?: string;
  }) => {
    const selectedPkg = packages.find((p) => p.id === packageId) || packages[1];
    
    // Check duplicate reference (BR-11, FR-PAY-11, fraud check)
    const isDuplicate = paymentSubmissions.some(
      (p) => p.transactionRef.trim().toLowerCase() === transactionRef.trim().toLowerCase()
    );

    const newPayment: PaymentSubmission = {
      id: `pay-${Date.now()}`,
      userId: currentUser.id,
      studentName: currentUser.fullName,
      studentEmail: currentUser.email,
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      departmentId,
      amount,
      currency: 'ETB',
      channel,
      transactionRef: transactionRef.trim(),
      receiptUrl:
        receiptUrl ||
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      receiptFileName,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      isSuspectedDuplicate: isDuplicate,
    };

    setPaymentSubmissions((prev) => [newPayment, ...prev]);
    closePaywall();
    showToast(`Payment receipt submitted (${channel}: ${transactionRef}). Admin review pending.`);
  };

  // Admin Approves Payment (FR-PAY-08, FR-PAY-09)
  const approvePayment = (paymentId: string, decisionNote?: string) => {
    const payment = paymentSubmissions.find((p) => p.id === paymentId);
    if (!payment) return;

    const note = decisionNote || 'Verified transaction. Access granted.';
    const now = new Date().toISOString();

    // 1. Update Payment status
    setPaymentSubmissions((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'Approved',
              decisionNote: note,
              reviewedBy: currentUser.fullName,
              reviewedAt: now,
            }
          : p
      )
    );

    // 2. Create Entitlement atomically (BR-10, FR-PAY-09)
    const pkg = packages.find((p) => p.id === payment.packageId);
    const durationDays = pkg?.durationDays || 180;
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + durationDays);

    const newEntitlement: Entitlement = {
      id: `ent-${Date.now()}`,
      userId: payment.userId,
      departmentId: pkg?.scope === 'all_departments' ? 'all' : payment.departmentId || 'dept-cs',
      packageId: payment.packageId,
      packageName: payment.packageName,
      startsAt: now,
      expiresAt: expiresDate.toISOString(),
      remainingCredits: 'unlimited',
      status: 'active',
      sourcePaymentId: payment.id,
    };

    setEntitlements((prev) => [newEntitlement, ...prev]);

    // 3. Log Audit Event (FR-AUD-01, FR-AUD-02)
    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: 'admin',
      action: 'Payment Approved',
      entityType: 'Payment',
      entityId: payment.id,
      details: `Approved ${payment.channel} (${payment.transactionRef}) for ${payment.studentName}. Created Entitlement (${payment.packageName}) valid for ${durationDays} days.`,
      timestamp: now,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showToast(`Approved payment for ${payment.studentName}! Entitlement active.`);
  };

  // Admin Rejects Payment (FR-PAY-10)
  const rejectPayment = (paymentId: string, decisionNote: string) => {
    const payment = paymentSubmissions.find((p) => p.id === paymentId);
    if (!payment) return;

    const now = new Date().toISOString();

    setPaymentSubmissions((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'Rejected',
              decisionNote,
              reviewedBy: currentUser.fullName,
              reviewedAt: now,
            }
          : p
      )
    );

    // Audit record
    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: 'admin',
      action: 'Payment Rejected',
      entityType: 'Payment',
      entityId: payment.id,
      details: `Rejected ${payment.channel} payment ${payment.transactionRef} for ${payment.studentName}. Reason: "${decisionNote}".`,
      timestamp: now,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showToast(`Payment rejected with reason: ${decisionNote}`);
  };

  // Question CRUD (FR-Q-01..06)
  const createQuestion = (newQ: Omit<Question, 'id' | 'createdAt' | 'version'>) => {
    const id = `q-custom-${Date.now()}`;
    const question: Question = {
      ...newQ,
      id,
      createdAt: new Date().toISOString(),
      version: 1,
    };
    setQuestions((prev) => [question, ...prev]);

    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: 'admin',
      action: 'Question Created',
      entityType: 'Question',
      entityId: id,
      details: `Created ${question.difficulty} question in topic "${question.topic}". Status: ${question.status}.`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showToast('Question successfully added to question bank!');
  };

  const updateQuestionStatus = (id: string, status: Question['status']) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
    const q = questions.find((item) => item.id === id);
    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: 'admin',
      action: `Question ${status}`,
      entityType: 'Question',
      entityId: id,
      details: `Changed status of question "${q?.topic || id}" to ${status}.`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
    showToast(`Question marked as ${status}`);
  };

  // Department Management
  const createDepartment = (dept: Omit<Department, 'id' | 'questionCount' | 'resourceCount'>) => {
    const id = `dept-${Date.now()}`;
    const newDept: Department = {
      ...dept,
      id,
      questionCount: 0,
      resourceCount: 0,
    };
    setDepartments((prev) => [...prev, newDept]);

    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: 'admin',
      action: 'Department Created',
      entityType: 'Department',
      entityId: id,
      details: `Added new department "${newDept.name}" (${newDept.code}).`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
    showToast(`Department "${newDept.name}" created!`);
  };

  const toggleDepartmentEnrollment = (deptId: string) => {
    setCurrentUser((prev) => {
      const isEnrolled = prev.enrolledDepartmentIds.includes(deptId);
      const updated = isEnrolled
        ? prev.enrolledDepartmentIds.filter((id) => id !== deptId)
        : [...prev.enrolledDepartmentIds, deptId];
      return { ...prev, enrolledDepartmentIds: updated };
    });
    showToast('Updated department enrollment preferences.');
  };

  const recordExamAttempt = (attempt: ExamAttempt) => {
    setExamAttempts((prev) => [attempt, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        activeTab,
        setActiveTab,
        departments,
        questions,
        resources,
        exams,
        packages,
        paymentSettings,
        paymentSubmissions,
        entitlements,
        auditLogs,
        examAttempts,
        trialRemaining,
        hasActiveEntitlement,
        canAttemptQuestion,
        consumeTrialAttempt,
        isPaywallOpen,
        openPaywall,
        closePaywall,
        selectedPackageForCheckout,
        setSelectedPackageForCheckout,
        previewReceipt,
        setPreviewReceipt,
        submitPayment,
        approvePayment,
        rejectPayment,
        createQuestion,
        updateQuestionStatus,
        createDepartment,
        toggleDepartmentEnrollment,
        recordExamAttempt,
        searchQuery,
        setSearchQuery,
        toastMessage,
        showToast,
        isAuthenticated,
        isAuthView,
        setIsAuthView,
        authInitialTab,
        openAuth,
        closeAuth,
        isMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        login,
        registerStudent,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
