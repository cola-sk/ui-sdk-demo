import * as React from "react";

export interface CardProps {
  padding?: "none" | "sm" | "md";
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}

const PADDING_CLASS = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
};

export function Card({
  padding = "md",
  interactive = false,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-card shadow-card ${PADDING_CLASS[padding]} ${
        interactive ? "transition-colors hover:border-accent-border cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
