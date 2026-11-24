import { useState } from "react";
import {
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
  TagPicker,
  type TableColumn,
} from "../components/ui";

interface DemoRow {
  id: string;
  name: string;
  type: string;
  status: "已上线" | "草稿";
}

const SAMPLE_ROWS: DemoRow[] = [
  { id: "1", name: "IoT 设备接入网关", type: "应用", status: "已上线" },
  { id: "2", name: "车辆状态查询插件", type: "插件", status: "草稿" },
];

export function ComponentGallery() {
  const [checkedA, setCheckedA] = useState(false);
  const [checkedB, setCheckedB] = useState(true);
  const [seg, setSeg] = useState<"app" | "plugin" | "all">("app");
  const [selectVal, setSelectVal] = useState("beijing");
  const [inputVal, setInputVal] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["iot"]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: TableColumn<DemoRow>[] = [
    { key: "name", title: "名称", render: (r) => <span className="font-medium">{r.name}</span> },
    {
      key: "type",
      title: "类型",
      render: (r) => <Tag tone={r.type === "插件" ? "primary" : "neutral"}>{r.type}</Tag>,
    },
    {
      key: "status",
      title: "状态",
      render: (r) => (
        <Tag tone={r.status === "已上线" ? "success" : "neutral"}>{r.status}</Tag>
      ),
    },
    {
      key: "action",
      title: "操作",
      render: () => (
        <Button variant="text" size="sm">
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <div>
        <h1 className="m-0 text-2xl font-medium text-ink">组件规范预览（UI Gallery）</h1>
        <p className="mt-1 mb-0 text-[13px] text-ink-muted">
          集中展示 Ninebot Workbench Design Tokens 与 <code>src/components/ui</code> 全量 10 个组件的所有变体与状态
        </p>
      </div>

      {/* 1. Design Tokens & Spacing */}
      <Card padding="md">
        <Stack gap="md">
          <h2 className="m-0 text-base font-medium text-ink">1. Design Tokens 与间距刻度</h2>
          <Inline gap="sm" wrap>
            <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs">
              <span className="size-4 rounded bg-brand" /> Brand #000000
            </div>
            <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs">
              <span className="size-4 rounded bg-accent" /> Accent #4A4DD4
            </div>
            <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs">
              <span className="size-4 rounded bg-page border border-border" /> Page #F5F7FA
            </div>
            <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs">
              <span className="size-4 rounded bg-success" /> Success #009A29
            </div>
            <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs">
              <span className="size-4 rounded bg-warning" /> Warning #D25F00
            </div>
            <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs">
              <span className="size-4 rounded bg-danger" /> Danger #CB272D
            </div>
          </Inline>
          <Inline gap="md" wrap>
            {(
              [
                ["xs", "4px", "w-1"],
                ["sm", "8px", "w-2"],
                ["md", "16px", "w-4"],
                ["lg", "24px", "w-6"],
              ] as const
            ).map(([name, px, cls]) => (
              <Inline key={name} gap="xs">
                <span className="text-xs font-mono text-ink-secondary">
                  {name} ({px})
                </span>
                <span className={`h-3 ${cls} rounded bg-accent`} />
              </Inline>
            ))}
          </Inline>
        </Stack>
      </Card>

      {/* 2. Button */}
      <Card padding="md">
        <Stack gap="md">
          <h2 className="m-0 text-base font-medium text-ink">2. Button（5 种变体 + 2 种尺寸 + 禁用态）</h2>
          <Inline gap="sm" wrap>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="text">Text Link</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </Inline>
          <Inline gap="sm" wrap>
            <Button variant="primary" size="sm">
              Small Primary
            </Button>
            <Button variant="outline" size="sm">
              Small Outline
            </Button>
            <Button variant="text" size="sm">
              Small Text
            </Button>
          </Inline>
        </Stack>
      </Card>

      {/* 3. Tag */}
      <Card padding="md">
        <Stack gap="md">
          <h2 className="m-0 text-base font-medium text-ink">3. Tag（5 种状态色调）</h2>
          <Inline gap="sm" wrap>
            <Tag tone="neutral">草稿 Neutral</Tag>
            <Tag tone="primary">插件 Primary</Tag>
            <Tag tone="success">已上线 Success</Tag>
            <Tag tone="warning">待审核 Warning</Tag>
            <Tag tone="danger">异常 Danger</Tag>
          </Inline>
        </Stack>
      </Card>

      {/* 4. Input & Select & Checkbox & SegmentedControl */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md">
          <Stack gap="md">
            <h2 className="m-0 text-base font-medium text-ink">4. Input（常规 / 带标签 / 报错 / 禁用）</h2>
            <Input
              label="应用名称"
              placeholder="请输入应用名称..."
              value={inputVal}
              onValueChange={setInputVal}
            />
            <Input
              label="校验失败态"
              placeholder="错误示例"
              defaultValue="invalid-app-id"
              error="应用 ID 格式不正确"
            />
            <Input label="禁用态" defaultValue="不可编辑内容" disabled />
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap="md">
            <h2 className="m-0 text-base font-medium text-ink">5. Select / Checkbox / SegmentedControl</h2>
            <Select
              label="部署区域"
              value={selectVal}
              onValueChange={(v) => v && setSelectVal(v)}
              options={[
                { value: "beijing", label: "中国北京（cn-north）" },
                { value: "shanghai", label: "中国上海（cn-east）" },
                { value: "frankfurt", label: "德国法兰克福（eu-central）" },
              ]}
            />
            <Inline gap="md" wrap>
              <Checkbox
                label="未选中状态"
                checked={checkedA}
                onCheckedChange={(c) => setCheckedA(c === true)}
              />
              <Checkbox
                label="已选中状态"
                checked={checkedB}
                onCheckedChange={(c) => setCheckedB(c === true)}
              />
              <Checkbox label="禁用状态" disabled />
            </Inline>
            <div>
              <SegmentedControl
                aria-label="Gallery filter"
                value={seg}
                onValueChange={(v) => setSeg(v)}
                options={[
                  { value: "app", label: "应用" },
                  { value: "plugin", label: "插件" },
                  { value: "all", label: "全部" },
                ]}
              />
            </div>
          </Stack>
        </Card>
      </div>

      {/* 6. Card & Dialog */}
      <Card padding="md">
        <Stack gap="md">
          <Inline justify="between" wrap>
            <h2 className="m-0 text-base font-medium text-ink">6. Card（交互卡片）与 Dialog（弹窗）</h2>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
              打开 Dialog 示例
            </Button>
          </Inline>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card padding="sm" interactive>
              <div className="text-sm font-medium text-ink">创建应用（Interactive Card）</div>
              <div className="mt-1 text-xs text-ink-muted">悬停时边框高亮为紫蓝强调色</div>
            </Card>
            <Card padding="sm" interactive>
              <div className="text-sm font-medium text-ink">创建插件（Interactive Card）</div>
              <div className="mt-1 text-xs text-ink-muted">统一 12px 圆角与轻阴影</div>
            </Card>
          </div>
        </Stack>
      </Card>

      {/* 7. Table */}
      <Card padding="md">
        <Stack gap="md">
          <h2 className="m-0 text-base font-medium text-ink">7. Table（57px 行高数据表格）</h2>
          <Table columns={columns} data={SAMPLE_ROWS} rowKey={(r) => r.id} />
        </Stack>
      </Card>

      {/* 8. 自定义原语示例：TagPicker */}
      <Card padding="md">
        <Stack gap="md">
          <Inline justify="between" wrap>
            <h2 className="m-0 text-base font-medium text-ink">
              8. 自定义行为原语示例：TagPicker（definePrimitive + context）
            </h2>
            <Tag tone="primary">已选：{selectedTags.join(", ") || "无"}</Tag>
          </Inline>
          <p className="m-0 text-xs text-ink-muted">
            点击任意标签后，可用键盘 <code>←</code> / <code>→</code> 切换漫游焦点（自动跳过禁用项），按 <code>Enter</code> / <code>Space</code> 多选。
          </p>
          <TagPicker
            aria-label="Capabilities"
            multiple
            value={selectedTags}
            onValueChange={(next) => setSelectedTags(next)}
            options={[
              { value: "iot", label: "IoT 网关" },
              { value: "ble", label: "蓝牙通信" },
              { value: "ota", label: "OTA 升级（禁用）", disabled: true },
              { value: "ai", label: "AI 语音" },
              { value: "telemetry", label: "车辆遥测" },
            ]}
          />
        </Stack>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Dialog 组件预览"
        description="基于 @ui-sdk/react/dialog 封装，支持 ESC 关闭与焦点管理"
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setDialogOpen(false)}>确认</Button>
          </>
        }
      >
        <div className="text-sm text-ink-regular">
          这里是弹窗主体内容区域，统一使用 24px 内边距与底部操作栏分隔线。
        </div>
      </Dialog>
    </Stack>
  );
}
