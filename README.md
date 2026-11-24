# UI SDK Workbench & AI Agent Bridge

> 基于 **React 19 + `@ui-sdk/react` + Tailwind CSS v4** 构建的下一代企业级工作台与 AI Agent 运行时桥接示例。视觉设计规范严格对齐九号开发者工作台（MFN Developer Console）。

---

## 🌟 项目亮点与核心价值

- **行为与视觉彻底解耦（Headless & Behavior-First）**：基于 Vercel Labs `@ui-sdk/core` 与 `@ui-sdk/react`，组件内核只管理状态机与 WAI-ARIA 规范，业务层享有 100% 样式自由度。
- **AI 原生代理运行时（Native Agent Bridge）**：无需依赖脆性易变的 CSS 选择器与鼠标模拟，通过 UI SDK 原生的 `createAgent()` 建立组件语义树快照（`snapshot`）与确定性操作分发（`act`）。
- **企业级安全治理机制**：
  - `data-agent-confirm`：自动拦截敏感破坏性操作（如删除、发布），要求 Agent 二次确认。
  - `data-agent-secret`：密钥、凭据与敏感字段在 Agent 快照中自动掩码脱敏。
- **自定义行为原语（Custom Primitive）**：使用 `definePrimitive` + `context`（`createRovingFocus` + `createSelection`）封装 `TagPicker`，实现标准的键盘 Roving Focus 巡回焦点与多选交互。
- **双重测试与性能压测体系**：
  - **Vitest + JSDOM**：毫秒级完成全链路 Agent 语义操作验证（~1.2s，无需启动重量级浏览器）。
  - **Playwright Benchmark**：在真实 Chrome 环境下对比“传统 DOM 仿真点击”与“UI SDK 语义 Bridge”，实测 **2.65x+ 端到端提速** 且零选择器漂移。

---

## 🏗️ 架构与技术栈

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **基础框架** | React 19 + TypeScript 5.8 + Vite 6 | 最新现代化构建环境 |
| **无头行为库** | `@ui-sdk/react` + `@ui-sdk/core` | Vercel Labs 行为原语与 Agent 契约库 |
| **样式系统** | Tailwind CSS v4 (`@tailwindcss/vite`) | 基于 CSS 变量驱动的全新引擎 |
| **视觉令牌** | 九号开发者控制台 Design Tokens (`tokens.css`) | 提取自 `@ninebot/pc-styles-black` 黑色科技风体系 |
| **单元/语义测试** | Vitest 3 + JSDOM | 无头极速验证 Agent 操作与组件状态变更 |
| **端到端压测** | Playwright Core | 双轮性能对比（DOM 模拟 vs. 语义 Agent） |

---

## 📦 目录结构

```text
ui-sdk-demo/
├── .agents/
│   └── skills/
│       ├── ui-sdk/              # Vercel Labs 官方 UI SDK 指南与文档索引
│       └── workbench-ui/        # 九号工作台业务组件清单与页面拼装规范
├── scripts/
│   └── benchmark-playwright.mjs # Playwright 真实浏览器双轮压测脚本 (2.65x 提速)
├── src/
│   ├── __tests__/
│   │   └── workbench.e2e.test.tsx # 基于 Vitest 的 Agent 端到端集成测试 (6/6 pass)
│   ├── components/
│   │   └── ui/                  # 10 款高频组件 + 1 款自定义 Primitive
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Checkbox.tsx
│   │       ├── SegmentedControl.tsx
│   │       ├── Select.tsx
│   │       ├── Dialog.tsx
│   │       ├── Tag.tsx
│   │       ├── TagPicker.tsx    # 自定义 Primitive (Roving Focus + Selection)
│   │       ├── Card.tsx
│   │       ├── Table.tsx
│   │       ├── Layout.tsx       # AppShell, Stack, Inline 布局容器
│   │       └── index.ts         # 统一出口 (业务代码禁止直连 @ui-sdk/react)
│   ├── pages/
│   │   └── ComponentGallery.tsx # 组件画廊展示页 (全量状态与档位展示)
│   ├── styles/
│   │   └── tokens.css           # 严格防魔法数字的 Design Tokens
│   ├── agentBridge.ts           # Agent 运行桥：createAgent 封装、脱敏与确认拦截
│   ├── App.tsx                  # MFN 工作台主应用 + 悬浮 AI Agent 互动调试控制台
│   └── main.tsx
├── AGENTS.md                    # AI Coding Agent 硬性工程规范与边界契约
├── package.json
└── vite.config.ts
```

---

## 🤖 AI Agent 运行时对比：为什么选择 UI SDK？

在传统方案中，自动化测试与 AI Agent 操作 Web 页面高度依赖 **DOM 选择器与物理点击仿真**。而在 UI SDK 体系下，页面直接向 Agent 暴露结构化契约：

