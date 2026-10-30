import { useState } from 'react';
import { WorkflowModal } from '@/modules/workflow';
import { Button, InlineAlert, InputField, SelectField, TextAreaField } from '@/shared';
import { FEE_MODEL_LABELS, GST_RATES, type CatalogService, type CatalogServiceUpdate, type FeeModel, type GstRate } from '../../shared/serviceCatalog.types';
import { CATALOG_LIMITS, validateCatalogUpdate } from '../../validation/serviceCatalogSchema';
import { formatFee } from './ServiceCard';
import './ServiceEditModal.css';

export interface ServiceEditModalProps {
  readonly service: CatalogService;
  readonly onSave: (update: CatalogServiceUpdate) => Promise<string | null>;
  readonly onSaved: (name: string) => void;
  readonly onClose: () => void;
}

interface FormState {
  readonly name: string;
  readonly description: string;
  readonly feeModel: FeeModel;
  readonly feeValue: string;
  readonly gstRate: string;
  readonly slaDays: string;
  readonly active: boolean;
}

const toForm = (service: CatalogService): FormState => ({
  name: service.name,
  description: service.description,
  feeModel: service.feeModel,
  feeValue: String(service.feeValue),
  gstRate: String(service.gstRate),
  slaDays: String(service.slaDays),
  active: service.active
});

const toUpdate = (form: FormState): CatalogServiceUpdate => ({
  name: form.name,
  description: form.description,
  feeModel: form.feeModel,
  feeValue: form.feeValue === '' ? Number.NaN : Number(form.feeValue),
  gstRate: Number(form.gstRate) as GstRate,
  slaDays: form.slaDays === '' ? Number.NaN : Number(form.slaDays),
  active: form.active
});

/** Digits only for rupees and days; digits and one decimal point for a percentage. */
const sanitizeNumber = (value: string, decimals: boolean) =>
  decimals ? value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 6) : value.replace(/\D/g, '').slice(0, 9);

export function ServiceEditModal({ service, onSave, onSaved, onClose }: ServiceEditModalProps) {
  const [form, setForm] = useState<FormState>(() => toForm(service));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const percentage = form.feeModel === 'PERCENTAGE';

  const handleSubmit = async () => {
    const update = toUpdate(form);
    const found = validateCatalogUpdate(update);
    setErrors(found);
    if (Object.keys(found).length > 0 || busy) {
      return;
    }
    setBusy(true);
    setServerError(null);
    const failure = await onSave(update);
    setBusy(false);
    if (failure) {
      setServerError(failure);
      return;
    }
    onSaved(update.name.trim());
  };

  const preview = toUpdate(form);
  const previewValid = Number.isFinite(preview.feeValue);

  return (
    <WorkflowModal
      title={`Edit ${service.name}`}
      subtitle="Changes apply to new applications; applications already in progress keep their terms."
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      busy={busy}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" iconName="save" loading={busy} loadingLabel="Saving…">
            Save Service
          </Button>
        </>
      }
    >
      {serverError ? <InlineAlert tone="error">{serverError}</InlineAlert> : null}
      <InputField id="tx-catalog-name" label="Service name *" value={form.name} onChange={(value) => set('name', value)} maxLength={CATALOG_LIMITS.nameMax} placeholder="e.g. GST Registration & Returns" required error={errors.name} />
      <TextAreaField id="tx-catalog-description" label="Description" value={form.description} onChange={(value) => set('description', value)} rows={3} maxLength={CATALOG_LIMITS.descriptionMax} error={errors.description} />

      <div className="tx-catalog-edit__grid">
        <SelectField<FeeModel>
          id="tx-catalog-fee-model"
          label="Fee type *"
          value={form.feeModel}
          onChange={(value) => setForm((current) => ({ ...current, feeModel: value, feeValue: '' }))}
          options={(Object.keys(FEE_MODEL_LABELS) as FeeModel[]).map((value) => ({ value, label: FEE_MODEL_LABELS[value] }))}
        />
        <InputField
          id="tx-catalog-fee"
          label={percentage ? 'Fee (% of amount) *' : 'Fee (₹) *'}
          value={form.feeValue}
          onChange={(value) => set('feeValue', sanitizeNumber(value, percentage))}
          inputMode={percentage ? 'decimal' : 'numeric'}
          placeholder={percentage ? 'e.g. 0.5' : 'e.g. 1499'}
          required
          error={errors.feeValue}
        />
        <SelectField
          id="tx-catalog-gst"
          label="GST rate *"
          value={form.gstRate}
          onChange={(value) => set('gstRate', value)}
          options={GST_RATES.map((rate) => ({ value: String(rate), label: `${rate}%` }))}
          error={errors.gstRate}
        />
        <InputField
          id="tx-catalog-sla"
          label="Turnaround (days) *"
          value={form.slaDays}
          onChange={(value) => set('slaDays', sanitizeNumber(value, false).slice(0, 2))}
          inputMode="numeric"
          placeholder={`${CATALOG_LIMITS.slaMin}–${CATALOG_LIMITS.slaMax}`}
          required
          error={errors.slaDays}
        />
      </div>

      <label className="tx-catalog-edit__toggle">
        <input type="checkbox" checked={form.active} onChange={(event) => set('active', event.target.checked)} />
        <span>
          <strong>Accepting new applications</strong>
          <span className="tx-catalog-edit__hint">Pause a service to stop new submissions without affecting open cases.</span>
        </span>
      </label>

      {previewValid ? <p className="tx-catalog-edit__preview">Clients will see: <strong>{formatFee(preview)}</strong></p> : null}
    </WorkflowModal>
  );
}
