import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "../App";
import { agent } from "../agentBridge";

// 告知 React 19 当前处于 act 测试环境，并为 jsdom 补齐 Web Animations API
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
if (typeof Element !== "undefined" && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}

let container: HTMLDivElement;
let root: Root;

async function renderApp(search = "") {
  window.history.replaceState({}, "", `/${search}`);
  await act(async () => {
    root.render(<App />);
  });
}

function findButtonByText(text: string): HTMLButtonElement | undefined {
  return Array.from(document.querySelectorAll("button")).find((btn) =>
    btn.textContent?.includes(text),
  );
}

describe("UI SDK Workbench — AI 自测与 E2E 验收套件", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("1. agent.snapshot() 能结构化读取工作台核心组件与可用动作", async () => {
    await renderApp();

    const snap = agent.snapshot();
    const labels = snap.map((item) => item.label);

    expect(labels).toContain("New task");
    expect(labels).toContain("Add Task");
    expect(labels).toContain("Filter tasks");
    expect(labels).toContain("Clear completed");

    const filterComp = snap.find((item) => item.label === "Filter tasks");
    expect(filterComp?.value).toBe("all");
    expect(filterComp?.actions).toContain("setValue");
  });

  it("2. agent.act() 可通过两步连招创建新任务并追踪 source='agent'", async () => {
    await renderApp();

    const sources: string[] = [];
    const unsubscribe = agent.subscribe((ev) => {
      sources.push(ev.source);
    });

    const taskTitle = "E2E 自动验收任务";
    let res: Awaited<ReturnType<typeof agent.act>>;
    await act(async () => {
      res = await agent.act({
        steps: [
          { ref: "New task", action: "setValue", args: [taskTitle] },
          { ref: "Add Task", action: "press" },
        ],
      });
    });

    unsubscribe();

    expect(res!.ok).toBe(true);
    expect(sources).toContain("agent");

    const snap = agent.snapshot();
    const createdCheckbox = snap.find(
      (item) => item.component === "checkbox" && item.label === taskTitle,
    );
    expect(createdCheckbox).toBeDefined();
    expect(createdCheckbox?.checked).toBe(false);
  });

  it("3. agent.act() 可切换分段筛选器并直接勾选任务完成", async () => {
    await renderApp();

    let res: Awaited<ReturnType<typeof agent.act>>;
    await act(async () => {
      res = await agent.act({
        steps: [
          { ref: "Filter tasks", action: "setValue", args: ["active"] },
          { ref: "封装 10 个高频后台 UI 组件", action: "setChecked", args: [true] },
        ],
      });
    });

    expect(res!.ok).toBe(true);
    const snap = agent.snapshot();
    const filterComp = snap.find((item) => item.label === "Filter tasks");
    expect(filterComp?.value).toBe("active");
  });

  it("4. data-agent-confirm 安全拦截：拒绝时保留数据，批准后才执行清空", async () => {
    await renderApp();

    // 4a. AI 触发 Clear completed，应弹出确认 Dialog 并等待用户决定
    let clearPromise!: ReturnType<typeof agent.act>;
    await act(async () => {
      clearPromise = agent.act({
        steps: [{ ref: "Clear completed", action: "press" }],
      });
    });

    const denyBtn = findButtonByText("拒绝执行");
    expect(denyBtn).toBeDefined();

    await act(async () => {
      denyBtn!.click();
    });

    const deniedRes = await clearPromise;
    expect(deniedRes.ok).toBe(false);
    // 已完成任务应当仍在列表中
    expect(
      agent.snapshot().some((c) => c.label === "接入 Ninebot Workbench Design Tokens"),
    ).toBe(true);

    // 4b. 再次触发并点击允许
    await act(async () => {
      clearPromise = agent.act({
        steps: [{ ref: "Clear completed", action: "press" }],
      });
    });

    const approveBtn = findButtonByText("允许 AI 执行");
    expect(approveBtn).toBeDefined();

    await act(async () => {
      approveBtn!.click();
      await clearPromise;
    });

    const approvedRes = await clearPromise;
    expect(approvedRes.ok).toBe(true);
    expect(
      agent.snapshot().some(
        (c) => c.label === "接入 Ninebot Workbench Design Tokens" && !c.offPage,
      ),
    ).toBe(false);
  });

  it("5. data-agent-secret 隐私保护：agent.query() 只能读到 [redacted]", async () => {
    await renderApp();

    const found = await agent.query({ text: "Private token" });
    expect(Array.isArray(found)).toBe(true);
    if (Array.isArray(found)) {
      expect(found.length).toBeGreaterThan(0);
      expect(found[0].value).toBe("[redacted]");
    }
  });

  it("6. 自定义原语 TagPicker：键盘左右方向键可漫游焦点且禁用项不可被选中", async () => {
    await renderApp("?view=gallery");

    const iotBtn = findButtonByText("IoT 网关");
    const bleBtn = findButtonByText("蓝牙通信");
    const otaBtn = findButtonByText("OTA 升级（禁用）");
    const aiBtn = findButtonByText("AI 语音");

    expect(iotBtn).toBeDefined();
    expect(bleBtn).toBeDefined();
    expect(otaBtn).toBeDefined();
    expect(aiBtn).toBeDefined();

    // 聚焦到第一个标签并按 ArrowRight -> 移动到 蓝牙通信
    await act(async () => {
      iotBtn!.focus();
      iotBtn!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(document.activeElement).toBe(bleBtn);

    // 再按 ArrowRight -> 移动到 OTA 升级（WAI-ARIA 允许禁用项聚焦以便读屏播报）
    await act(async () => {
      bleBtn!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(document.activeElement).toBe(otaBtn);

    // 点击禁用项不可被选中
    await act(async () => {
      otaBtn!.click();
    });
    expect(otaBtn!.getAttribute("aria-pressed")).toBe("false");

    // 再按 ArrowRight -> 移动到 AI 语音
    await act(async () => {
      otaBtn!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(document.activeElement).toBe(aiBtn);
  });
});