| 维度 | 传统 DOM 模拟操作 (Puppeteer / Playwright) | UI SDK Agent Bridge (`createAgent`) |
| :--- | :--- | :--- |
| **定位机制** | CSS 类名、XPath、文本模糊匹配（极易因样式调整而失效） | 稳定唯一的组件语义快照（基于 `label`、`part`、`role`） |
| **Token 消耗** | 需传输整页冗杂 DOM 或截图给 LLM（数百 KB~数 MB） | 精简过滤后的语义组件树快照（仅保留可交互项，几 KB） |
| **执行耗时** | 需等待动画完成、滚动视口、计算元素几何中心模拟触发 | 直接分发至无头状态机与事件总线（**实测 2.65x+ 提速**） |
| **安全控制** | 靠 Agent 自律或人工审批外部环境 | 内置 `data-agent-confirm`（阻断高危）与 `data-agent-secret`（自动脱敏） |

### Agent Bridge 核心 API 示例

```typescript
import { createAgent } from "@ui-sdk/react/agent";

// 1. 初始化页面代理
const agent = createAgent({
  // 注入操作阻断与敏感信息脱敏策略
  onConfirm: async (message) => window.confirm(message),
});

// 2. 获取组件语义快照 (无需分析冗长 HTML)
const snapshot = agent.snapshot();
console.log(snapshot);

// 3. 确定性语义操作 (免去 DOM selector)
await agent.act("app-name-input", "change", { value: "我的车联网服务" });
await agent.act("submit-btn", "press");
```

在开发与测试环境中，项目将此实例暴露在 `window.__UI_AGENT__` 上，Playwright 与自动化脚本可以直接调用 `window.__UI_AGENT__.act(...)` 驱动业务流程。

---

## 🚀 常用命令指南

### 1. 启动 MFN 工作台与 AI 交互控制台
```bash
pnpm dev
```
访问 `http://localhost:5173`：
- 完整呈现九号开发者控制台界面（应用管理、配置面板、多环境切换、数据表格）。
- 右下角常驻 **AI Agent Bridge 调试面板**，支持实时生成快照、查看脱敏效果、触发测试指令并观察组件响应。

### 2. 查看组件画廊 (Component Gallery)
```bash
pnpm ui
# 或在浏览器访问 http://localhost:5173/?view=gallery
```
360° 预览 10 款核心组件所有视觉状态（Default、Hover、Active、Disabled、Loading、Size、Tone）。

### 3. 运行端到端集成测试 (Vitest + JSDOM)
```bash
pnpm test
```
执行 `src/__tests__/workbench.e2e.test.tsx`：
- 测试无需启动 Chromium 浏览器，1.2 秒内跑完 6 项完整用例：
  - 表单输入与双向绑定
  - 环境切换分段控件
  - 下拉选择与键盘交互
  - 自定义 `TagPicker` 巡回焦点与多选
  - `data-agent-secret` 密钥脱敏验证
  - `data-agent-confirm` 高危操作拦截流

### 4. 运行真实浏览器性能基准对比 (Playwright Benchmark)
```bash
pnpm run benchmark:pw
```
自动拉起可见 Chrome 窗口，同屏执行两轮自动化操作：
- **Round 1 (传统模式)**：使用 Playwright 物理模拟定位 `input`、`select`、点击保存与模态框。
- **Round 2 (UI SDK 模式)**：直接调用 `window.__UI_AGENT__.act()` 调度语义动作。
- 最终输出直观的执行耗时对比与加速比（平均加速 **~2.65x**）。

### 5. 生产构建与代码检查
```bash
pnpm run build   # TypeScript 类型检查与 Vite 打包
pnpm run lint    # 基于 Oxlint 的超高速代码静态检查
```

---

## 🎨 Design Tokens 规范与防魔法数字

为了保证与九号开发者控制台黑色主题风格一致，所有颜色、间距、圆角在 [src/styles/tokens.css](file:///Users/liuzhe.x/coding/ui-sdk-demo/src/styles/tokens.css) 中严格定义：

- **背景梯度**：`--bg-page` (`#0b0d11`)、`--bg-surface` (`#14171f`)、`--bg-control` (`#1c202a`)
- **主色与状态**：`--primary` (`#3884ff` 九号科技蓝)、`--success` (`#22c55e`)、`--danger` (`#ef4444`)
- **文本层级**：`--text-ink` (`#f8fafc`)、`--text-muted` (`#94a3b8`)、`--text-faint` (`#475569`)
- **布局间距原语**：严禁硬编码 `gap-[13px]` 等数值，统一通过 `<Stack gap="...">` 与 `<Inline gap="...">` 的标准四档间距排版：
  - `xs` (4px)：标签内、图标间隙
  - `sm` (8px)：表单行内、按钮组
  - `md` (16px)：卡片内容区、表单行距
  - `lg` (24px)：主面板容器外边距

---

## 📖 开发者与 AI 协作规范

本项目配置了完整的 AI Agent 规范体系：
- [AGENTS.md](file:///Users/liuzhe.x/coding/ui-sdk-demo/AGENTS.md)：对所有在本项目工作的 AI Agent 施加的架构约束（如组件封装边界、安全属性要求、自测标准）。
- `.agents/skills/workbench-ui/`：九号控制台业务场景与模版生成规范。
- `.agents/skills/ui-sdk/`：Vercel Labs UI SDK 官方技能指导。

任何在此仓库工作的 AI 助手，在新增或重构组件时必须遵守 `AGENTS.md`，并在修改后执行 `pnpm test` 自测验收。
