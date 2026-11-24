import * as React from "react";
import {
  Dialog as SdkDialog,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  type DialogOpenChangeDetails,
} from "@ui-sdk/react/dialog";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean, details: DialogOpenChangeDetails) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className = "",
}: DialogProps) {
  return (
    <SdkDialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
      <DialogContent
        className={`fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-surface p-6 shadow-dialog outline-none ${className}`}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <DialogTitle className="m-0 text-lg font-medium text-ink">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="mt-1 mb-0 text-[13px] text-ink-muted">
                {description}
              </DialogDescription>
            )}
          </div>
          <DialogClose className="h-7 w-7 rounded-sub text-ink-muted hover:bg-page hover:text-ink inline-flex items-center justify-center cursor-pointer border-0 bg-transparent">
            ✕
          </DialogClose>
        </div>

        <div className="my-4">{children}</div>

        {footer && (
          <div className="mt-5 pt-4 border-t border-border-light flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </DialogContent>
    </SdkDialog>
  );
}
