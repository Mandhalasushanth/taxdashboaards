import { useState } from 'react';
import { Button, Icon } from '@/shared';
import { INDIAN_STATE_OPTIONS } from '../../shared/indianStates';
import {
  APPLICATION_PRIORITIES,
  APPLICATION_SERVICES,
  PRIORITY_LABELS,
  type ApplicationPriority,
  type ApplicationService,
  type NewApplicationInput
} from '../../shared/applications.types';
import { validateNewApplicationForm } from '../../validation/applicationValidation';
import './CreateApplicationModal.css';

interface CreateApplicationModalProps {
  readonly onClose: () => void;
  readonly onSubmit: (input: NewApplicationInput) => Promise<unknown>;
}

export function CreateApplicationModal({ onClose, onSubmit }: CreateApplicationModalProps) {
  const [vertical, setVertical] = useState<'TAX_CA' | 'LOANS'>('TAX_CA');
  const [service, setService] = useState<ApplicationService>('ITR_1_SALARY');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPan, setCustomerPan] = useState('');
  const [residentStatus, setResidentStatus] = useState<'RESIDENT' | 'NRI'>('RESIDENT');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('');
  const [assessmentYear, setAssessmentYear] = useState('2025-26');
  const [requestedAmount, setRequestedAmount] = useState('5000000');
  const [targetLender, setTargetLender] = useState('HDFC Bank');
  const [priority, setPriority] = useState<ApplicationPriority>('NORMAL');
  const [internalNotes, setInternalNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setSubmitting] = useState(false);

  const availableServices = APPLICATION_SERVICES.filter((s) => s.vertical === vertical);

  const handleVerticalChange = (newVertical: 'TAX_CA' | 'LOANS') => {
    try {
      setVertical(newVertical);
      const firstSvc = APPLICATION_SERVICES.find((s) => s.vertical === newVertical);
      if (firstSvc) setService(firstSvc.id);
    } catch (err) {
      console.error('Error changing vertical:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: NewApplicationInput = {
        customerName,
        customerEmail,
        customerPhone,
        customerPan,
        residentStatus,
        state,
        city: city.trim() || state,
        vertical,
        service,
        priority,
        internalNotes: internalNotes.trim(),
        ...(vertical === 'TAX_CA'
          ? { assessmentYear }
          : { requestedAmount: Number(requestedAmount), targetLender })
      };

      const fieldErrors = validateNewApplicationForm(payload);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }

      setErrors({});
      setSubmitting(true);
      await onSubmit(payload);
    } catch (err) {
      console.error('Submit failed:', err);
      setErrors({ form: (err as Error).message || 'Failed to create application.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tx-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tx-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tx-modal-header">
          <h3 className="tx-modal-title">New Client Application</h3>
          <button
            type="button"
            className="tx-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="x" size="md" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-modal-body">
          {errors.form && <div className="tx-form-error-msg">{errors.form}</div>}

          <div className="tx-form-row">
            <div className="tx-form-group">
              <label className="tx-form-label">Client Full Name *</label>
              <input
                type="text"
                className={`tx-form-input ${errors.customerName ? 'tx-form-input--error' : ''}`}
                placeholder="e.g. Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              {errors.customerName && (
                <span className="tx-form-error-msg">{errors.customerName}</span>
              )}
            </div>

            <div className="tx-form-group">
              <label className="tx-form-label">Permanent Account Number (PAN) *</label>
              <input
                type="text"
                className={`tx-form-input ${errors.customerPan ? 'tx-form-input--error' : ''}`}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                style={{ textTransform: 'uppercase', fontFamily: 'var(--tx-font-mono)' }}
                value={customerPan}
                onChange={(e) => setCustomerPan(e.target.value.toUpperCase())}
              />
              {errors.customerPan && (
                <span className="tx-form-error-msg">{errors.customerPan}</span>
              )}
            </div>
          </div>

          <div className="tx-form-row">
            <div className="tx-form-group">
              <label className="tx-form-label">Email Address *</label>
              <input
                type="email"
                className={`tx-form-input ${errors.customerEmail ? 'tx-form-input--error' : ''}`}
                placeholder="e.g. ramesh.kumar@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
              {errors.customerEmail && (
                <span className="tx-form-error-msg">{errors.customerEmail}</span>
              )}
            </div>

            <div className="tx-form-group">
              <label className="tx-form-label">Mobile Phone (10 digits) *</label>
              <input
                type="tel"
                className={`tx-form-input ${errors.customerPhone ? 'tx-form-input--error' : ''}`}
                placeholder="10-digit mobile number (e.g. 9845012345)"
                maxLength={10}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
              />
              {errors.customerPhone && (
                <span className="tx-form-error-msg">{errors.customerPhone}</span>
              )}
            </div>
          </div>

          <div className="tx-form-row">
            <div className="tx-form-group">
              <label className="tx-form-label">Residential Status</label>
              <select
                className="tx-form-select"
                value={residentStatus}
                onChange={(e) => setResidentStatus(e.target.value as 'RESIDENT' | 'NRI')}
              >
                <option value="RESIDENT">Resident Indian (ROR / RNOR)</option>
                <option value="NRI">Non-Resident Indian (NRI / OCI)</option>
              </select>
            </div>

            <div className="tx-form-group">
              <label className="tx-form-label">State of Residence *</label>
              <select
                className="tx-form-select"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {INDIAN_STATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tx-form-group">
              <label className="tx-form-label">City</label>
              <input
                type="text"
                className="tx-form-input"
                placeholder="e.g. Mumbai, Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="tx-form-row">
            <div className="tx-form-group">
              <label className="tx-form-label">Vertical</label>
              <select
                className="tx-form-select"
                value={vertical}
                onChange={(e) => handleVerticalChange(e.target.value as 'TAX_CA' | 'LOANS')}
              >
                <option value="TAX_CA">CA & Tax Compliance</option>
                <option value="LOANS">Loan Facilitation</option>
              </select>
            </div>

            <div className="tx-form-group">
              <label className="tx-form-label">Service Package *</label>
              <select
                className="tx-form-select"
                value={service}
                onChange={(e) => setService(e.target.value as ApplicationService)}
              >
                {availableServices.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {vertical === 'TAX_CA' ? (
            <div className="tx-form-row">
              <div className="tx-form-group">
                <label className="tx-form-label">Assessment Year *</label>
                <input
                  type="text"
                  className="tx-form-input"
                  placeholder="e.g. 2025-26"
                  value={assessmentYear}
                  onChange={(e) => setAssessmentYear(e.target.value)}
                />
              </div>

              <div className="tx-form-group">
                <label className="tx-form-label">Case Priority</label>
                <select
                  className="tx-form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ApplicationPriority)}
                >
                  {APPLICATION_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="tx-form-row">
              <div className="tx-form-group">
                <label className="tx-form-label">Requested Loan Amount (₹) *</label>
                <input
                  type="number"
                  className={`tx-form-input ${errors.requestedAmount ? 'tx-form-input--error' : ''}`}
                  placeholder="e.g. 5000000"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                />
                {errors.requestedAmount && (
                  <span className="tx-form-error-msg">{errors.requestedAmount}</span>
                )}
              </div>

              <div className="tx-form-group">
                <label className="tx-form-label">Target Lender</label>
                <input
                  type="text"
                  className="tx-form-input"
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  value={targetLender}
                  onChange={(e) => setTargetLender(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="tx-form-group">
            <label className="tx-form-label">Initial Notes / Special Instructions</label>
            <textarea
              className="tx-form-textarea"
              rows={3}
              placeholder="Any specific client requirements or source documents provided..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </div>

          <div className="tx-modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Case...' : 'Create Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
