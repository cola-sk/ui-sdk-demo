import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentAction, AgentComponent, ObservedChange } from "@ui-sdk/react/agent";
import { agent, setConfirmHandler } from "./agentBridge";
import { ComponentGallery } from "./pages/ComponentGallery";
import {
  AppShell,
  Button,
  Card,
  Checkbox,
  Dialog,
  Inline,
  Input,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Tag,
  type TableColumn,
} from "./components/ui";

type TodoFilter = "all" | "active" | "completed";
type Priority = "high" | "medium" | "low";

interface WorkbenchTask {
  id: string;
  title: string;
  category: "应用" | "插件";
  priority: Priority;
  completed: boolean;
  updatedAt: string;
}

interface PendingConfirm {
  step: AgentAction;
  resolve: (allowed: boolean) => void;
}

interface ActionLog {
  id: number;
  time: string;
  title: string;
  detail: string;
  ok: boolean;
}

const INITIAL_TASKS: WorkbenchTask[] = [
  {
    id: "1",
    title: "接入 Ninebot Workbench Design Tokens",
    category: "应用",
    priority: "high",
    completed: true,
    updatedAt: "2026-11-24 11:20",
  },
  {
    id: "2",
    title: "封装 10 个高频后台 UI 组件",
    category: "插件",
    priority: "high",
    completed: false,
    updatedAt: "2026-11-24 13:10",
  },
  {
    id: "3",
    title: "配置 AGENTS.md 与项目级 Skill 契约",
    category: "应用",
    priority: "medium",
    completed: false,
    updatedAt: "2026-11-24 13:45",
  },
];

const PRIORITY_TAG: Record<Priority, { label: string; tone: "danger" | "warning" | "neutral" }> = {
  high: { label: "高优", tone: "danger" },
  medium: { label: "常规", tone: "warning" },
  low: { label: "低优", tone: "neutral" },
};

