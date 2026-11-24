import * as React from "react";
import {
  Checkbox as SdkCheckbox,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox";

export interface CheckboxProps
  extends Omit<React.ComponentProps<typeof SdkCheckbox>, "className" | "children"> {
  label?: React.ReactNode;
  className?: string;
}

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <SdkCheckbox
        className="size-[18px] shrink-0 rounded-[5px] border border-border-input bg-surface inline-flex items-center justify-center transition-colors data-[checked=true]:bg-brand data-[checked=true]:border-brand data-[checked=true]:text-white aria-checked:bg-brand aria-checked:border-brand aria-checked:text-white focus-visible:outline-2 focus-visible:outline-accent"
        {...props}
      >
        <CheckboxIndicator className="text-[11px] font-bold leading-none">
          ✓
        </CheckboxIndicator>
      </SdkCheckbox>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}
