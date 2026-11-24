import * as React from "react";

export type SpaceScale = "xs" | "sm" | "md" | "lg";

const GAP_CLASS: Record<SpaceScale, string> = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

export interface StackProps {
  gap?: SpaceScale;
  children: React.ReactNode;
  className?: string;
}

export function Stack({ gap = "md", children, className = "" }: StackProps) {
  return <div className={`flex flex-col ${GAP_CLASS[gap]} ${className}`}>{children}</div>;
}

export interface InlineProps {
  gap?: SpaceScale;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "between" | "end";
  wrap?: boolean;
  children: React.ReactNode;
  className?: string;
}

const ALIGN_CLASS = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const JUSTIFY_CLASS = {
  start: "justify-start",
  between: "justify-between",
  end: "justify-end",
};

export function Inline({
  gap = "sm",
  align = "center",
  justify = "start",
  wrap = false,
  children,
  className = "",
}: InlineProps) {
  return (
    <div
      className={`flex ${GAP_CLASS[gap]} ${ALIGN_CLASS[align]} ${JUSTIFY_CLASS[justify]} ${
        wrap ? "flex-wrap" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export interface NavItem {
  id: string;
  label: string;
  badge?: string;
}

export interface AppShellProps {
  brandTitle: string;
  orgName?: string;
  userName?: string;
  navItems: NavItem[];
  activeNavId: string;
  onNavChange?: (id: string) => void;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  brandTitle,
  orgName = "九号开发者平台",
  userName = "Developer",
  navItems,
  activeNavId,
  onNavChange,
  headerRight,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      {/* 56px Top Navbar */}
      <header className="h-14 bg-surface border-b border-border px-8 flex items-center justify-between shrink-0">
        <Inline gap="md">
          <div className="size-7 rounded-control bg-brand text-white text-xs font-bold flex items-center justify-center">
            9B
          </div>
          <span className="text-[15px] font-semibold text-ink">{brandTitle}</span>
          <span className="text-border">|</span>
          <span className="text-[13px] text-ink-secondary">{orgName}</span>
        </Inline>
        <Inline gap="md">
          {headerRight}
          <div className="size-8 rounded-full bg-accent-soft text-accent-deep text-xs font-semibold flex items-center justify-center border border-accent-border">
            {userName.slice(0, 2).toUpperCase()}
          </div>
        </Inline>
      </header>

      {/* Body: 232px Sidebar + Main Canvas */}
      <div className="flex-1 flex gap-4 px-4 pt-3.5 pb-4 max-w-[1600px] w-full mx-auto">
        <aside className="hidden md:flex w-[216px] shrink-0 flex-col bg-surface rounded-card border border-border p-3 h-fit">
          <div className="px-2.5 py-1.5 text-xs font-medium text-ink-muted">
            工作台导航
          </div>
          <nav className="flex flex-col gap-1 mt-1">
            {navItems.map((item) => {
              const active = item.id === activeNavId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavChange?.(item.id)}
                  className={`h-9 px-3 rounded-control text-left text-sm font-medium flex items-center justify-between border-0 cursor-pointer transition-colors ${
                    active
                      ? "bg-page text-accent"
                      : "bg-transparent text-ink-regular hover:bg-page/60"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent-soft text-accent-deep">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 bg-surface rounded-card border border-border p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
