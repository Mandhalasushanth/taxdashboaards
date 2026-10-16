import type { CreateTaskInput, ReviewDecisionInput } from '../shared/caManager.types';

export interface CaFieldValidation {
  readonly isValid: boolean;
  readonly message?: string;
}

export function validateReviewComments(comments: string): CaFieldValidation {
  try {
    const trimmed = comments.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Review decision notes or correction items are required.' };
    }
    if (trimmed.length < 5) {
      return { isValid: false, message: 'Review notes must be at least 5 characters to guide the agent.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid review comments format.' };
  }
}

export function validateTaskTitle(title: string): CaFieldValidation {
  try {
    const trimmed = title.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Task description/title is required.' };
    }
    if (trimmed.length < 3) {
      return { isValid: false, message: 'Task title must be at least 3 characters.' };
    }
    if (trimmed.length > 120) {
      return { isValid: false, message: 'Task title cannot exceed 120 characters.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid task title.' };
  }
}

export function validateTaskDueDate(dueDate: string): CaFieldValidation {
  try {
    if (!dueDate || !dueDate.trim()) {
      return { isValid: false, message: 'Target due date is required.' };
    }
    const parsed = new Date(dueDate);
    if (isNaN(parsed.getTime())) {
      return { isValid: false, message: 'Enter a valid date.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid date value.' };
  }
}

export function validateDocumentRejection(reason: string): CaFieldValidation {
  try {
    const trimmed = reason.trim();
    if (!trimmed) {
      return { isValid: false, message: 'A specific deficiency reason is mandatory when rejecting.' };
    }
    if (trimmed.length < 5) {
      return { isValid: false, message: 'Deficiency reason must be at least 5 characters.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid rejection reason format.' };
  }
}

export function validateTaskForm(input: CreateTaskInput): Record<string, string> {
  const errors: Record<string, string> = {};
  try {
    const titleVal = validateTaskTitle(input.title);
    if (!titleVal.isValid && titleVal.message) errors.title = titleVal.message;

    const dateVal = validateTaskDueDate(input.dueAt);
    if (!dateVal.isValid && dateVal.message) errors.dueAt = dateVal.message;

    if (!input.ownerName || !input.ownerName.trim()) {
      errors.ownerName = 'Assigned owner is required.';
    }
  } catch (err) {
    console.error('Task validation failed:', err);
  }
  return errors;
}

export function validateReviewForm(input: ReviewDecisionInput): Record<string, string> {
  const errors: Record<string, string> = {};
  try {
    const commentVal = validateReviewComments(input.comments);
    if (!commentVal.isValid && commentVal.message) errors.comments = commentVal.message;
  } catch (err) {
    console.error('Review validation failed:', err);
  }
  return errors;
}
