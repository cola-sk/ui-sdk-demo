# AGENTS.md — UI SDK Workbench 工程规范

本项目是基于 **React 19 + `@ui-sdk/react` + Tailwind CSS v4** 构建的企业级工作台 Demo，视觉规范对齐九号开发者工作台（`open-test.ninebot.com/mfn/workbench`）。

所有在本仓库中工作的 AI Coding Agent 与开发者必须遵守以下硬性约束：

## 1. 组件边界约束
- **业务页面禁止直接引入 `@ui-sdk/react/*`**：所有页面与业务模块必须统一从 `src/components/ui` 引入封装好的组件。
- 如需新增基础组件，先在 `src/components/ui/` 中基于 `@ui-sdk/react` + `src/styles/tokens.css` 封装并从 `src/components/ui/index.ts` 导出。

## 2. 样式与间距一致性约束（防魔法数字）
- **禁止硬编码颜色和任意值间距**：不得在业务代码中出现 `#xxxxxx`、`rgb(...)`、`gap-[13px]`、`p-[18px]` 等魔法数字。
- **统一使用 Design Tokens**：颜色、圆角、阴影必须使用 `src/styles/tokens.css` 定义的语义 Token（如 `bg-page`、`bg-surface`、`text-ink`、`text-accent`、`border-border`、`rounded-card`、`rounded-control`）。
- **间距必须走布局原语**：多组件拼接优先使用 `<Stack gap="...">` 和 `<Inline gap="...">`，`gap` 仅允许离散档位：
  - `xs` (4px)：标签内、图标与文字之间
  - `sm` (8px)：表单项内、按钮组、紧凑列表
  - `md` (16px)：卡片内部区块、表单行之间、常规网格
  - `lg` (24px)：页面主区块之间、面板主内边距

## 3. Agent 运行时可读性与安全规范
- 所有可交互控件（`Input`、`Button`、`Checkbox`、`Select`、`SegmentedControl`）必须提供清晰的 `aria-label` 或可见 `label`，确保 `agent.snapshot()` 和 `agent.act()` 能通过语义标签定位。
- 破坏性操作（删除、批量清空、提交发布）外层必须包裹 `data-agent-confirm="<明确的操作说明>"`。
- 密钥、Token、隐私字段外层必须包裹 `data-agent-secret`。

## 4. UI SDK 官方文档与技能参考
- 新增或修改基础组件（使用 `@ui-sdk/react` / `@ui-sdk/core`）前，若已安装 `ui-sdk` skill 则优先遵循，并查阅随包发布的版本精确文档：
  - 组件总览索引：`node_modules/@ui-sdk/react/docs/llms.txt`
  - 自建新原语组件：按标题检索 `node_modules/@ui-sdk/react/docs/core.md`，并阅读 `node_modules/@ui-sdk/react/docs/rendering.md`
- 业务组件清单、Props 档位与标准页面拼装模板见：[workbench-ui SKILL.md](file://.agents/skills/workbench-ui/SKILL.md)

## 5. 自测与验收规范
- **日常功能逻辑验收**：修改交互或业务代码后，必须运行 `pnpm test`（基于 `agent.snapshot()` 与 `agent.act()` 跑全链路 E2E），严禁手写脆性的 CSS 选择器测试。
- **真浏览器验证**：如需用 Playwright 验证真实浏览器行为，优先通过 `window.__UI_AGENT__.snapshot()` 与 `window.__UI_AGENT__.act()` 驱动交互；仅在排查 CSS 样式、布局遮挡时才打开浏览器截图查看。
