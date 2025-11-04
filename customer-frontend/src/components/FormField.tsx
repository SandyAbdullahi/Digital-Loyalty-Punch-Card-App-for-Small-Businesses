import { InputHTMLAttributes, ReactNode } from 'react';

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  helperText?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

const FormField = ({ id, label, error, helperText, className, ...inputProps }: FormFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-[var(--rudi-text)]">
      {label}
    </label>
    <input
      id={id}
      className={`w-full h-12 px-4 rounded-xl border border-[var(--rudi-input-border)] bg-[var(--rudi-input-bg)] text-[var(--rudi-text)] placeholder:text-[var(--rudi-text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--rudi-primary)] transition duration-[180ms] ${className ?? ''}`}
      aria-invalid={Boolean(error)}
      {...inputProps}
    />
    {helperText && !error && (
      <p className="text-xs text-[var(--rudi-text)]/70" role="note">
        {helperText}
      </p>
    )}
    {error && (
      <p className="text-xs text-[var(--rudi-accent)]" role="alert">
        {error}
      </p>
    )}
  </div>
);

export default FormField;
