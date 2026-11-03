'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import LandingPage from '@/components/landing/LandingPage';
import AuthView from '@/components/auth/AuthView';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import PracticeMode from '@/components/practice/PracticeMode';
import MockExamEngine from '@/components/exam/MockExamEngine';
import StudentPaymentsView from '@/components/payment/StudentPaymentsView';
import DepartmentEnrollmentView from '@/components/departments/DepartmentEnrollmentView';
import StudyResourcesView from '@/components/resources/StudyResourcesView';
import PaymentReviewQueue from '@/components/admin/PaymentReviewQueue';
import QuestionBankManager from '@/components/admin/QuestionBankManager';
import DepartmentResourceManager from '@/components/admin/DepartmentResourceManager';
import AuditLogView from '@/components/admin/AuditLogView';
import SettingsView from '@/components/admin/SettingsView';
import PaywallModal from '@/components/common/PaywallModal';
import ReceiptModal from '@/components/common/ReceiptModal';
import { CheckCircle2 } from 'lucide-react';

function MainApp() {
  const {
    activeTab,
    toastMessage,
    isAuthenticated,
    isAuthView,
  } = useApp();

  // 1. If not authenticated and NOT on auth view -> Show Landing Page
  if (!isAuthenticated && !isAuthView) {
    return (
      <>
        <LandingPage />
        {toastMessage && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              backgroundColor: '#111827',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              fontSize: '12.5px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 200,
              border: '1px solid #1F2937',
            }}
          >
            <CheckCircle2 size={14} color="#10B981" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // 2. If on auth view (either explicit login/register click or unauthenticated login prompt)
  if (!isAuthenticated && isAuthView) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
        <AuthView />
        {toastMessage && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              backgroundColor: '#111827',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              fontSize: '12.5px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 200,
              border: '1px solid #1F2937',
            }}
          >
            <CheckCircle2 size={14} color="#10B981" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // 3. User is authenticated -> Render single locked-in role workspace
  const renderActiveView = () => {
    switch (activeTab) {
      // Student Views
      case 'dashboard':
        return <StudentDashboard />;
      case 'practice':
        return <PracticeMode />;
      case 'exams':
        return <MockExamEngine />;
      case 'resources':
        return <StudyResourcesView />;
      case 'payments':
        return <StudentPaymentsView />;
      case 'departments':
        return <DepartmentEnrollmentView />;

      // Administrator Views
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'payment-review':
        return <PaymentReviewQueue />;
      case 'question-bank':
        return <QuestionBankManager />;
      case 'departments-resources':
        return <DepartmentResourceManager />;
      case 'audit-logs':
        return <AuditLogView />;
      case 'settings':
        return <SettingsView />;

      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Desktop & Mobile Responsive Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        <Header />

        <main className="main-content-container">
          <div className="animate-fade-in">{renderActiveView()}</div>
        </main>
      </div>

      {/* Modals */}
      <PaywallModal />
      <ReceiptModal />

      {/* Minimalist Toast Notification */}
      {toastMessage && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#111827',
            color: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            fontSize: '12.5px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 200,
            border: '1px solid #1F2937',
          }}
        >
          <CheckCircle2 size={14} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
