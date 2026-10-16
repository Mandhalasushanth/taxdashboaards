import { useState } from 'react';
import { Button, Icon } from '@/shared';
import type { ApplicationItem, AssignStaffInput } from '../../shared/applications.types';
import { validateAuditNote } from '../../validation/applicationValidation';
import './AssignStaffModal.css';

interface StaffOption {
  readonly id: string;
  readonly name: string;
  readonly roleTitle: string;
  readonly vertical: 'TAX_CA' | 'LOANS';
  readonly tier: 'MANAGER' | 'AGENT';
}

const AVAILABLE_STAFF: readonly StaffOption[] = [
  { id: 'MGR-101', name: 'Sanjay Verma', roleTitle: 'Senior CA Manager', vertical: 'TAX_CA', tier: 'MANAGER' },
  { id: 'MGR-102', name: 'Neha Kulkarni', roleTitle: 'Corporate Compliance Manager', vertical: 'TAX_CA', tier: 'MANAGER' },
  { id: 'MGR-201', name: 'Ananya Deshmukh', roleTitle: 'Retail Lending Lead Manager', vertical: 'LOANS', tier: 'MANAGER' },
  { id: 'MGR-202', name: 'Rahul Bansal', roleTitle: 'Commercial Mortgages Manager', vertical: 'LOANS', tier: 'MANAGER' },
  { id: 'AGT-301', name: 'Suresh Kumar', roleTitle: 'Chartered Accountant (Direct Tax)', vertical: 'TAX_CA', tier: 'AGENT' },
  { id: 'AGT-302', name: 'Priya Sharma', roleTitle: 'ITR & Exemption Specialist', vertical: 'TAX_CA', tier: 'AGENT' },
  { id: 'AGT-303', name: 'Imran Qureshi', roleTitle: 'NRI Tax & FEMA Specialist', vertical: 'TAX_CA', tier: 'AGENT' },
  { id: 'AGT-401', name: 'Rajesh Patel', roleTitle: 'Senior Loan Underwriter', vertical: 'LOANS', tier: 'AGENT' },
  { id: 'AGT-402', name: 'Kavita Iyer', roleTitle: 'MSME Loan Documentation Officer', vertical: 'LOANS', tier: 'AGENT' },
  { id: 'AGT-403', name: 'Deepak Joshi', roleTitle: 'Credit Verification Officer', vertical: 'LOANS', tier: 'AGENT' }
];

interface AssignStaffModalProps {
  readonly app: ApplicationItem;
  readonly onClose: () => void;
  readonly onSubmit: (input: AssignStaffInput) => Promise<void>;
}

export function AssignStaffModal({ app, onClose, onSubmit }: AssignStaffModalProps) {
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(app.managerId);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(app.agentId);
  const [auditNote, setAuditNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const availableManagers = AVAILABLE_STAFF.filter(
    (s) => s.vertical === app.vertical && s.tier === 'MANAGER'
  );
  const availableAgents = AVAILABLE_STAFF.filter(
    (s) => s.vertical === app.vertical && s.tier === 'AGENT'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const noteValidation = validateAuditNote(auditNote, 3);
      if (!noteValidation.isValid) {
        setError(noteValidation.message || 'Audit note is required.');
        return;
      }

      setError(null);
      setSubmitting(true);

      const payload: AssignStaffInput = {
        applicationId: app.id,
        managerId: selectedManagerId,
        agentId: selectedAgentId,
        auditNote: auditNote.trim()
      };

      await onSubmit(payload);
    } catch (err) {
      console.error('Assign staff failed:', err);
      setError((err as Error).message || 'Failed to assign staff.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tx-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tx-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tx-modal-header">
          <h3 className="tx-modal-title">Staff Assignment • {app.id}</h3>
          <button
            type="button"
            className="tx-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="x" size="md" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-modal-body tx-assign-modal">
          {error && <div className="tx-form-error-msg">{error}</div>}

          <div className="tx-assign-staff-picker">
            <label className="tx-form-label">Supervising Manager</label>
            <div className="tx-assign-staff-options">
              {availableManagers.map((mgr) => {
                const isSelected = selectedManagerId === mgr.id;
                return (
                  <button
                    key={mgr.id}
                    type="button"
                    className={`tx-assign-staff-card ${isSelected ? 'tx-assign-staff-card--selected' : ''}`}
                    onClick={() => setSelectedManagerId(isSelected ? null : mgr.id)}
                  >
                    <div className="tx-assign-staff-avatar">{mgr.name.slice(0, 2).toUpperCase()}</div>
                    <div className="tx-assign-staff-info">
                      <span className="tx-assign-staff-name">{mgr.name}</span>
                      <span className="tx-assign-staff-role">{mgr.roleTitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="tx-assign-staff-picker">
            <label className="tx-form-label">Executive / Agent</label>
            <div className="tx-assign-staff-options">
              {availableAgents.map((agt) => {
                const isSelected = selectedAgentId === agt.id;
                return (
                  <button
                    key={agt.id}
                    type="button"
                    className={`tx-assign-staff-card ${isSelected ? 'tx-assign-staff-card--selected' : ''}`}
                    onClick={() => setSelectedAgentId(isSelected ? null : agt.id)}
                  >
                    <div className="tx-assign-staff-avatar">{agt.name.slice(0, 2).toUpperCase()}</div>
                    <div className="tx-assign-staff-info">
                      <span className="tx-assign-staff-name">{agt.name}</span>
                      <span className="tx-assign-staff-role">{agt.roleTitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="tx-form-group">
            <label className="tx-form-label">Assignment Audit Note *</label>
            <textarea
              className="tx-form-textarea"
              rows={2}
              placeholder="State reason for assignment (e.g. specialized capital gains portfolio)..."
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
            />
          </div>

          <div className="tx-modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Assignment...' : 'Confirm Assignment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
