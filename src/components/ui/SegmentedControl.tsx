import * as React from "react";
import {
  SegmentedControl as SdkSegmentedControl,
  SegmentedControlItem as SdkSegmentedControlItem,
  SegmentedControlIndicator,
  type SegmentedControlChangeOptions,
} from "@ui-sdk/react/segmented-control";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  value: T;
  onValueChange: (value: T, details: SegmentedControlChangeOptions) => void;
  options: SegmentedOption<T>[];
  "aria-label"?: string;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  value,
  onValueChange,
  options,
  "aria-label": ariaLabel,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <SdkSegmentedControl
      aria-label={ariaLabel}
      value={value}
      onValueChange={(next, details) => onValueChange(next as T, details)}
      className={`relative inline-flex items-center rounded-control border border-border bg-surface p-1 gap-1 ${className}`}
    >
      <SegmentedControlIndicator
        className="pointer-events-none absolute top-[var(--segmented-control-indicator-top,4px)] left-[var(--segmented-control-indicator-left,4px)] h-[var(--segmented-control-indicator-height,calc(100%-8px))] w-[var(--segmented-control-indicator-width,0px)] rounded-[6px] bg-page transition-all duration-150"
      />
      {options.map((opt) => (
        <SdkSegmentedControlItem
          key={opt.value}
          value={opt.value}
          disabled={opt.disabled}
          className="relative z-10 h-8 px-3.5 rounded-[6px] text-sm font-medium text-ink-muted transition-colors cursor-pointer select-none data-[checked=true]:text-ink aria-checked:text-ink disabled:opacity-45 disabled:cursor-not-allowed"
        >
          {opt.label}
        </SdkSegmentedControlItem>
      ))}
    </SdkSegmentedControl>
  );
}
