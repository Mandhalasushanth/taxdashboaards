import type { ReactNode } from 'react';
import './FormControls.css';

interface FieldFrameProps {
  readonly id: string;
  readonly label: string;
  readonly error?: string | null;
  readonly children: ReactNode;
}

/** Label + control + error message, wired together for assistive technology. */
function FieldFrame({ id, label, error, children }: FieldFrameProps) {
  return (
    <div className={`tx-form-field ${error ? 'tx-form-field--invalid' : ''}`}>
      <label className="tx-form-field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="tx-form-field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string | null) => (error ? `${id}-error` : undefined);

export interface InputFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly type?: 'text' | 'number' | 'email' | 'date' | 'password';
  readonly autoComplete?: string;
  readonly error?: string | null;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
}

export function InputField({ id, label, value, onChange, type = 'text', error, min, max, step, autoComplete }: InputFieldProps) {
  return (
    <FieldFrame id={id} label={label} error={error}>
      <input
        id={id}
        className="tx-form-field__control"
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error)}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldFrame>
  );
}

export interface SelectFieldProps<T extends string> {
  readonly id: string;
  readonly label: string;
  readonly value: T | '';
  readonly onChange: (value: T) => void;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly placeholder?: string;
  readonly error?: string | null;
}

export function SelectField<T extends string>({ id, label, value, onChange, options, placeholder, error }: SelectFieldProps<T>) {
  return (
    <FieldFrame id={id} label={label} error={error}>
      <select
        id={id}
        className="tx-form-field__control"
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error)}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

export interface TextAreaFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly rows?: number;
  readonly maxLength?: number;
  readonly error?: string | null;
}

export function TextAreaField({ id, label, value, onChange, rows = 3, maxLength, error }: TextAreaFieldProps) {
  return (
    <FieldFrame id={id} label={label} error={error}>
      <textarea
        id={id}
        className="tx-form-field__control tx-form-field__control--textarea"
        value={value}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {maxLength ? (
        <span className="tx-form-field__count">
          {value.length}/{maxLength}
        </span>
      ) : null}
    </FieldFrame>
  );
}
