import * as React from "react";
import { Button as SdkButton, type ButtonActionDetails } from "@ui-sdk/react/button";

export type ButtonVariant = "primary" | "secondary" | "outline" | "text" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps
  extends Omit<React.ComponentProps<typeof SdkButton>, "className" | "onClick"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>, details: ButtonActionDetails) => unknown;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover border-transparent shadow-control",
  secondary:
    "bg-subtle text-ink hover:bg-subtle-hover border-border",
  outline:
    "bg-surface text-ink hover:bg-subtle border-border-input shadow-control",
  text:
    "bg-transparent text-accent hover:bg-accent-soft border-transparent",
  danger:
    "bg-transparent text-danger hover:bg-danger-bg border-transparent",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] rounded-control",
  md: "h-10 px-4 text-sm rounded-control",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <SdkButton
      className={`inline-flex items-center justify-center gap-2 font-medium border transition-colors cursor-pointer select-none disabled:opacity-45 disabled:cursor-not-allowed data-[disabled=true]:opacity-45 data-[disabled=true]:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      {...props}
    />
  );
}
