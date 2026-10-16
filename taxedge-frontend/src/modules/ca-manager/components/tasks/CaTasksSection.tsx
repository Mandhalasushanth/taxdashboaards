import { useEffect, useState } from 'react';
import { Button, EmptyState, Icon, LoadingSpinner } from '@/shared';
import { caManagerApi } from '../../api/caManagerApi';
import type { CaTask, CreateTaskInput } from '../../shared/caManager.types';
import { validateTaskForm } from '../../validation/caManagerValidation';
import './CaTasksSection.css';

export function CaTasksSection() {
  const [tasks, setTasks] = useState<readonly CaTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAppId, setNewAppId] = useState('APP-2025-0101');
  const [newOwner, setNewOwner] = useState('Suresh Kumar');
  const [newDueDate, setNewDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      setLoading(true);
      const res = await caManagerApi.listTasks();
      setTasks(res);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleComplete = async (taskId: string) => {
    try {
      await caManagerApi.completeTask(taskId);
      await load();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateTaskInput = {
      applicationId: newAppId,
      title: newTitle,
      ownerName: newOwner,
      dueAt: newDueDate || new Date(Date.now() + 24 * 3600000).toISOString(),
      priority: 'NORMAL'
    };

    const fieldErrors = validateTaskForm(payload);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    try {
      setErrors({});
      await caManagerApi.createTask(payload);
      setIsModalOpen(false);
      setNewTitle('');
      await load();
    } catch (err) {
      console.error('Task create failed:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <LoadingSpinner size="lg" label="Loading tasks..." />
      </div>
    );
  }

  return (
    <div className="tx-ca-tasks-section">
      <div className="tx-ca-tasks-header-row">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--tx-primary-navy)' }}>
            Tasks & Case Checklists
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--tx-secondary-text)' }}>
            Outstanding operational actions, document requests, and compliance milestones.
          </p>
        </div>
        <Button variant="primary" iconName="plus" onClick={() => setIsModalOpen(true)}>
          Create Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div style={{ background: 'var(--tx-surface)', padding: '36px', borderRadius: 'var(--tx-radius-md)', border: '1px solid var(--tx-border)', textAlign: 'center' }}>
          <EmptyState
            iconName="check-check"
            title="All tasks completed"
            message="No pending case milestones or reminders."
          />
        </div>
      ) : (
        <div className="tx-ca-tasks-list">
          {tasks.map((task) => {
            const isDone = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`tx-ca-task-item ${isDone ? 'tx-ca-task-item--completed' : ''}`}
              >
                <div className="tx-ca-task-left">
                  <button
                    type="button"
                    className={`tx-ca-task-check-btn ${isDone ? 'tx-ca-task-check-btn--done' : ''}`}
                    onClick={() => handleToggleComplete(task.id)}
                    aria-label={`Mark task ${task.title} as completed`}
                  >
                    <Icon name="check" size="sm" />
                  </button>
                  <div className="tx-ca-task-info">
                    <span
                      className="tx-ca-task-title"
                      style={{ textDecoration: isDone ? 'line-through' : 'none' }}
                    >
                      {task.title}
                    </span>
                    <span className="tx-ca-task-meta">
                      Case: <strong>{task.applicationId}</strong> • Assignee: {task.ownerName} ({task.ownerRole}) •
                      Due: {new Date(task.dueAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--tx-radius-sm)',
                    background: isDone ? 'var(--tx-success-light)' : 'var(--tx-light-blue)',
                    color: isDone ? 'var(--tx-success)' : 'var(--tx-primary-blue)'
                  }}
                >
                  {task.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="tx-modal-overlay" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="tx-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tx-modal-header">
              <h3 className="tx-modal-title">Create Operational Task</h3>
              <button
                type="button"
                className="tx-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <Icon name="x" size="md" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="tx-modal-body">
              <div className="tx-form-group">
                <label className="tx-form-label">Task Title / Action Item *</label>
                <input
                  type="text"
                  className={`tx-form-input ${errors.title ? 'tx-form-input--error' : ''}`}
                  placeholder="e.g. Verify Form 16 Part A against TRACES download..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                {errors.title && <span className="tx-form-error-msg">{errors.title}</span>}
              </div>

              <div className="tx-form-row">
                <div className="tx-form-group">
                  <label className="tx-form-label">Application ID</label>
                  <input
                    type="text"
                    className="tx-form-input"
                    value={newAppId}
                    onChange={(e) => setNewAppId(e.target.value)}
                  />
                </div>
                <div className="tx-form-group">
                  <label className="tx-form-label">Assignee</label>
                  <select
                    className="tx-form-select"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                  >
                    <option value="Suresh Kumar">Suresh Kumar (CA Agent)</option>
                    <option value="Priya Sharma">Priya Sharma (CA Agent)</option>
                    <option value="Imran Qureshi">Imran Qureshi (CA Agent)</option>
                    <option value="Sanjay Verma">Sanjay Verma (CA Manager)</option>
                  </select>
                </div>
              </div>

              <div className="tx-form-group">
                <label className="tx-form-label">Target Due Date *</label>
                <input
                  type="date"
                  className={`tx-form-input ${errors.dueAt ? 'tx-form-input--error' : ''}`}
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
                {errors.dueAt && <span className="tx-form-error-msg">{errors.dueAt}</span>}
              </div>

              <div className="tx-modal-footer">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
