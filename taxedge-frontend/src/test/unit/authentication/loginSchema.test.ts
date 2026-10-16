import { describe, expect, it } from 'vitest';
import {
  hasFieldErrors,
  normalizeCredentials,
  validateLoginField,
  validateLoginForm
} from '@/modules/authentication/validation/loginSchema';

describe('loginSchema', () => {
  it('requires both fields', () => {
    const errors = validateLoginForm({ username: '', password: '' });
    expect(errors.username).toBe('Username is required.');
    expect(errors.password).toBe('Password is required.');
    expect(hasFieldErrors(errors)).toBe(true);
  });

  it('rejects whitespace-only and malformed usernames', () => {
    expect(validateLoginField('username', '   ')).toBe('Username is required.');
    expect(validateLoginField('username', 'ab')).toMatch(/at least 3/);
    expect(validateLoginField('username', 'bad name')).toMatch(/may only contain/);
    expect(validateLoginField('username', '.leadingdot')).toMatch(/may only contain/);
  });

  it('accepts provisioned username formats', () => {
    expect(validateLoginField('username', 'ca.manager.demo')).toBeNull();
    expect(validateLoginField('username', 'priya@taxedge.in')).toBeNull();
    expect(validateLoginField('username', '  admin.demo  ')).toBeNull();
  });

  it('enforces password length without trimming', () => {
    expect(validateLoginField('password', 'short')).toMatch(/at least 8/);
    expect(validateLoginField('password', 'x'.repeat(129))).toMatch(/at most 128/);
    expect(validateLoginField('password', ' spaced pass ')).toBeNull();
  });

  it('normalizes the username but sends the password as typed', () => {
    expect(normalizeCredentials({ username: '  Admin.Demo ', password: ' Secret#1 ' })).toEqual({
      username: 'admin.demo',
      password: ' Secret#1 '
    });
  });
});
