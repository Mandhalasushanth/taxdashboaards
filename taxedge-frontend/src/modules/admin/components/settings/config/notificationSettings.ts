import type { SettingsSectionConfig } from '../../../shared/settings.types';

/** Which events alert staff and customers, and through which channels. */
export const NOTIFICATION_SETTINGS = Object.freeze<SettingsSectionConfig>({
  id: 'notifications',
  label: 'Notifications',
  description: 'Which events send alerts, through which channels, and when reminders go out.',
  iconName: 'bell',
  fields: [
    {
      key: 'emailNewApplication',
      label: 'Email on new application',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'emailDocumentUploaded',
      label: 'Email when a client uploads documents',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'emailPaymentReceived',
      label: 'Email on payment received',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'emailSlaBreach',
      label: 'Email managers on SLA breach',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'smsAlerts',
      label: 'SMS alerts to clients',
      type: 'toggle',
      defaultValue: false,
      hint: 'Requires a DLT-registered sender ID.'
    },
    {
      key: 'whatsappAlerts',
      label: 'WhatsApp alerts to clients',
      type: 'toggle',
      defaultValue: false,
      hint: 'Requires an approved WhatsApp Business template.'
    },
    {
      key: 'complianceReminderDays',
      label: 'Remind clients before due dates',
      type: 'number',
      defaultValue: '7',
      required: true,
      min: 1,
      max: 30,
      unit: 'days before',
      inputMode: 'numeric'
    },
    {
      key: 'dailyDigestEnabled',
      label: 'Send a daily summary to managers',
      type: 'toggle',
      defaultValue: true
    },
    {
      key: 'dailyDigestTime',
      label: 'Daily summary time',
      type: 'time',
      defaultValue: '09:00',
      hint: 'Required when the daily summary is on.'
    }
  ]
});
