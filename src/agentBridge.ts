import { createAgent, type AgentAction } from "@ui-sdk/react/agent";

export type ConfirmHandler = (
  step: AgentAction,
  signal: AbortSignal,
) => Promise<boolean> | boolean;

let confirmHandler: ConfirmHandler | null = null;

export function setConfirmHandler(handler: ConfirmHandler | null) {
  confirmHandler = handler;
}

/**
 * 在页面渲染前创建 Agent Bridge，以便从组件挂载起就监听所有 UI SDK 组件。
 */
export const agent = createAgent({
  allow: async (step, { signal }) => {
    if (!step.confirm) {
      return true;
    }
    if (confirmHandler) {
      return await confirmHandler(step, signal);
    }
    return false;
  },
});

if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { __UI_AGENT__?: typeof agent }).__UI_AGENT__ = agent;
}
