import type { SettingsSectionConfig } from '../../../shared/settings.types';

const MONTH_OPTIONS = Object.freeze(
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
    (month, index) => ({ value: String(index + 1), label: month })
  )
);

/** Locale, currency and accounting-year conventions applied across the platform. */
export const REGIONAL_SETTINGS = Object.freeze<SettingsSectionConfig>({
  id: 'regional',
  label: 'Regional & Format',
  description: 'Time zone, currency, date format and financial year used in reports and reminders.',
  iconName: 'globe',
  fields: [
    {
      key: 'timeZone',
      label: 'Time zone',
      type: 'select',
      defaultValue: 'Asia/Kolkata',
      required: true,
      options: [
        { value: 'Asia/Kolkata', label: 'India Standard Time (UTC+05:30)' },
        { value: 'Asia/Dubai', label: 'Gulf Standard Time (UTC+04:00)' },
        { value: 'Asia/Singapore', label: 'Singapore Time (UTC+08:00)' },
        { value: 'Europe/London', label: 'United Kingdom (GMT/BST)' },
        { value: 'America/New_York', label: 'US Eastern Time (ET)' }
      ]
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'select',
      defaultValue: 'INR',
      required: true,
      options: [
        { value: 'INR', label: 'Indian Rupee (₹ INR)' },
        { value: 'USD', label: 'US Dollar ($ USD)' },
        { value: 'AED', label: 'UAE Dirham (AED)' }
      ]
    },
    {
      key: 'numberFormat',
      label: 'Number grouping',
      type: 'select',
      defaultValue: 'en-IN',
      required: true,
      options: [
        { value: 'en-IN', label: 'Indian (12,34,567.00)' },
        { value: 'en-US', label: 'International (1,234,567.00)' }
      ]
    },
    {
      key: 'dateFormat',
      label: 'Date format',
      type: 'select',
      defaultValue: 'DD/MM/YYYY',
      required: true,
      options: [
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/03/2026)' },
        { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (31-Mar-2026)' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-03-31)' }
      ]
    },
    {
      key: 'financialYearStartMonth',
      label: 'Financial year starts in',
      type: 'select',
      defaultValue: '4',
      required: true,
      hint: 'Indian financial year runs April to March.',
      options: MONTH_OPTIONS
    },
    {
      key: 'language',
      label: 'Default language',
      type: 'select',
      defaultValue: 'en',
      required: true,
      options: [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'हिन्दी (Hindi)' }
      ]
    }
  ]
});
