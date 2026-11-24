import * as React from "react";
import { Input as SdkInput } from "@ui-sdk/react/input";

export interface InputProps extends Omit<React.ComponentProps<typeof SdkInput>, "className"> {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-ink">
          {label}
        </label>
      )}
      <SdkInput
        id={inputId}
        className={`h-10 w-full rounded-control border bg-surface px-3 text-base text-ink placeholder:text-base placeholder:text-ink-muted outline-none transition-colors hover:border-border-hover focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:bg-subtle-light disabled:text-ink-disabled ${
          error ? "border-danger" : "border-border-input"
        }`}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
