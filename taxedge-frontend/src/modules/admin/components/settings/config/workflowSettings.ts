import type { SettingsSectionConfig } from '../../../shared/settings.types';

/** Turnaround targets and assignment rules for CA and loan cases. */
export const WORKFLOW_SETTINGS = Object.freeze<SettingsSectionConfig>({
  id: 'workflow',
  label: 'SLA & Workflow',
  description: 'Turnaround targets, escalation and assignment rules for CA and loan cases.',
  iconName: 'sliders',
  fields: [
    {
      key: 'caFilingSlaDays',
      label: 'CA filing turnaround',
      type: 'number',
      defaultValue: '3',
      required: true,
      min: 1,
      max: 60,
      unit: 'days',
      hint: 'From complete documents to filing (ITR, GST returns).',
      inputMode: 'numeric'
    },
    {
      key: 'loanProcessingSlaDays',
      label: 'Loan processing turnaround',
      type: 'number',
      defaultValue: '7',
      required: true,
      min: 1,
      max: 90,
      unit: 'days',
      hint: 'From application to lender submission.',
      inputMode: 'numeric'
    },
    {
      key: 'escalationThresholdHours',
      label: 'Escalate idle cases after',
      type: 'number',
      defaultValue: '24',
      required: true,
      min: 1,
      max: 168,
      unit: 'hours',
      hint: 'A case with no activity for this long is flagged to its manager.',
      inputMode: 'numeric'
    },
    {
      key: 'maxActiveCasesPerAgent',
      label: 'Maximum active cases per agent',
      type: 'number',
      defaultValue: '25',
      required: true,
      min: 1,
      max: 200,
      unit: 'cases',
      inputMode: 'numeric'
    },
    {
      key: 'documentRetentionYears',
      label: 'Keep client documents for',
      type: 'number',
      defaultValue: '8',
      required: true,
      min: 1,
      max: 20,
      unit: 'years',
      hint: 'Indian tax and company law generally require books to be kept for at least 8 years.',
      inputMode: 'numeric'
    },
    {
      key: 'autoAssignApplications',
      label: 'Auto-assign new applications',
      type: 'toggle',
      defaultValue: true,
      hint: 'Assign to the agent with the fewest active cases in the matching service.'
    },
    {
      key: 'requireManagerApproval',
      label: 'Require manager approval before filing or submission',
      type: 'toggle',
      defaultValue: true
    }
  ]
});
