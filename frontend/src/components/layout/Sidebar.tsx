'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  FileText,
  CreditCard,
  ShieldCheck,
  FolderKanban,
  FileSpreadsheet,
  History,
  Settings,
  Layers,
  Sparkles,
  ArrowRightLeft,
  ChevronRight,
  LogOut,
  LogIn,
  X,
  User
} from 'lucide-react';

export default function Sidebar() {
  const {
    currentRole,
    activeTab,
    setActiveTab,
    trialRemaining,
    currentUser,
    paymentSubmissions,
    openPaywall,
    hasActiveEntitlement,
    isMobileMenuOpen,
    closeMobileMenu,
    isAuthenticated,
    logout,
    openAuth,
  } = useApp();

  const pendingPaymentsCount = paymentSubmissions.filter((p) => p.status === 'Pending').length;
  const isPro = hasActiveEntitlement();

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    closeMobileMenu();
  };

  const sidebarContent = (
    <>
      {/* Workspace Brand Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '7px',
              backgroundColor: '#0A2540',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px',
              boxShadow: '0 2px 6px rgba(10, 37, 64, 0.25)',
            }}
          >
            A
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '14.5px',
                color: '#0A2540',
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
              }}
            >
              Apex Assess
            </div>
            <div style={{ fontSize: '11px', color: '#0066F5', fontWeight: 600 }}>
              Exit Exam System
            </div>
          </div>
        </div>

        {/* Mobile close icon */}
        <button
          onClick={closeMobileMenu}
          className="mobile-menu-trigger"
          aria-label="Close menu"
          style={{
            padding: '4px',
            borderRadius: '4px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Menu Items */}
      <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {currentRole === 'student' ? (
          <>
            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.4px',
                  marginBottom: '6px',
                  paddingLeft: '8px',
                  textTransform: 'uppercase',
                }}
              >
                Learning
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <NavItem
                  icon={<LayoutDashboard size={16} />}
                  label="Dashboard"
                  active={activeTab === 'dashboard'}
                  onClick={() => handleNavClick('dashboard')}
                />
                <NavItem
                  icon={<BookOpen size={16} />}
                  label="Practice Questions"
                  active={activeTab === 'practice'}
                  onClick={() => handleNavClick('practice')}
                />
                <NavItem
                  icon={<Clock size={16} />}
                  label="Timed Mock Exams"
                  active={activeTab === 'exams'}
                  onClick={() => handleNavClick('exams')}
                />
                <NavItem
                  icon={<Layers size={16} />}
                  label="My Departments"
                  active={activeTab === 'departments'}
                  onClick={() => handleNavClick('departments')}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.4px',
                  marginBottom: '6px',
                  paddingLeft: '8px',
                  textTransform: 'uppercase',
                }}
              >
                Resources & Billing
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <NavItem
                  icon={<FileText size={16} />}
                  label="Study Handouts"
                  active={activeTab === 'resources'}
                  onClick={() => handleNavClick('resources')}
                />
                <NavItem
                  icon={<CreditCard size={16} />}
                  label="Payments & Receipts"
                  active={activeTab === 'payments'}
                  onClick={() => handleNavClick('payments')}
                />
              </div>
            </div>
          </>
        ) : (
          /* Administrator Nav */
          <>
            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.4px',
                  marginBottom: '6px',
                  paddingLeft: '8px',
                  textTransform: 'uppercase',
                }}
              >
                Overview
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <NavItem
                  icon={<LayoutDashboard size={16} />}
                  label="Analytics"
                  active={activeTab === 'admin-dashboard'}
                  onClick={() => handleNavClick('admin-dashboard')}
                />
                <NavItem
                  icon={<ShieldCheck size={16} />}
                  label="Review Queue"
                  active={activeTab === 'payment-review'}
                  onClick={() => handleNavClick('payment-review')}
                  badge={pendingPaymentsCount > 0 ? String(pendingPaymentsCount) : undefined}
                  badgeType="warning"
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.4px',
                  marginBottom: '6px',
                  paddingLeft: '8px',
                  textTransform: 'uppercase',
                }}
              >
                Content & Records
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <NavItem
                  icon={<FileSpreadsheet size={16} />}
                  label="Question Bank"
                  active={activeTab === 'question-bank'}
                  onClick={() => handleNavClick('question-bank')}
                />
                <NavItem
                  icon={<FolderKanban size={16} />}
                  label="Departments & Files"
                  active={activeTab === 'departments-resources'}
                  onClick={() => handleNavClick('departments-resources')}
                />
                <NavItem
                  icon={<History size={16} />}
                  label="Audit Logs"
                  active={activeTab === 'audit-logs'}
                  onClick={() => handleNavClick('audit-logs')}
                />
                <NavItem
                  icon={<Settings size={16} />}
                  label="Payment Settings"
                  active={activeTab === 'settings'}
                  onClick={() => handleNavClick('settings')}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Trial / Profile & Auth Card */}
      <div style={{ padding: '14px', borderTop: '1px solid var(--border-hairline)' }}>
        {currentRole === 'student' && !isPro && (
          <div
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Free Quota</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: trialRemaining > 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                {trialRemaining} / 5 left
              </span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-hairline)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(trialRemaining / 5) * 100}%`,
                  backgroundColor: trialRemaining > 0 ? '#0066F5' : 'var(--danger)',
                  borderRadius: '9999px',
                }}
              />
            </div>
            <button
              onClick={() => {
                openPaywall();
                closeMobileMenu();
              }}
              style={{
                marginTop: '8px',
                width: '100%',
                backgroundColor: '#0066F5',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '6px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0, 102, 245, 0.2)',
              }}
            >
              <span>Upgrade Plan</span>
              <ChevronRight size={12} />
            </button>
          </div>
        )}

        {/* User Card with Role Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: currentRole === 'student' ? '#111827' : '#4F46E5',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {currentUser.fullName.charAt(0)}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.fullName}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {currentRole === 'student' ? 'Candidate Account' : 'Administrator'}
              </div>
            </div>
          </div>
        </div>

        {/* Auth Action */}
        <div style={{ marginTop: '8px' }}>
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                closeMobileMenu();
              }}
              style={{
                width: '100%',
                fontSize: '11.5px',
                fontWeight: 500,
                color: 'var(--danger-text)',
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid var(--danger-border)',
                backgroundColor: 'var(--danger-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                openAuth('login');
                closeMobileMenu();
              }}
              style={{
                width: '100%',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#FFFFFF',
                padding: '6px 10px',
                borderRadius: '4px',
                backgroundColor: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className="desktop-sidebar"
        style={{
          width: '240px',
          minWidth: '240px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--border-hairline)',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          zIndex: 40,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay & Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-drawer-overlay" onClick={closeMobileMenu} />
          <aside className="mobile-drawer">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  badge,
  badgeType,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
  badgeType?: 'warning' | 'default';
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: active ? 700 : 500,
        color: active ? '#0066F5' : '#334E68',
        backgroundColor: active ? '#EBF4FF' : 'transparent',
        transition: 'all 0.12s ease',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: active ? '#0066F5' : '#9FB3C8', display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span>{label}</span>
      </div>

      {badge && (
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '9999px',
            backgroundColor: badgeType === 'warning' ? '#FFF7ED' : '#EBF4FF',
            color: badgeType === 'warning' ? '#EA580C' : '#0066F5',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
