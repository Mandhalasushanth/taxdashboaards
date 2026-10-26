import { useState } from 'react';
import { Icon } from '@/shared';
import './CaClientsSection.css';

interface ClientDirectoryRecord {
  readonly id: string;
  readonly name: string;
  readonly entityType: 'INDIVIDUAL' | 'COMPANY' | 'LLP' | 'FIRM';
  readonly pan: string;
  readonly gstin?: string;
  readonly email: string;
  readonly phone: string;
  readonly activeServices: readonly string[];
  readonly totalFilings: number;
  readonly complianceStatus: 'Compliant' | 'Pending Action' | 'Overdue';
}

const DEFAULT_CLIENTS: readonly ClientDirectoryRecord[] = Object.freeze([
  {
    id: 'CL-001',
    name: 'Arjun Nambiar',
    entityType: 'INDIVIDUAL',
    pan: 'ABCPA1234F',
    email: 'arjun.nambiar@gmail.com',
    phone: '+91 98450 11223',
    activeServices: ['ITR-2 (Capital Gains)'],
    totalFilings: 5,
    complianceStatus: 'Pending Action'
  },
  {
    id: 'CL-002',
    name: 'Acme Tech Solutions LLP',
    entityType: 'LLP',
    pan: 'AAACA2345L',
    gstin: '29AAACA2345L1Z1',
    email: 'accounts@acmetech.io',
    phone: '+91 80 4123 4567',
    activeServices: ['GSTR-3B Monthly', 'Annual ROC Compliance'],
    totalFilings: 24,
    complianceStatus: 'Compliant'
  },
  {
    id: 'CL-003',
    name: 'Karthik Somayajji',
    entityType: 'INDIVIDUAL',
    pan: 'AABCS9988K',
    gstin: '36AABCS9988K1Z5',
    email: 'karthik.som@gmail.com',
    phone: '+91 99001 22334',
    activeServices: ['GST Monthly & LUT', 'ITR-3 Business'],
    totalFilings: 12,
    complianceStatus: 'Pending Action'
  },
  {
    id: 'CL-004',
    name: 'Meera Iyer',
    entityType: 'INDIVIDUAL',
    pan: 'AAGPI5678L',
    email: 'meera.iyer@outlook.com',
    phone: '+91 97400 33445',
    activeServices: ['ITR-1 Salaried'],
    totalFilings: 3,
    complianceStatus: 'Compliant'
  },
  {
    id: 'CL-005',
    name: 'Zenith Logistics Pvt Ltd',
    entityType: 'COMPANY',
    pan: 'AAACZ7788P',
    gstin: '27AAACZ7788P1Z8',
    email: 'finance@zenithlog.com',
    phone: '+91 22 6789 0123',
    activeServices: ['GST Monthly', 'Corporate ITR-6', 'TDS Quarterly'],
    totalFilings: 38,
    complianceStatus: 'Compliant'
  }
]);

export function CaClientsSection() {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<'ALL' | 'INDIVIDUAL' | 'COMPANY' | 'LLP'>('ALL');

  const query = search.trim().toLowerCase();
  const clients = DEFAULT_CLIENTS.filter((c) => {
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.pan.toLowerCase().includes(query) ||
      (c.gstin && c.gstin.toLowerCase().includes(query));

    const matchesEntity = entityFilter === 'ALL' || c.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="tx-ca-clients-section">
      {/* Header */}
      <div className="tx-ca-clients-header">
        <div>
          <h2 className="tx-ca-clients-title">Client Accounts & Taxpayers Directory</h2>
          <p className="tx-ca-clients-subtitle">
            Master register of individual taxpayers, corporate entities, and LLPs managed by CA operations.
          </p>
        </div>

        {/* Filter controls */}
        <div className="tx-ca-clients-controls">
          <div className="tx-ca-client-search-wrap">
            <Icon name="search" size="sm" />
            <input
              type="text"
              className="tx-ca-client-search-input"
              placeholder="Search by Client, PAN, or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="tx-ca-client-filters">
            {(['ALL', 'INDIVIDUAL', 'COMPANY', 'LLP'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`tx-ca-client-filter-btn ${entityFilter === type ? 'tx-ca-client-filter-btn--active' : ''}`}
                onClick={() => setEntityFilter(type)}
              >
                {type === 'ALL' ? 'All Entities' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="tx-ca-clients-grid">
        {clients.map((client) => {
          const isPending = client.complianceStatus === 'Pending Action';

          return (
            <div key={client.id} className="tx-ca-client-card">
              <div className="tx-ca-client-card-top">
                <div className="tx-ca-client-avatar">{client.name.charAt(0)}</div>
                <div className="tx-ca-client-headline">
                  <div className="tx-ca-client-name-row">
                    <h3 className="tx-ca-client-name">{client.name}</h3>
                    <span className="tx-ca-entity-badge">{client.entityType}</span>
                  </div>
                  <div className="tx-ca-client-tax-ids">
                    <span>PAN: <strong>{client.pan}</strong></span>
                    {client.gstin && (
                      <>
                        <span className="tx-ca-sep">•</span>
                        <span>GSTIN: <strong>{client.gstin}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className={
                    isPending
                      ? 'tx-ca-client-status-chip tx-ca-client-status-chip--pending'
                      : 'tx-ca-client-status-chip tx-ca-client-status-chip--good'
                  }
                >
                  {client.complianceStatus}
                </span>
              </div>

              {/* Active Services */}
              <div className="tx-ca-client-services">
                <span className="tx-ca-services-label">Active Engagements:</span>
                <div className="tx-ca-services-chips">
                  {client.activeServices.map((srv) => (
                    <span key={srv} className="tx-ca-service-pill">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer with Contact and CTA */}
              <div className="tx-ca-client-card-footer">
                <div className="tx-ca-client-contact">
                  <span>{client.phone}</span>
                  <span className="tx-ca-sep">•</span>
                  <span>{client.email}</span>
                </div>

                <div className="tx-ca-client-filing-stat">
                  <span>{client.totalFilings} Historic Filings</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
