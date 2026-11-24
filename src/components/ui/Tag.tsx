import * as React from "react";

export type TagTone = "neutral" | "primary" | "success" | "warning" | "danger";

export interface TagProps {
  tone?: TagTone;
  children: React.ReactNode;
  className?: string;
}

const TONE_CLASS: Record<TagTone, string> = {
  neutral: "bg-subtle border-border text-ink",
  primary: "bg-accent-soft border-accent-border text-accent-deep",
  success: "bg-success-bg border-success-border text-success-text",
  warning: "bg-warning-bg border-warning-border text-warning",
  danger: "bg-danger-bg border-danger-border text-danger",
};

export function Tag({ tone = "neutral", children, className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-control border text-xs font-semibold leading-none whitespace-nowrap ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
