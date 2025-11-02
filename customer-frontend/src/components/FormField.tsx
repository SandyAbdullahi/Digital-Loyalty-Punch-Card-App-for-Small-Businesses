import { InputHTMLAttributes, ReactNode } from 'react';

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  helperText?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

const FormField = ({ id, label, error, helperText, className, ...inputProps }: FormFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-rudi-maroon">
      {label}
    </label>
    <input
      id={id}
      className={`w-full h-12 px-4 rounded-xl border border-[#EADCC7] bg-[#FFF9F0] text-rudi-maroon placeholder:text-rudi-maroon/50 focus:outline-none focus:ring-2 focus:ring-rudi-teal transition duration-[180ms] ${className ?? ''}`}
      aria-invalid={Boolean(error)}
      {...inputProps}
    />
    {helperText && !error && (
      <p className="text-xs text-rudi-maroon/70" role="note">
        {helperText}
      </p>
    )}
    {error && (
      <p className="text-xs text-rudi-coral" role="alert">
        {error}
      </p>
    )}
  </div>
);

export default FormField;
