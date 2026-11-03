'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  History,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  FileText
} from 'lucide-react';

export default function AuditLogView() {
  const { auditLogs } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType !== 'all' && log.entityType !== filterType) return false;
    if (
      searchTerm &&
      !log.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.action.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        className="clean-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Append-Only System Audit Trail
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-hairline)',
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              SRS FR-AUD-01 / NFR-SEC-02
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Immutable security log of all payment decisions, role changes, question modifications, and entitlement events.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '6px',
              padding: '6px 12px',
            }}
          >
            <Search size={14} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search audit records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '12px', width: '160px', color: 'var(--text-primary)' }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Entity Types</option>
            <option value="Payment">Payment Decisions</option>
            <option value="Question">Question Events</option>
            <option value="Department">Department Events</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="clean-card" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-hairline)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Timestamp (UTC)</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Actor</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Entity Type</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Audit Details & Evidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const isApproved = log.action.includes('Approved');
                const isRejected = log.action.includes('Rejected');

                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {log.actorName}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          color: isApproved ? 'var(--success-text)' : isRejected ? 'var(--danger-text)' : 'var(--text-secondary)',
                          backgroundColor: isApproved ? 'var(--success-light)' : isRejected ? 'var(--danger-light)' : 'var(--bg-subtle)',
                          border: `1px solid ${isApproved ? 'var(--success-border)' : isRejected ? 'var(--danger-border)' : 'var(--border-hairline)'}`,
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {log.entityType}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
