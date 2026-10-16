import type { NewApplicationInput } from '../shared/applications.types';

export interface FieldValidationResult {
  readonly isValid: boolean;
  readonly message?: string;
}

export function validateCustomerName(name: string): FieldValidationResult {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Customer full name is required.' };
    }
    if (trimmed.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters.' };
    }
    if (trimmed.length > 60) {
      return { isValid: false, message: 'Name cannot exceed 60 characters.' };
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
      return { isValid: false, message: 'Name can only contain alphabets and spaces.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid name format.' };
  }
}

export function validateCustomerEmail(email: string): FieldValidationResult {
  try {
    const trimmed = email.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Email address is required.' };
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, message: 'Enter a valid email address (e.g. rahul.sharma@example.com).' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid email address.' };
  }
}

export function validateCustomerPhone(phone: string): FieldValidationResult {
  try {
    const digits = phone.replace(/\D/g, '');
    if (!digits) {
      return { isValid: false, message: '10-digit mobile number is required.' };
    }
    if (digits.length !== 10) {
      return { isValid: false, message: 'Phone number must be exactly 10 digits.' };
    }
    if (!/^[6-9]/.test(digits)) {
      return { isValid: false, message: 'Indian mobile number must start with 6, 7, 8, or 9.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid mobile number.' };
  }
}

export function validateCustomerPan(pan: string): FieldValidationResult {
  try {
    const upper = pan.trim().toUpperCase();
    if (!upper) {
      return { isValid: false, message: 'Permanent Account Number (PAN) is required.' };
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(upper)) {
      return { isValid: false, message: 'Enter a valid 10-character Indian PAN (e.g. ABCDE1234F).' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid PAN number.' };
  }
}

export function validateLoanAmount(amount: number | undefined): FieldValidationResult {
  try {
    if (amount === undefined || isNaN(amount) || amount <= 0) {
      return { isValid: false, message: 'Loan amount is required and must be greater than zero.' };
    }
    if (amount < 25_000) {
      return { isValid: false, message: 'Minimum loan amount is ₹25,000.' };
    }
    if (amount > 1_000_000_000) {
      return { isValid: false, message: 'Amount exceeds maximum facility limit (₹100 Cr).' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid amount value.' };
  }
}

export function validateAssessmentYear(year: string | undefined): FieldValidationResult {
  try {
    if (!year || !year.trim()) {
      return { isValid: false, message: 'Assessment year is required (e.g. 2025-26).' };
    }
    const ayRegex = /^(20\d{2})-(\d{2})$/;
    if (!ayRegex.test(year.trim())) {
      return { isValid: false, message: 'Assessment year must follow format YYYY-YY (e.g. 2025-26).' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid assessment year.' };
  }
}

export function validateAuditNote(note: string, minLength = 3): FieldValidationResult {
  try {
    const trimmed = note.trim();
    if (!trimmed) {
      return { isValid: false, message: 'A brief note or remark is required.' };
    }
    if (trimmed.length < minLength) {
      return { isValid: false, message: `Note must be at least ${minLength} characters.` };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid note content.' };
  }
}

export function validateNewApplicationForm(input: NewApplicationInput): Record<string, string> {
  const errors: Record<string, string> = {};

  try {
    const nameRes = validateCustomerName(input.customerName);
    if (!nameRes.isValid && nameRes.message) errors.customerName = nameRes.message;

    const emailRes = validateCustomerEmail(input.customerEmail);
    if (!emailRes.isValid && emailRes.message) errors.customerEmail = emailRes.message;

    const phoneRes = validateCustomerPhone(input.customerPhone);
    if (!phoneRes.isValid && phoneRes.message) errors.customerPhone = phoneRes.message;

    const panRes = validateCustomerPan(input.customerPan);
    if (!panRes.isValid && panRes.message) errors.customerPan = panRes.message;

    if (!input.state || !input.state.trim()) {
      errors.state = 'State of residence is required.';
    }

    if (input.vertical === 'TAX_CA') {
      const ayRes = validateAssessmentYear(input.assessmentYear);
      if (!ayRes.isValid && ayRes.message) errors.assessmentYear = ayRes.message;
    } else if (input.vertical === 'LOANS') {
      const amtRes = validateLoanAmount(input.requestedAmount);
      if (!amtRes.isValid && amtRes.message) errors.requestedAmount = amtRes.message;

      if (!input.targetLender || !input.targetLender.trim()) {
        errors.targetLender = 'Target lender preference is required.';
      }
    }
  } catch (err) {
    console.error('Form validation failed:', err);
  }

  return errors;
}
