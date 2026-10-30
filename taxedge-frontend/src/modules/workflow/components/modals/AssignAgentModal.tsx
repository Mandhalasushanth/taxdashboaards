import { useMemo, useState } from 'react';
import { toInitials } from '@/core/utils/stringUtils';
import { Button, InlineAlert, InputField, LoadingSpinner, TextAreaField } from '@/shared';
import { useTeamWorkload } from '../../hooks/useWorkflowData';
import { validateNote } from '../../services/transitionRules';
import { TEAM_LABELS } from '../../shared/workflowServices';
import { MAX_NOTE_LENGTH } from '../../shared/workflowStatuses';
import type { AgentWorkload, AssignInput, WorkflowCase } from '../../shared/workflow.types';
import { WorkflowModal } from './WorkflowModal';
import './AssignAgentModal.css';

export interface AssignAgentModalProps {
  readonly item: WorkflowCase;
  readonly busy: boolean;
  readonly serverError: string | null;
  /** Administrators must give a reason, because their reassignment is an intervention. */
  readonly requireReason: boolean;
  readonly onSubmit: (input: AssignInput) => Promise<boolean>;
  readonly onClose: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Lower load first; inactive agents sink to the bottom and cannot be chosen. */
const byAvailability = (a: AgentWorkload, b: AgentWorkload) =>
  Number(b.agent.active) - Number(a.agent.active) || a.activeCases + a.overdue - (b.activeCases + b.overdue);

export function AssignAgentModal({ item, busy, serverError, requireReason, onSubmit, onClose }: AssignAgentModalProps) {
  const workload = useTeamWorkload();
  const [agentId, setAgentId] = useState<string | null>(item.assignment.agentId);
  const [instructions, setInstructions] = useState(item.assignment.instructions ?? '');
  const [dueDate, setDueDate] = useState(item.dueDate ? item.dueDate.slice(0, 10) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reassigning = item.assignment.agentId !== null;

  const agents = useMemo(
    () => (workload.data ?? []).filter((entry) => entry.agent.team === item.team).sort(byAvailability),
    [workload.data, item.team]
  );

  const validate = (): Record<string, string> => {
    const noteError = validateNote(instructions, requireReason, requireReason ? 'An intervention reason' : 'Instructions');
    const dateError = dueDate && dueDate < todayIso() ? 'The due date cannot be in the past.' : null;
    const originalDue = item.dueDate ? item.dueDate.slice(0, 10) : '';
    const unchanged = agentId === item.assignment.agentId && dueDate === originalDue;
    const agentError = !agentId ? 'Select an eligible agent.' : unchanged ? 'Choose a different agent or a new due date.' : null;
    return Object.fromEntries(
      [['agent', agentError], ['instructions', noteError], ['dueDate', dateError]].filter((entry): entry is [string, string] => entry[1] !== null)
    );
  };

  const handleSubmit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !agentId) {
      return;
    }
    const keptDate = item.dueDate && dueDate === item.dueDate.slice(0, 10) ? item.dueDate : null;
    const nextDue = keptDate ?? (dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : null);
    const saved = await onSubmit({ agentId, instructions: instructions.trim(), dueDate: nextDue });
    if (saved) {
      onClose();
    }
  };

  const renderAgent = (entry: AgentWorkload) => {
    const current = entry.agent.id === item.assignment.agentId;
    const disabled = !entry.agent.active;
    const selected = agentId === entry.agent.id;
    return (
      <li key={entry.agent.id}>
        <button
          type="button"
          className={`tx-assign-agent ${selected ? 'tx-assign-agent--selected' : ''}`}
          onClick={() => setAgentId(entry.agent.id)}
          disabled={disabled}
          aria-pressed={selected}
        >
          <span className="tx-assign-agent__avatar" aria-hidden="true">
            {toInitials(entry.agent.name)}
          </span>
          <span className="tx-assign-agent__info">
            <span className="tx-assign-agent__name">{entry.agent.name}</span>
            {entry.agent.email ? <span className="tx-assign-agent__email">{entry.agent.email}</span> : null}
            <span className="tx-assign-agent__meta">
              {!entry.agent.active ? 'Inactive' : current ? 'Current agent · keep to reschedule' : `${entry.activeCases} active · ${entry.portalWork} on portal`}
            </span>
          </span>
          {entry.overdue > 0 ? <span className="tx-assign-agent__overdue">{entry.overdue} overdue</span> : null}
        </button>
      </li>
    );
  };

  const renderAgents = () => {
    if (workload.status === 'loading') return <LoadingSpinner label="Loading eligible agents" />;
    if (workload.status === 'error') return <InlineAlert tone="error">{workload.error ?? 'Unable to load agents.'}</InlineAlert>;
    if (agents.length === 0) return <InlineAlert tone="warning">{`No agents exist in the ${TEAM_LABELS[item.team]} yet.`}</InlineAlert>;
    return <ul className="tx-assign-agent__list">{agents.map(renderAgent)}</ul>;
  };

  return (
    <WorkflowModal
      title={reassigning ? 'Reassign or Reschedule' : 'Assign Agent'}
      subtitle={`${item.referenceNumber} · ${item.client.name}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={busy}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" iconName="user-check" loading={busy} loadingLabel="Saving…">
            {reassigning ? 'Save Changes' : 'Confirm Assignment'}
          </Button>
        </>
      }
    >
      {serverError ? <InlineAlert tone="error">{serverError}</InlineAlert> : null}
      <fieldset className="tx-assign-agent__fieldset">
        <legend className="tx-assign-agent__legend">Eligible agents · {TEAM_LABELS[item.team]}</legend>
        {renderAgents()}
        {errors.agent ? <p className="tx-assign-agent__error" role="alert">{errors.agent}</p> : null}
      </fieldset>
      <div className="tx-assign-agent__grid">
        <InputField id="tx-assign-due" label="Due Date" type="date" value={dueDate} onChange={setDueDate} error={errors.dueDate} />
      </div>
      <TextAreaField
        id="tx-assign-instructions"
        label={requireReason ? 'Intervention Reason *' : 'Internal Instructions'}
        value={instructions}
        onChange={setInstructions}
        rows={3}
        maxLength={MAX_NOTE_LENGTH}
        error={errors.instructions}
      />
    </WorkflowModal>
  );
}