export function App() {
  const [activeNav, setActiveNav] = useState(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("view") === "gallery"
      ? "gallery"
      : "workbench",
  );
  const [tasks, setTasks] = useState<WorkbenchTask[]>(INITIAL_TASKS);
  const [draft, setDraft] = useState("");
  const draftRef = useRef("");
  const [draftPriority, setDraftPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [secretToken, setSecretToken] = useState("nb-open-test-secret-9981");
  const [lastSource, setLastSource] = useState("尚未操作");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [snapshot, setSnapshot] = useState<AgentComponent[]>([]);
  const [events, setEvents] = useState<ObservedChange[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  const refreshSnapshot = useCallback(() => {
    setSnapshot(agent.snapshot());
  }, []);

  useEffect(() => {
    setConfirmHandler((step, signal) => {
      return new Promise<boolean>((resolve) => {
        const onAbort = () => {
          setPendingConfirm(null);
          resolve(false);
        };
        signal.addEventListener("abort", onAbort, { once: true });

        setPendingConfirm({
          step,
          resolve: (allowed: boolean) => {
            signal.removeEventListener("abort", onAbort);
            setPendingConfirm(null);
            resolve(allowed);
          },
        });
      });
    });

    return () => setConfirmHandler(null);
  }, []);

  useEffect(() => {
    refreshSnapshot();
    const unsubscribe = agent.subscribe((change) => {
      setEvents((prev) => [change, ...prev].slice(0, 10));
      setLastSource(`${change.source} (${change.component}: ${change.label ?? change.ref})`);
      requestAnimationFrame(refreshSnapshot);
    });
    return unsubscribe;
  }, [refreshSnapshot]);

  useEffect(() => {
    const id = requestAnimationFrame(refreshSnapshot);
    return () => cancelAnimationFrame(id);
  }, [tasks, filter, activeNav, refreshSnapshot]);

  const addTask = (source?: string) => {
    const title = draftRef.current.trim();
    if (!title) return;
    setTasks((prev) => [
      {
        id: String(Date.now()),
        title,
        category: "应用",
        priority: draftPriority,
        completed: false,
        updatedAt: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
    draftRef.current = "";
    setDraft("");
    setCreateDialogOpen(false);
    if (source) setLastSource(`${source} (创建任务: ${title})`);
  };

  const toggleTask = (id: string, completed: boolean, source?: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
    if (source) setLastSource(`${source} (切换任务状态)`);
  };

  const deleteTask = (id: string, source?: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (source) setLastSource(`${source} (删除任务)`);
  };

  const clearCompleted = (source?: string) => {
    setTasks((prev) => prev.filter((t) => !t.completed));
    if (source) setLastSource(`${source} (清空已完成)`);
  };

  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const appendLog = (title: string, detail: string, ok: boolean) => {
    setActionLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        title,
        detail,
        ok,
      },
      ...prev.slice(0, 6),
    ]);
  };

  // --- AI Agent 运行时指令 ---
  const runAiAddTask = async () => {
    const text = `AI 创建的自动化任务 #${tasks.length + 1}`;
    const res = await agent.act({
      steps: [
        { ref: "New task", action: "setValue", args: [text] },
        { ref: "Add Task", action: "press" },
      ],
    });
    appendLog(
      "AI 两步连招：输入并创建任务",
      res.ok ? `已创建 "${text}"` : res.error?.message ?? "失败",
      res.ok,
    );
  };

  const runAiFilterActive = async () => {
    const res = await agent.act({
      steps: [{ ref: "Filter tasks", action: "setValue", args: ["active"] }],
    });
    appendLog(
      "AI 切换分段筛选器 -> 进行中",
      res.ok ? "已切换视图" : res.error?.message ?? "失败",
      res.ok,
    );
  };

  const runAiCompleteFirst = async () => {
    const target = tasks.find((t) => !t.completed);
    if (!target) {
      appendLog("AI 勾选第一条未完成任务", "当前无未完成任务", false);
      return;
    }
    const res = await agent.act({
      steps: [{ ref: target.title, action: "setChecked", args: [true] }],
    });
    appendLog(
      `AI 完成任务 "${target.title}"`,
      res.ok ? "已通过组件 API 设为完成" : res.error?.message ?? "失败",
      res.ok,
    );
  };

  const runAiClearCompleted = async () => {
    const res = await agent.act({
      steps: [{ ref: "Clear completed", action: "press" }],
    });
    appendLog(
      "AI 清空已完成（触发 data-agent-confirm）",
      res.ok ? "用户已确认执行" : `已拦截: ${res.error?.message ?? "cancelled"}`,
      res.ok,
    );
  };

  const runAiQuerySecret = async () => {
    const res = await agent.query({ text: "Private token" });
    appendLog("AI 查询密钥输入框（data-agent-secret）", JSON.stringify(res), true);
  };

  const columns: TableColumn<WorkbenchTask>[] = [
    {
      key: "title",
      title: "任务名称",
      render: (row) => (
        <Checkbox
          aria-label={row.title}
          checked={row.completed}
          onCheckedChange={(checked, details) =>
            toggleTask(row.id, checked === true, details.source)
          }
          label={
            <span className={row.completed ? "line-through text-ink-muted" : "font-medium text-ink"}>
              {row.title}
            </span>
          }
        />
      ),
    },
    {
      key: "category",
      title: "类型",
      width: "90px",
      render: (row) => (
        <Tag tone={row.category === "插件" ? "primary" : "neutral"}>{row.category}</Tag>
      ),
    },
    {
      key: "priority",
      title: "优先级",
      width: "90px",
      render: (row) => (
        <Tag tone={PRIORITY_TAG[row.priority].tone}>{PRIORITY_TAG[row.priority].label}</Tag>
      ),
    },
    {
      key: "status",
      title: "状态",
      width: "100px",
      render: (row) => (
        <Tag tone={row.completed ? "success" : "neutral"}>
          {row.completed ? "已完成" : "草稿"}
        </Tag>
      ),
    },
    {
      key: "updatedAt",
      title: "更新时间",
      width: "140px",
      render: (row) => <span className="text-xs text-ink-muted">{row.updatedAt}</span>,
    },
    {
      key: "actions",
      title: "操作",
      width: "100px",
      render: (row) => (
        <div data-agent-confirm={`确认删除任务 "${row.title}"？`}>
          <Button
            variant="danger"
            size="sm"
            aria-label={`Delete ${row.title}`}
            onClick={(_, details) => deleteTask(row.id, details.source)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell
      brandTitle="开发者工作台"
      orgName="UI SDK + Tailwind Tokens Demo"
      userName="NB"
      navItems={[
        { id: "workbench", label: "工作台概览", badge: String(tasks.length) },
        { id: "gallery", label: "组件规范预览", badge: "10" },
      ]}
      activeNavId={activeNav}
      onNavChange={setActiveNav}
      headerRight={
        <Tag tone="primary">最近变更：{lastSource}</Tag>
      }
    >
      {activeNav === "gallery" ? (
        <ComponentGallery />
      ) : (
      <Stack gap="lg">
        {/* 顶部欢迎区 */}
        <Inline justify="between" wrap>
          <div>
            <h1 className="m-0 text-2xl font-medium text-ink leading-8">
              你好，欢迎来到工作台
            </h1>
            <p className="mt-1 mb-0 text-[13px] text-ink-muted">
              基于 Ninebot 开发者平台 Token 与 10 个 UI SDK 高频后台组件构建
            </p>
          </div>
          <Inline gap="sm">
            <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
              弹窗新建任务
            </Button>
            <Button variant="primary" onClick={runAiAddTask}>
              🤖 AI 一键创建任务
            </Button>
          </Inline>
        </Inline>

        {/* 快捷概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="sm">
            <div className="text-xs text-ink-muted">总任务数</div>
            <div className="mt-1 text-2xl font-semibold text-ink">{tasks.length}</div>
          </Card>
          <Card padding="sm">
            <div className="text-xs text-ink-muted">进行中</div>
            <div className="mt-1 text-2xl font-semibold text-accent">
              {tasks.filter((t) => !t.completed).length}
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-xs text-ink-muted">已完成</div>
            <div className="mt-1 text-2xl font-semibold text-success">
              {tasks.filter((t) => t.completed).length}
            </div>
          </Card>
        </div>

        {/* 主体左右分栏：左侧任务工作台 + 右侧 AI 桥接控制台 */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-7">
            <Stack gap="md">
              <Card padding="md">
                <Stack gap="md">
                  <Inline justify="between" wrap>
                    <h2 className="m-0 text-lg font-medium text-ink">任务列表</h2>
                    <SegmentedControl<TodoFilter>
                      aria-label="Filter tasks"
                      value={filter}
                      onValueChange={(val, details) => {
                        setFilter(val);
                        const src = (details as { source?: string }).source ?? details.reason ?? "ui";
                        setLastSource(`${src} (筛选: ${val})`);
                      }}
                      options={[
                        { value: "all", label: `全部 (${tasks.length})` },
                        { value: "active", label: `进行中 (${tasks.filter((t) => !t.completed).length})` },
                        { value: "completed", label: `已完成 (${tasks.filter((t) => t.completed).length})` },
                      ]}
                    />
                  </Inline>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addTask("person");
                    }}
                  >
                    <Inline gap="sm" align="end" wrap>
                      <Input
                        aria-label="New task"
                        placeholder="输入新任务标题..."
                        value={draft}
                        onValueChange={(val, details) => {
                          draftRef.current = val;
                          setDraft(val);
                          if (details.source === "agent") {
                            setLastSource(`agent (输入: ${val})`);
                          }
                        }}
                        className="flex-1 min-w-[200px]"
                      />
                      <Select<Priority>
                        aria-label="Task priority"
                        value={draftPriority}
                        onValueChange={(val) => val && setDraftPriority(val)}
                        options={[
                          { value: "high", label: "高优" },
                          { value: "medium", label: "常规" },
                          { value: "low", label: "低优" },
                        ]}
                        className="w-[120px]"
                      />
                      <Button
                        type="submit"
                        onClick={(_, details) => {
                          if (details.source === "agent") addTask("agent");
                        }}
                      >
                        Add Task
                      </Button>
                    </Inline>
                  </form>

                  <Table
                    columns={columns}
                    data={visibleTasks}
                    rowKey={(row) => row.id}
                    emptyText="当前筛选下暂无任务"
                  />

                  <Inline justify="between">
                    <span className="text-xs text-ink-muted">
                      共 {visibleTasks.length} 条记录
                    </span>
                    <div data-agent-confirm="确认清空所有已完成的任务吗？">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!tasks.some((t) => t.completed)}
                        onClick={(_, details) => clearCompleted(details.source)}
                      >
                        Clear completed
                      </Button>
                    </div>
                  </Inline>
                </Stack>
              </Card>

              <Card padding="sm">
                <div data-agent-secret="">
                  <Input
                    label="网关密钥（已标记 data-agent-secret，AI 仅可见 [redacted]）"
                    aria-label="Private token"
                    value={secretToken}
                    onValueChange={setSecretToken}
                  />
                </div>
              </Card>
            </Stack>
          </div>

          <div className="xl:col-span-5">
            <Card padding="md">
              <Stack gap="md">
                <Inline justify="between">
                  <h2 className="m-0 text-lg font-medium text-ink">
                    AI Runtime Bridge 控制台
                  </h2>
                  <Tag tone="primary">createAgent()</Tag>
                </Inline>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={runAiAddTask}>
                    🤖 AI 创建任务
                  </Button>
                  <Button variant="outline" size="sm" onClick={runAiFilterActive}>
                    🤖 AI 切到进行中
                  </Button>
                  <Button variant="outline" size="sm" onClick={runAiCompleteFirst}>
                    🤖 AI 完成首条任务
                  </Button>
                  <Button variant="outline" size="sm" onClick={runAiClearCompleted}>
                    🛡️ AI 清空已完成
                  </Button>
                  <Button variant="outline" size="sm" onClick={runAiQuerySecret}>
                    🔒 AI 查询密钥框
                  </Button>
                  <Button variant="text" size="sm" onClick={refreshSnapshot}>
                    🔄 刷新 snapshot()
                  </Button>
                </div>

                {actionLogs.length > 0 && (
                  <Stack gap="xs">
                    <div className="text-xs font-medium text-ink-secondary">
                      AI 执行结果
                    </div>
                    {actionLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`rounded-control border p-2.5 text-xs ${
                          log.ok
                            ? "bg-success-bg/50 border-success-border"
                            : "bg-danger-bg/50 border-danger-border"
                        }`}
                      >
                        <Inline justify="between">
                          <span className="font-semibold text-ink">{log.title}</span>
                          <span className="text-ink-muted">{log.time}</span>
                        </Inline>
                        <div className="mt-1 text-ink-regular break-all">{log.detail}</div>
                      </div>
                    ))}
                  </Stack>
                )}

                <Stack gap="xs">
                  <div className="text-xs font-medium text-ink-secondary">
                    agent.snapshot() 实时状态树
                  </div>
                  <pre className="m-0 max-h-[260px] overflow-auto rounded-control bg-ink p-3 text-[11px] leading-relaxed text-slate-100 font-mono">
                    {JSON.stringify(snapshot, null, 2)}
                  </pre>
                </Stack>

                <Stack gap="xs">
                  <div className="text-xs font-medium text-ink-secondary">
                    agent.subscribe() 变更溯源
                  </div>
                  {events.length === 0 ? (
                    <div className="text-xs text-ink-muted">
                      操作左侧组件或点击 AI 按钮观察事件流…
                    </div>
                  ) : (
                    <Stack gap="xs">
                      {events.map((ev, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded-control border border-border-light bg-page px-2.5 py-1.5 text-xs"
                        >
                          <Inline gap="xs">
                            <Tag tone={ev.source === "agent" ? "primary" : "success"}>
                              {ev.source}
                            </Tag>
                            <span className="font-medium text-ink">{ev.component}</span>
                            <span className="text-ink-muted">{ev.label ?? ev.ref}</span>
                          </Inline>
                          <span className="font-mono text-ink-secondary truncate max-w-[120px]">
                            {JSON.stringify(ev.value)}
                          </span>
                        </div>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Card>
          </div>
        </div>
      </Stack>
      )}

      {/* 新建任务 Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="新建工作台任务"
        description="使用基于 @ui-sdk/react/dialog 封装的 Dialog 组件"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => addTask("person")}>确认创建</Button>
          </>
        }
      >
        <Stack gap="md">
          <Input
            label="任务名称"
            placeholder="请输入任务名称..."
            value={draft}
            onValueChange={(val) => {
              draftRef.current = val;
              setDraft(val);
            }}
          />
          <Select<Priority>
            label="优先级"
            value={draftPriority}
            onValueChange={(val) => val && setDraftPriority(val)}
            options={[
              { value: "high", label: "高优" },
              { value: "medium", label: "常规" },
              { value: "low", label: "低优" },
            ]}
          />
        </Stack>
      </Dialog>

      {/* AI 操作 Human-in-the-Loop 确认 Dialog */}
      <Dialog
        open={Boolean(pendingConfirm)}
        onOpenChange={(open) => {
          if (!open && pendingConfirm) pendingConfirm.resolve(false);
        }}
        title="AI 敏感操作确认"
        description="检测到目标元素标记了 data-agent-confirm，需要人工批准后才能执行。"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => pendingConfirm?.resolve(false)}
            >
              拒绝执行
            </Button>
            <Button
              variant="primary"
              onClick={() => pendingConfirm?.resolve(true)}
            >
              允许 AI 执行
            </Button>
          </>
        }
      >
        {pendingConfirm && (
          <Stack gap="sm">
            <Tag tone="warning">Human-in-the-Loop</Tag>
            <div className="text-sm font-medium text-ink">
              {pendingConfirm.step.confirm}
            </div>
            <div className="text-xs font-mono text-ink-muted bg-page p-2.5 rounded-control border border-border">
              ref="{pendingConfirm.step.ref}" · action="{pendingConfirm.step.action}"
            </div>
          </Stack>
        )}
      </Dialog>
    </AppShell>
  );
}

export default App;
