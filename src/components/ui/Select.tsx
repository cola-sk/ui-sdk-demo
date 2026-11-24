import {
  Select as SdkSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  type SelectChangeOptions,
  type SelectValueChangeReason,
} from "@ui-sdk/react/select";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string> {
  value?: T;
  onValueChange?: (value: T | null, details: SelectChangeOptions<SelectValueChangeReason>) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  "aria-label"?: string;
  className?: string;
}

export function Select<T extends string = string>({
  value,
  onValueChange,
  options,
  placeholder = "请选择",
  label,
  "aria-label": ariaLabel,
  className = "",
}: SelectProps<T>) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-[13px] font-medium text-ink">{label}</span>}
      <SdkSelect<T>
        value={value}
        items={options}
        onValueChange={(next, details) => onValueChange?.(next as T | null, details)}
      >
        <SelectTrigger
          aria-label={ariaLabel ?? label}
          className="h-10 w-full rounded-control border border-border-input bg-surface px-3 text-base text-ink inline-flex items-center justify-between gap-2 cursor-pointer outline-none transition-colors hover:border-border-hover focus:border-brand focus:ring-2 focus:ring-brand/10"
        >
          <SelectValue placeholder={placeholder} className="truncate text-left" />
          <span className="text-xs text-ink-muted">▾</span>
        </SelectTrigger>
        <SelectContent
          sideOffset={6}
          className="z-50 min-w-[180px] rounded-card border border-border bg-surface p-1.5 shadow-dialog outline-none"
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="flex items-center justify-between gap-2 rounded-sub px-2.5 py-2 text-sm text-ink cursor-pointer outline-none data-[highlighted=true]:bg-page data-[selected=true]:text-accent data-[selected=true]:font-medium data-[disabled=true]:opacity-45"
            >
              <SelectItemText>{opt.label}</SelectItemText>
              <SelectItemIndicator className="text-xs text-accent">✓</SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </SdkSelect>
    </div>
  );
}
