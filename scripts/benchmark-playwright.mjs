import { spawn } from "node:child_process";
import net from "node:net";
import { performance } from "node:perf_hooks";
import { chromium } from "playwright-core";

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 4179;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

function startVite(port) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "pnpm",
      ["exec", "vite", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let stderrBuf = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Vite dev server startup timed out: ${stderrBuf}`));
    }, 15000);

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes("Local:") || text.includes(String(port))) {
        clearTimeout(timer);
        resolve(child);
      }
    });

    child.stderr.on("data", (chunk) => {
      stderrBuf += chunk.toString();
    });

    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        clearTimeout(timer);
        reject(new Error(`Vite exited with code ${code}: ${stderrBuf}`));
      }
    });
  });
}

async function runTraditionalFlow(page) {
  const start = performance.now();

  // 1. 打开弹窗新建一个高优任务
  await page.getByRole("button", { name: "弹窗新建任务" }).click();
  await page.getByLabel("任务名称").fill("传统操作-弹窗高优任务");
  await page.getByLabel("优先级").click();
  await page.getByRole("option", { name: "高优" }).click();
  await page.getByRole("button", { name: "确认创建" }).click();

  // 2. 在主表单连续添加 3 条不同优先级任务
  const batch = [
    ["传统操作-联调网关", "高优"],
    ["传统操作-配置Token", "常规"],
    ["传统操作-整理文档", "低优"],
  ];
  for (const [title, priority] of batch) {
    await page.getByLabel("New task").fill(title);
    await page.getByLabel("Task priority").click();
    await page.getByRole("option", { name: priority }).click();
    await page.getByRole("button", { name: "Add Task" }).click();
  }

  // 3. 来回切换分段筛选器
  await page.getByRole("radio", { name: /进行中/ }).click();
  await page.getByRole("radio", { name: /已完成/ }).click();
  await page.getByRole("radio", { name: /全部/ }).click();

  // 4. 勾选 2 条任务为完成
  await page.getByRole("checkbox", { name: "传统操作-联调网关" }).click();
  await page.getByRole("checkbox", { name: "传统操作-配置Token" }).click();

  // 5. 切到组件规范预览，操作 TagPicker 后切回工作台
  await page.getByRole("button", { name: /组件规范预览/ }).click();
  await page.getByRole("button", { name: "蓝牙通信" }).click();
  await page.getByRole("button", { name: "AI 语音" }).click();
  await page.getByRole("button", { name: /工作台概览/ }).click();

  // 6. 清空已完成任务
  await page.getByRole("button", { name: "Clear completed" }).click();

  return performance.now() - start;
}

async function runAgentFlow(page) {
  const start = performance.now();

  // 1. Agent 读取一次结构化快照
  const snap = await page.evaluate(() => window.__UI_AGENT__?.snapshot() ?? []);

  // 2. Agent 批量连续添加 4 条任务（无需点开下拉框弹窗）
  await page.evaluate(async () => {
    const a = window.__UI_AGENT__;
    if (!a) return;
    await a.act({
      steps: [
        { ref: "New task", action: "setValue", args: ["Agent-弹窗高优任务"] },
        { ref: "Task priority", action: "setValue", args: ["high"] },
        { ref: "Add Task", action: "press" },

        { ref: "New task", action: "setValue", args: ["Agent-联调网关"] },
        { ref: "Task priority", action: "setValue", args: ["high"] },
        { ref: "Add Task", action: "press" },

        { ref: "New task", action: "setValue", args: ["Agent-配置Token"] },
        { ref: "Task priority", action: "setValue", args: ["medium"] },
        { ref: "Add Task", action: "press" },

        { ref: "New task", action: "setValue", args: ["Agent-整理文档"] },
        { ref: "Task priority", action: "setValue", args: ["low"] },
        { ref: "Add Task", action: "press" },
      ],
    });
  });

  // 3. Agent 切换筛选器 + 勾选 2 条任务完成
  await page.evaluate(async () => {
    const a = window.__UI_AGENT__;
    if (!a) return;
    await a.act({
      steps: [
        { ref: "Filter tasks", action: "setValue", args: ["active"] },
        { ref: "Filter tasks", action: "setValue", args: ["completed"] },
        { ref: "Filter tasks", action: "setValue", args: ["all"] },
        { ref: "Agent-联调网关", action: "setChecked", args: [true] },
        { ref: "Agent-配置Token", action: "setChecked", args: [true] },
      ],
    });
  });

  // 4. 切到组件规范预览，通过 Agent 直接设置自定义原语 TagPicker 的选中值
  await page.getByRole("button", { name: /组件规范预览/ }).click();
  await page.evaluate(async () => {
    await window.__UI_AGENT__?.act({
      steps: [
        { ref: "Capabilities", action: "setValue", args: [["iot", "ble", "ai"]] },
      ],
    });
  });
  await page.getByRole("button", { name: /工作台概览/ }).click();

  // 5. Agent 触发清空已完成（自动弹出 Human-in-the-Loop 确认弹窗，人工点允许）
  const clearPromise = page.evaluate(() =>
    window.__UI_AGENT__?.act({
      steps: [{ ref: "Clear completed", action: "press" }],
    }),
  );
  await page.getByRole("button", { name: "允许 AI 执行" }).click();
  const clearRes = await clearPromise;

  const elapsed = performance.now() - start;
  return { elapsed, snapCount: snap.length, clearOk: clearRes?.ok };
}

async function main() {
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}/`;
  const viteProc = await startVite(port);

  let browser;
  try {
    console.log("\n🚀 正在启动可见 Chrome 浏览器进行对比演示...");
    browser = await chromium.launch({
      channel: "chrome",
      headless: false,
      viewport: { width: 1440, height: 900 },
    });

    // --- Round 1: 传统 DOM 逐步操作 ---
    const page1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const load1Start = performance.now();
    await page1.goto(url, { waitUntil: "networkidle" });
    const load1Ms = performance.now() - load1Start;

    console.log("▶️  Round 1: 传统 Playwright DOM 逐步操作（请观察浏览器）...");
    const domMs = await runTraditionalFlow(page1);
    await page1.waitForTimeout(800);
    await page1.close();

    // --- Round 2: UI SDK Agent 操作 ---
    const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const load2Start = performance.now();
    await page2.goto(url, { waitUntil: "networkidle" });
    const load2Ms = performance.now() - load2Start;

    console.log("🤖 Round 2: UI SDK Agent Bridge 语义操作（请观察浏览器）...");
    const agentResult = await runAgentFlow(page2);
    await page2.waitForTimeout(1500);
    await page2.close();

    console.log("\n================ 复杂多步操作耗时对比 ================");
    console.log(`Round 1 首屏加载:                ${load1Ms.toFixed(1)} ms`);
    console.log(`Round 1 传统 DOM 操作 (16步):    ${domMs.toFixed(1)} ms`);
    console.log(`Round 2 首屏加载:                ${load2Ms.toFixed(1)} ms`);
    console.log(
      `Round 2 UI SDK Agent 操作:       ${agentResult.elapsed.toFixed(1)} ms (snapshot=${agentResult.snapCount}组件, confirm=${agentResult.clearOk})`,
    );
    console.log(
      `纯操作提速比:                    ${(domMs / agentResult.elapsed).toFixed(2)}x`,
    );
    console.log("======================================================\n");
  } finally {
    if (browser) await browser.close();
    viteProc.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
