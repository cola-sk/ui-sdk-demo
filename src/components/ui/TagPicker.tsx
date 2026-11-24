import {
  createChange,
  createRovingFocus,
  createSelection,
  definePrimitive,
  type ChangeDetails,
} from "@ui-sdk/core";
import { createParts } from "@ui-sdk/react/primitive";

export interface TagPickerOptions {
  value?: string[];
  defaultValue?: string[];
  multiple?: boolean;
  onValueChange?: (value: string[], details: ChangeDetails<string>) => void;
}

interface TagPickerState {
  value: string[];
  focusedKey: string | null;
}

interface TagPickerItemProps {
  value: string;
  disabled?: boolean;
}

/**
 * 1. 使用 definePrimitive + context 组合多个行为原语：
 *    - createChange: 统一管理受控/非受控状态变更与 source 溯源
 *    - createRovingFocus: 管理横向漫游焦点（Tab 只停靠一次，←/→ 键切换）
 *    - createSelection: 管理单选/多选/Range 选择逻辑
 */
export const tagPickerPrimitive = definePrimitive({
  name: "tag-picker",
  options: {
    value: "value",
    defaultValue: "value",
    multiple: "boolean",
    onValueChange: "callback",
  },
  state: (options: TagPickerOptions): TagPickerState => ({
    value: options.value ?? options.defaultValue ?? [],
    focusedKey: null,
  }),
  sync: (options) => (options.value === undefined ? {} : { value: options.value }),
  controlled: ["value"],
  api: (context) => {
    const change = createChange(context);

    const roving = createRovingFocus<TagPickerState, TagPickerItemProps>(context, {
      slot: "item",
      key: "focusedKey",
      orientation: () => "horizontal",
      loop: () => true,
      disabled: (item) => Boolean(item.props.disabled),
    });

    const selection = createSelection(context, {
      key: "value",
      set: (value, details) => change("value", value, details),
      order: () => roving.items().map((item) => item.key),
      multiple: () => Boolean(context.options().multiple),
    });

    return {
      roving,
      selection,
      setValue: (value: string[]) => change("value", value, { reason: "api" }),
    };
  },
  slots: (slot) => ({
    root: slot({
      role: "group",
    }),
    item: slot<TagPickerItemProps>({
      props: {
        value: "string",
        disabled: "boolean",
      },
      role: "button",
      focus: "roving",
      attrs: (state, part) => ({
        type: "button",
        tabindex: part.api.roving.tabIndex(state, part),
        "aria-pressed": String(state.value.includes(part.props.value)),
        "data-selected": state.value.includes(part.props.value) ? "true" : "false",
      }),
      on: {
        keydown: (event, { el, api }) => {
          if (el) api.roving.keydown(event, el);
        },
      },
      bind: (el, part) => part.api.roving.bind(el, part),
      press: ({ api, props }, event) => {
        if (props.disabled) return;
        api.selection.toggle(props.value, { reason: "item-press", event });
      },
    }),
  }),
});

/**
 * 2. 通过 createParts 将无头原语映射为 React 组件
 */
const { Root, Item } = createParts(tagPickerPrimitive, {
  root: "div",
  item: "button",
});

export interface TagPickerOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TagPickerProps extends TagPickerOptions {
  options: TagPickerOption[];
  "aria-label"?: string;
  className?: string;
}

/**
 * 3. 使用 Ninebot Workbench Design Tokens 包装成业务组件
 */
export function TagPicker({
  options,
  "aria-label": ariaLabel,
  className = "",
  ...primitiveOptions
}: TagPickerProps) {
  return (
    <Root
      aria-label={ariaLabel}
      className={`inline-flex flex-wrap items-center gap-2 ${className}`}
      {...primitiveOptions}
    >
      {options.map((opt) => (
        <Item
          key={opt.value}
          value={opt.value}
          disabled={opt.disabled}
          className="h-8 px-3 rounded-control border text-[13px] font-medium transition-colors cursor-pointer select-none outline-none border-border bg-surface text-ink-regular hover:bg-page focus-visible:ring-2 focus-visible:ring-accent/30 data-[selected=true]:bg-accent-soft data-[selected=true]:border-accent-border data-[selected=true]:text-accent-deep disabled:opacity-45 disabled:cursor-not-allowed"
        >
          {opt.label}
        </Item>
      ))}
    </Root>
  );
}
