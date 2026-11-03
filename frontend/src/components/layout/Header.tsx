'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Bell,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Menu,
  LogOut,
  LogIn,
  User
} from 'lucide-react';

export default function Header() {
  const {
    currentRole,
    currentUser,
    trialRemaining,
    hasActiveEntitlement,
    openPaywall,
    activeTab,
    searchQuery,
    setSearchQuery,
    toggleMobileMenu,
    isAuthenticated,
    logout,
    openAuth,
  } = useApp();

  const isUnlimited = hasActiveEntitlement();

  const getTabLabel = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview';
      case 'practice':
        return 'Practice Engine';
      case 'exams':
        return 'Mock Examinations';
      case 'resources':
        return 'Study Handouts';
      case 'payments':
        return 'Billing & Verification';
      case 'departments':
        return 'Academic Departments';
      case 'admin-dashboard':
        return 'Platform Analytics';
      case 'payment-review':
        return 'Verification Queue';
      case 'question-bank':
        return 'Question Bank';
      case 'departments-resources':
        return 'Departments & Handouts';
      case 'audit-logs':
        return 'Audit Logs';
      case 'settings':
        return 'Payment Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-hairline)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        gap: '12px',
      }}
    >
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <button
          className="mobile-menu-trigger"
          onClick={toggleMobileMenu}
          aria-label="Open Navigation Drawer"
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid var(--border-hairline)',
            backgroundColor: 'var(--bg-page)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <Menu size={18} />
        </button>

        <div className="header-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {currentRole === 'student' ? 'Student Workspace' : 'Administration'}
          </span>
          <ChevronRight size={13} color="#9CA3AF" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {getTabLabel()}
          </span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="header-search-container">
        <Search size={14} color="#9CA3AF" />
        <input
          type="text"
          placeholder="Search questions, topics, files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '12px',
            color: 'var(--text-primary)',
            width: '100%',
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            backgroundColor: '#FFFFFF',
            padding: '1px 5px',
            borderRadius: '4px',
            border: '1px solid var(--border-hairline)',
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Trial Quota status (Only for Student) */}
        {currentRole === 'student' && (
          <div>
            {isUnlimited ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success-text)',
                  border: '1px solid var(--success-border)',
                  borderRadius: '9999px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <CheckCircle2 size={12} />
                <span>Pro Unlimited</span>
              </span>
            ) : (
              <button
                onClick={openPaywall}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: trialRemaining > 0 ? '#EBF4FF' : '#FEF2F2',
                  color: trialRemaining > 0 ? '#0066F5' : '#991B1B',
                  border: `1px solid ${trialRemaining > 0 ? '#B9D9FE' : '#FEE2E2'}`,
                  borderRadius: '9999px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <Sparkles size={11} />
                <span>{trialRemaining}/5 Left</span>
              </button>
            )}
          </div>
        )}

        {/* Current Role Indicator (Locked - No switching after login) */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '6px',
            backgroundColor: currentRole === 'admin' ? '#0A2540' : '#EBF4FF',
            color: currentRole === 'admin' ? '#FFFFFF' : '#0066F5',
            border: `1px solid ${currentRole === 'admin' ? '#0A2540' : '#B9D9FE'}`,
            whiteSpace: 'nowrap',
          }}
        >
          {currentRole === 'admin' ? '🛡️ Administrator' : '🎓 Student Candidate'}
        </span>

        {/* Sign Out / Sign In Trigger */}
        {isAuthenticated ? (
          <button
            onClick={logout}
            title="Sign out to test Login & Register page"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-hairline)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: 500,
            }}
          >
            <LogOut size={13} />
            <span style={{ display: 'none' }}>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => openAuth('login')}
            className="btn-azure"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              fontSize: '11.5px',
            }}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
