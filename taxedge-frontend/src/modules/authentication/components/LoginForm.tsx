import { Button, InlineAlert, TextField } from '@/shared';
import { CREDENTIAL_RULES } from '../shared/constants/authentication.constants';
import { LOGIN_FIELD_IDS, type LoginFormController } from '../hooks/useLoginForm';
import './LoginForm.css';

export interface LoginFormProps {
  readonly controller: LoginFormController;
}

/** Username and password only: accounts are provisioned by an administrator, so there is no sign-up or reset link. */
export function LoginForm({ controller }: LoginFormProps) {
  const { values, fieldErrors, formError, submitting, changeField, blurField, submit } = controller;

  return (
    <form className="tx-login-form" onSubmit={submit} noValidate aria-describedby={formError ? 'tx-login-error' : undefined}>
      {formError ? (
        <div id="tx-login-error">
          <InlineAlert tone="error">{formError}</InlineAlert>
        </div>
      ) : null}

      <TextField
        id={LOGIN_FIELD_IDS.username}
        name="username"
        label="Username"
        placeholder="Enter your username"
        iconName="user"
        value={values.username}
        onValueChange={(value) => changeField('username', value)}
        onBlur={() => blurField('username')}
        error={fieldErrors.username}
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={CREDENTIAL_RULES.username.maxLength}
        disabled={submitting}
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
        onValueChange={(value) => changeField('password', value)}
        onBlur={() => blurField('password')}
        error={fieldErrors.password}
        autoComplete="current-password"
        maxLength={CREDENTIAL_RULES.password.maxLength}
        disabled={submitting}
        revealable
        required
      />

      <Button type="submit" size="lg" fullWidth loading={submitting} loadingLabel="Signing in…">
        Sign In
      </Button>
    </form>
  );
}
