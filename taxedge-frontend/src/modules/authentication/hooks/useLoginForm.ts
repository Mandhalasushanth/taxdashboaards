import { useCallback, useState, type FormEvent } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import { authStore } from '@/store';
import { hasFieldErrors, validateLoginField, validateLoginForm } from '../validation/loginSchema';
import { signIn } from '../services/authenticationService';
import type { LoginCredentials, LoginField, LoginFieldErrors } from '../shared/types/authentication.types';

export const LOGIN_FIELD_IDS: Readonly<Record<LoginField, string>> = Object.freeze({
  username: 'tx-login-username',
  password: 'tx-login-password'
});

const EMPTY_CREDENTIALS: LoginCredentials = Object.freeze({ username: '', password: '' });
const LOGIN_FIELDS: readonly LoginField[] = Object.freeze(['username', 'password']);

export interface LoginFormController {
  readonly values: LoginCredentials;
  readonly fieldErrors: LoginFieldErrors;
  readonly formError: string | null;
  readonly submitting: boolean;
  readonly changeField: (field: LoginField, value: string) => void;
  readonly blurField: (field: LoginField) => void;
  readonly submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

function toFormErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  logger.error('Unexpected sign-in failure.', error);
  return defaultMessageFor('UNKNOWN');
}

function focusFirstInvalidField(errors: LoginFieldErrors): void {
  const firstInvalid = LOGIN_FIELDS.find((field) => errors[field]);
  if (firstInvalid) {
    document.getElementById(LOGIN_FIELD_IDS[firstInvalid])?.focus();
  }
}

/** State, validation and submission for the shared sign-in form. Navigation is handled by the page. */
export function useLoginForm(): LoginFormController {
  const [values, setValues] = useState<LoginCredentials>(EMPTY_CREDENTIALS);
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const changeField = useCallback(
    (field: LoginField, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      setFormError(null);
      if (touched[field]) {
        setFieldErrors((current) => ({ ...current, [field]: validateLoginField(field, value) ?? undefined }));
      }
    },
    [touched]
  );

  const blurField = useCallback(
    (field: LoginField) => {
      setTouched((current) => ({ ...current, [field]: true }));
      setFieldErrors((current) => ({ ...current, [field]: validateLoginField(field, values[field]) ?? undefined }));
    },
    [values]
  );

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) {
        return;
      }
      const errors = validateLoginForm(values);
      setTouched({ username: true, password: true });
      setFieldErrors(errors);
      if (hasFieldErrors(errors)) {
        focusFirstInvalidField(errors);
        return;
      }

      setSubmitting(true);
      setFormError(null);
      authStore.clearEndReason();
      try {
        await signIn(values);
      } catch (error) {
        setFormError(toFormErrorMessage(error));
        if (isApiError(error) && error.code === 'INVALID_CREDENTIALS') {
          setValues((current) => ({ ...current, password: '' }));
          document.getElementById(LOGIN_FIELD_IDS.password)?.focus();
        }
        setSubmitting(false);
      }
    },
    [submitting, values]
  );

  return { values, fieldErrors, formError, submitting, changeField, blurField, submit };
}
