import type { SettingsSectionConfig } from '../../../shared/settings.types';
import { ipAllowListFormat } from '../../../validation/indianFormats';

/** Password, lockout and session policy applied by the server to every staff account. */
export const SECURITY_SETTINGS = Object.freeze<SettingsSectionConfig>({
  id: 'security',
  label: 'Security & Access',
  description: 'Password rules, sign-in lockout and session limits enforced for all staff accounts.',
  iconName: 'shield',
  fields: [
    {
      key: 'sessionIdleTimeoutMinutes',
      label: 'Sign out after inactivity',
      type: 'number',
      defaultValue: '30',
      required: true,
      min: 5,
      max: 240,
      unit: 'minutes',
      inputMode: 'numeric'
    },
    {
      key: 'passwordMinLength',
      label: 'Minimum password length',
      type: 'number',
      defaultValue: '10',
      required: true,
      min: 8,
      max: 64,
      unit: 'characters',
      inputMode: 'numeric'
    },
    {
      key: 'passwordExpiryDays',
      label: 'Password expiry',
      type: 'number',
      defaultValue: '90',
      required: true,
      min: 0,
      max: 365,
      unit: 'days',
      hint: 'Use 0 to never expire passwords.',
      inputMode: 'numeric'
    },
    {
      key: 'maxFailedAttempts',
      label: 'Failed sign-ins before lockout',
      type: 'number',
      defaultValue: '5',
      required: true,
      min: 3,
      max: 10,
      unit: 'attempts',
      inputMode: 'numeric'
    },
    {
      key: 'lockoutMinutes',
      label: 'Lockout duration',
      type: 'number',
      defaultValue: '15',
      required: true,
      min: 5,
      max: 1440,
      unit: 'minutes',
      inputMode: 'numeric'
    },
    {
      key: 'requireUppercase',
      label: 'Require an uppercase letter',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'requireNumber',
      label: 'Require a number',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'requireSymbol',
      label: 'Require a symbol',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'enforceTwoFactorForAdmins',
      label: 'Require two-factor sign-in for administrators',
      type: 'toggle',
      defaultValue: true,
      hint: 'Administrators confirm each sign-in with a one-time code.'
    },
    {
      key: 'allowedIpRanges',
      label: 'Allowed IP addresses (optional)',
      type: 'textarea',
      defaultValue: '',
      placeholder: 'One IPv4 address or CIDR range per line, e.g. 203.0.113.0/24',
      hint: 'Leave empty to allow sign-in from any network.',
      maxLength: 1000,
      format: ipAllowListFormat,
      fullWidth: true
    }
  ]
});
