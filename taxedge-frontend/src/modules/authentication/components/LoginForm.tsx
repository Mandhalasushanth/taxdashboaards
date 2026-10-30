import { useState, type FormEvent } from 'react';
import { Button, InlineAlert, TextField } from '@/shared';
import { authStore } from '@/store';
import { CREDENTIAL_RULES } from '../shared/constants/authentication.constants';
import { LOGIN_FIELD_IDS, type LoginFormController } from '../hooks/useLoginForm';
import { tierForLoginEmail } from '../shared/config/loginAccountTypes';
import type { Role } from '../shared/types/role.types';
import type { SessionUser } from '../shared/types/session.types';
import './LoginForm.css';
import './ForgotPasswordFlow.css';

export interface LoginFormProps {
  readonly controller: LoginFormController;
  /** Opens the reset steps; the link shows only once an admin email is typed. */
  readonly onForgotPassword?: () => void;
}

/** Username and password sign-in form with direct fetch to LoginController (/api/v1/auth/login). */
export function LoginForm({ controller, onForgotPassword }: LoginFormProps) {
  const {
    values,
    fieldErrors,
    formError: controllerError,
    submitting: controllerSubmitting,
    changeField,
    blurField,
    submit
  } = controller;

  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isSubmitting = controllerSubmitting || localLoading;
  const activeError = localError || controllerError;
  const showForgotPassword = Boolean(onForgotPassword) && tierForLoginEmail(values.username) === 'ADMINISTRATOR';

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!values.username.trim() || !values.password) {
      await submit(event);
      return;
    }

    setLocalLoading(true);
    setLocalError(null);

    try {
      // Direct fetch call to LoginController @RequestMapping("/api/v1/auth"), shared by every role
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          username: values.username.trim(),
          email: values.username.trim(),
          password: values.password
        })
      });

      if (!response.ok) {
        let message = 'Invalid username or password';
        try {
          const err = await response.json();
          if (err?.message) {
            message = err.message;
          }
        } catch {
          // fallback error
        }
        throw new Error(message);
      }

      const data = await response.json();
      const username = (data.username || data.email || values.username.trim()) as string;
      const user: SessionUser = Object.freeze({
        id: (data.id ?? 1) as number | string,
        username,
        displayName: (data.fullName || username) as string,
        role: ((data.role as Role) || 'ADMIN') as Role,
        permissions: Object.freeze(['ADMIN_DASHBOARD_VIEW', 'STAFF_DASHBOARD_VIEW', '*']),
        lastLoginAt: (data.updatedAt || new Date().toISOString()) as string
      });

      try {
        sessionStorage.setItem('taxedge.auth.session', JSON.stringify(user));
      } catch {
        // ignore
      }

      authStore.setAuthenticated(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to fetch') {
        try {
          await submit(event);
        } catch (submitErr) {
          setLocalError(submitErr instanceof Error ? submitErr.message : 'Sign-in failed');
        }
      } else {
        setLocalError(error instanceof Error ? error.message : 'Invalid credentials');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form className="tx-login-form" onSubmit={handleSignIn} noValidate aria-describedby={activeError ? 'tx-login-error' : undefined}>
      {activeError ? (
        <div id="tx-login-error">
          <InlineAlert tone="error" surface="dark">{activeError}</InlineAlert>
        </div>
      ) : null}

      <TextField
        id={LOGIN_FIELD_IDS.username}
        name="username"
        label="Username"
        placeholder="Enter your username"
        iconName="user"
        value={values.username}
        onValueChange={(value) => {
          setLocalError(null);
          changeField('username', value);
        }}
        onBlur={() => blurField('username')}
        error={fieldErrors.username}
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={CREDENTIAL_RULES.username.maxLength}
        disabled={isSubmitting}
        required
      />

      <TextField
        id={LOGIN_FIELD_IDS.password}
        name="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        iconName="lock"
        value={values.password}
        onValueChange={(value) => {
          setLocalError(null);
          changeField('password', value);
        }}
        onBlur={() => blurField('password')}
        error={fieldErrors.password}
        autoComplete="current-password"
        maxLength={CREDENTIAL_RULES.password.maxLength}
        disabled={isSubmitting}
        revealable
        required
      />

      {showForgotPassword ? (
        <button type="button" className="tx-forgot-link" onClick={onForgotPassword} disabled={isSubmitting}>
          Forgot password?
        </button>
      ) : null}

      <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingLabel="Signing in…">
        Sign In
      </Button>
    </form>
  );
}