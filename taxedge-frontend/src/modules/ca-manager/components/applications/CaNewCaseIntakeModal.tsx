import { useState } from 'react';
import { Icon } from '@/shared';
import type { ApplicationService, ApplicationPriority } from '../../shared/caManager.types';
import './CaNewCaseIntakeModal.css';

export interface NewCaseIntakeData {
  readonly customerName: string;
  readonly pan: string;
  readonly email: string;
  readonly phone: string;
  readonly service: ApplicationService;
  readonly priority: ApplicationPriority;
  readonly agentName: string;
  readonly dueDate: string;
  readonly notes: string;
}

interface CaNewCaseIntakeModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: NewCaseIntakeData) => void;
}

const SERVICES: readonly { id: ApplicationService; label: string }[] = Object.freeze([
  { id: 'ITR_1_SALARY', label: 'ITR-1 (Salaried Individual / Form 16)' },
  { id: 'ITR_2_CAP_GAINS', label: 'ITR-2 (Capital Gains & Multiple Properties)' },
  { id: 'ITR_3_BUSINESS', label: 'ITR-3 (Business & Professional Practice)' },
  { id: 'ITR_4_SUGAM', label: 'ITR-4 Sugam (Presumptive Business 44AD/ADA)' },
  { id: 'GST_REG_FILING', label: 'GST Monthly / Quarterly & LUT Filing' },
  { id: 'TAX_AUDIT_ROC', label: 'Tax Audit (Sec 44AB) & Corporate ROC' },
  { id: 'TDS_RETURNS', label: 'TDS Quarterly Return & 16A Generation' }
]);

const AGENTS: readonly string[] = Object.freeze([
  'Suresh Kumar (Senior Executive)',
  'Priya Sharma (Executive - GST)',
  'Rahul Verma (Executive - ITR)',
  'Neha Gupta (Executive)',
  'Leave Unassigned'
]);

export function CaNewCaseIntakeModal({ open, onClose, onSubmit }: CaNewCaseIntakeModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [pan, setPan] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState<ApplicationService>('ITR_1_SALARY');
  const [priority, setPriority] = useState<ApplicationPriority>('NORMAL');
  const [agentName, setAgentName] = useState('Suresh Kumar (Senior Executive)');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !pan.trim()) {
      alert('Please provide Customer Name and PAN Number.');
      return;
    }

    onSubmit({
      customerName: customerName.trim(),
      pan: pan.trim().toUpperCase(),
      email: email.trim(),
      phone: phone.trim(),
      service,
      priority,
      agentName: agentName === 'Leave Unassigned' ? '' : agentName.split(' (')[0],
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="tx-ca-modal-overlay" role="dialog" aria-modal="true" aria-label="New Case Intake">
      <div className="tx-ca-modal-window">
        {/* Modal Header */}
        <div className="tx-ca-modal-header">
          <div>
            <h3 className="tx-ca-modal-title">New Customer Case Intake</h3>
            <p className="tx-ca-modal-subtitle">
              Provision a new GST, ITR, or incorporation engagement and allocate an agent.
            </p>
          </div>
          <button type="button" className="tx-ca-modal-close" onClick={onClose} aria-label="Close modal">
            <Icon name="x" size="sm" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="tx-ca-modal-form">
          <div className="tx-ca-form-grid">
            {/* Customer Name */}
            <div className="tx-ca-field">
              <label className="tx-ca-label">Client Full Name *</label>
              <input
                type="text"
                className="tx-ca-input"
                placeholder="e.g. Ramesh Babu / Acme Corp"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            {/* PAN Number */}
            <div className="tx-ca-field">
              <label className="tx-ca-label">PAN Number *</label>
              <input
                type="text"
                className="tx-ca-input"
                placeholder="e.g. ABCPR1234F"
                maxLength={10}
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                required
              />
            </div>

            {/* Email */}
            <div className="tx-ca-field">
              <label className="tx-ca-label">Email Address</label>
              <input
                type="email"
                className="tx-ca-input"
                placeholder="client@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="tx-ca-field">
              <label className="tx-ca-label">Phone / WhatsApp</label>
              <input
                type="tel"
                className="tx-ca-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Service Type */}
            <div className="tx-ca-field tx-ca-field--span2">
              <label className="tx-ca-label">Compliance Service Category *</label>
              <select
                className="tx-ca-select"
                value={service}
                onChange={(e) => setService(e.target.value as ApplicationService)}
              >
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="tx-ca-field">
              <label className="tx-ca-label">Filing Priority</label>
              <select
                className="tx-ca-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as ApplicationPriority)}
              >
                <option value="NORMAL">Normal SLA (5 Days)</option>
                <option value="HIGH">High Priority (48 Hours)</option>
                <option value="URGENT">Urgent SLA (Same Day Filing)</option>
              </select>
            </div>

            {/* Assigned Executive Agent */}
            <div className="tx-ca-field">
              <label className="tx-ca-label">Assign Executive Agent</label>
              <select
                className="tx-ca-select"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              >
                {AGENTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Due Date */}
            <div className="tx-ca-field">
              <label className="tx-ca-label">Target Compliance Deadline</label>
              <input
                type="date"
                className="tx-ca-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Intake Notes */}
            <div className="tx-ca-field tx-ca-field--span2">
              <label className="tx-ca-label">Intake Notes & Client Instructions</label>
              <textarea
                className="tx-ca-textarea"
                rows={2}
                placeholder="Mention missing documents, specific capital gain inquiries, or client requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="tx-ca-modal-footer">
            <button type="button" className="tx-ca-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tx-ca-modal-submit">
              <Icon name="plus" size="sm" />
              <span>Intake Case & Assign</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
