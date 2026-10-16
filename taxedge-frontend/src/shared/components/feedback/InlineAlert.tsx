import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import './InlineAlert.css';

export type AlertTone = 'info' | 'warning' | 'error';

const TONE_ICONS: Readonly<Record<AlertTone, IconName>> = Object.freeze({
  info: 'shield-check',
  warning: 'clock',
  error: 'alert-circle'
});

export interface InlineAlertProps {
  readonly tone: AlertTone;
  readonly children: ReactNode;
}

/** Errors interrupt assistive technology immediately; info and warnings are announced politely. */
export function InlineAlert({ tone, children }: InlineAlertProps) {
  return (
    <div className={`tx-alert tx-alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={TONE_ICONS[tone]} className="tx-alert__icon" />
      <div className="tx-alert__message">{children}</div>
    </div>
  );
}
