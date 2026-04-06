import __nuxt_component_0 from './PanelBatch-BfUvkOd1.mjs';
import __nuxt_component_1 from './PanelProduction-Hs6SJXU5.mjs';
import __nuxt_component_2 from './PanelPurchaseOrder-aaUzpc3l.mjs';
import __nuxt_component_3 from './PanelContact-B4lbg99b.mjs';
import { _ as _sfc_main$2 } from './Modal-GBrZNdlF.mjs';
import { defineComponent, computed, mergeProps, isRef, unref, withCtx, createVNode, toDisplayString, useSlots, useModel, toRef, ref, useTemplateRef, renderSlot, openBlock, createBlock, createCommentVNode, createTextVNode, Fragment, renderList, createSlots, withKeys, mergeModels, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderSlot, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { useForwardPropsEmits, ListboxItem, ListboxItemIndicator, ListboxRoot, ListboxFilter, ListboxContent, ListboxVirtualizer, ListboxGroup, ListboxGroupLabel } from 'reka-ui';
import { ax as defu } from '../nitro/nitro.mjs';
import { h as useRouter, g as useOverlay, a5 as useMagicKeys, a6 as useEventListener, f as _sfc_main$e, y as useLocale, i as useAppConfig, r as reactivePick, A as createReusableTemplate, t as tv, a4 as refThrottled, O as _sfc_main$9, P as pickLinkProps, G as get, R as omit, Q as _sfc_main$a, w as _sfc_main$b, H as _sfc_main$c, e as _sfc_main$8 } from './server.mjs';
import { useFuse } from '@vueuse/integrations/useFuse';
import { g as getEstimateSize } from './SelectMenu-DljUyjmT.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$3 } from './Kbd-C22JBoFL.mjs';
import { u as useCommandPalette } from './admin-7BUZFj_w.mjs';
import { a as useBatchStore, u as useVesselStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useItemStore, b as usePurchaseOrderStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useCocktailStore } from './useCocktailStore-CByyovs8.mjs';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import './Slideover-CyjfVfmV.mjs';
import './Form-DifyhlgS.mjs';
import './FormField-DcXe0kwN.mjs';
import './BaseQuantityInput-Bo8QfULy.mjs';
import './FieldGroup-bwPzB93U.mjs';
import './Select-xxK8NqZT.mjs';
import './units-DWysHFem.mjs';
import './formatting-DpuwJPOk.mjs';
import 'yup';
import './useFormPanel-DspW7Iuy.mjs';
import './helpers-pfHQ8kqT.mjs';
import './proofGallons--xmqBsFG.mjs';
import './conversions-t0mnZFvt.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import 'pinia';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useProductionStore-SZxhegcf.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import 'mongoose';
import 'cloudinary';
import 'square';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'consola';
import 'consola/utils';
import 'node:url';
import '@iconify/utils';
import 'fast-xml-parser';
import 'ipx';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './batchPipeline-Dr1IalWc.mjs';
import './useAuth-DX6ojG3V.mjs';
import './SiteDatePicker-pVMyeD61.mjs';
import './Popover-BvOOk09Z.mjs';
import 'reka-ui/namespaced';
import 'v-calendar';
import 'date-fns';
import './BaseItemSelect-8IgvW2BX.mjs';
import './Separator-C6vDFXmY.mjs';
import './Switch-BH6j8VnQ.mjs';
import './useProductionCosts-BgHwywl6.mjs';
import './Proofing-C6nhpVFe.mjs';
import './useMessageStore-BW2XxQau.mjs';
import './useEventStore-LoZhbbHY.mjs';

const htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}
function isAlreadyEscaped(str) {
  return /&(?:amp|lt|gt|quot|#39);/.test(str);
}
function sanitize(str) {
  if (isAlreadyEscaped(str)) {
    return str;
  }
  return escapeHTML(str);
}
function truncateHTMLFromStart(html, maxLength) {
  let truncated = "";
  let totalLength = 0;
  let insideTag = false;
  for (let i = html.length - 1; i >= 0; i--) {
    if (html[i] === ">") {
      insideTag = true;
    } else if (html[i] === "<") {
      insideTag = false;
      truncated = html[i] + truncated;
      continue;
    }
    if (!insideTag) {
      totalLength++;
    }
    if (totalLength <= maxLength) {
      truncated = html[i] + truncated;
    } else {
      truncated = "..." + truncated;
      break;
    }
  }
  return truncated;
}
function highlight(item, searchTerm, forceKey, omitKeys) {
  function generateHighlightedText(value, indices = []) {
    value = value || "";
    let content = "";
    let nextUnhighlightedRegionStartingIndex = 0;
    indices.forEach((region) => {
      if (region.length === 2 && region[0] === region[1]) {
        return;
      }
      const lastIndiceNextIndex = region[1] + 1;
      const isMatched = lastIndiceNextIndex - region[0] >= searchTerm.length;
      content += [
        sanitize(value.substring(nextUnhighlightedRegionStartingIndex, region[0])),
        isMatched && `<mark>`,
        sanitize(value.substring(region[0], lastIndiceNextIndex)),
        isMatched && "</mark>"
      ].filter(Boolean).join("");
      nextUnhighlightedRegionStartingIndex = lastIndiceNextIndex;
    });
    content += sanitize(value.substring(nextUnhighlightedRegionStartingIndex));
    const markIndex = content.indexOf("<mark>");
    if (markIndex !== -1) {
      content = truncateHTMLFromStart(content, content.length - markIndex);
    }
    return content;
  }
  if (!item.matches?.length) {
    return;
  }
  for (const match of item.matches) {
    if (forceKey && match.key !== forceKey) {
      continue;
    }
    if (omitKeys?.includes(match.key)) {
      continue;
    }
    return generateHighlightedText(match.value, match.indices);
  }
}
const theme = {
  "slots": {
    "root": "flex flex-col min-h-0 min-w-0 divide-y divide-default",
    "input": "",
    "close": "",
    "back": "p-0",
    "content": "relative overflow-hidden flex flex-col",
    "footer": "p-1",
    "viewport": "relative scroll-py-1 overflow-y-auto flex-1 focus:outline-none",
    "group": "p-1 isolate",
    "empty": "text-center text-muted",
    "label": "font-semibold text-highlighted",
    "item": "group relative w-full flex items-start select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75",
    "itemLeadingIcon": "shrink-0",
    "itemLeadingAvatar": "shrink-0",
    "itemLeadingAvatarSize": "",
    "itemLeadingChip": "shrink-0",
    "itemLeadingChipSize": "",
    "itemTrailing": "ms-auto inline-flex items-center",
    "itemTrailingIcon": "shrink-0",
    "itemTrailingHighlightedIcon": "shrink-0 text-dimmed hidden group-data-highlighted:inline-flex",
    "itemTrailingKbds": "hidden lg:inline-flex items-center shrink-0",
    "itemTrailingKbdsSize": "",
    "itemWrapper": "flex-1 flex flex-col text-start min-w-0",
    "itemLabel": "truncate space-x-1 text-dimmed",
    "itemDescription": "truncate text-muted",
    "itemLabelBase": "text-highlighted [&>mark]:text-inverted [&>mark]:bg-primary",
    "itemLabelPrefix": "text-default",
    "itemLabelSuffix": "text-dimmed [&>mark]:text-inverted [&>mark]:bg-primary"
  },
  "variants": {
    "virtualize": {
      "true": {
        "viewport": "p-1 isolate"
      },
      "false": {
        "viewport": "divide-y divide-default"
      }
    },
    "size": {
      "xs": {
        "input": "[&>input]:h-10",
        "empty": "py-3 text-xs",
        "label": "p-1 text-[10px]/3 gap-1",
        "item": "p-1 text-xs gap-1",
        "itemLeadingIcon": "size-4",
        "itemLeadingAvatarSize": "3xs",
        "itemLeadingChip": "size-4",
        "itemLeadingChipSize": "sm",
        "itemTrailing": "gap-1",
        "itemTrailingIcon": "size-4",
        "itemTrailingHighlightedIcon": "size-4",
        "itemTrailingKbds": "gap-0.5",
        "itemTrailingKbdsSize": "sm"
      },
      "sm": {
        "input": "[&>input]:h-11",
        "empty": "py-4 text-xs",
        "label": "p-1.5 text-[10px]/3 gap-1.5",
        "item": "p-1.5 text-xs gap-1.5",
        "itemLeadingIcon": "size-4",
        "itemLeadingAvatarSize": "3xs",
        "itemLeadingChip": "size-4",
        "itemLeadingChipSize": "sm",
        "itemTrailing": "gap-1.5",
        "itemTrailingIcon": "size-4",
        "itemTrailingHighlightedIcon": "size-4",
        "itemTrailingKbds": "gap-0.5",
        "itemTrailingKbdsSize": "sm"
      },
      "md": {
        "input": "[&>input]:h-12",
        "empty": "py-6 text-sm",
        "label": "p-1.5 text-xs gap-1.5",
        "item": "p-1.5 text-sm gap-1.5",
        "itemLeadingIcon": "size-5",
        "itemLeadingAvatarSize": "2xs",
        "itemLeadingChip": "size-5",
        "itemLeadingChipSize": "md",
        "itemTrailing": "gap-1.5",
        "itemTrailingIcon": "size-5",
        "itemTrailingHighlightedIcon": "size-5",
        "itemTrailingKbds": "gap-0.5",
        "itemTrailingKbdsSize": "md"
      },
      "lg": {
        "input": "[&>input]:h-13",
        "empty": "py-7 text-sm",
        "label": "p-2 text-xs gap-2",
        "item": "p-2 text-sm gap-2",
        "itemLeadingIcon": "size-5",
        "itemLeadingAvatarSize": "2xs",
        "itemLeadingChip": "size-5",
        "itemLeadingChipSize": "md",
        "itemTrailing": "gap-2",
        "itemTrailingIcon": "size-5",
        "itemTrailingHighlightedIcon": "size-5",
        "itemTrailingKbds": "gap-0.5",
        "itemTrailingKbdsSize": "md"
      },
      "xl": {
        "input": "[&>input]:h-14",
        "empty": "py-8 text-base",
        "label": "p-2 text-sm gap-2",
        "item": "p-2 text-base gap-2",
        "itemLeadingIcon": "size-6",
        "itemLeadingAvatarSize": "xs",
        "itemLeadingChip": "size-6",
        "itemLeadingChipSize": "lg",
        "itemTrailing": "gap-2",
        "itemTrailingIcon": "size-6",
        "itemTrailingHighlightedIcon": "size-6",
        "itemTrailingKbds": "gap-0.5",
        "itemTrailingKbdsSize": "lg"
      }
    },
    "active": {
      "true": {
        "item": "text-highlighted before:bg-elevated",
        "itemLeadingIcon": "text-default"
      },
      "false": {
        "item": [
          "text-default data-highlighted:not-data-disabled:text-highlighted data-highlighted:not-data-disabled:before:bg-elevated/50",
          "transition-colors before:transition-colors"
        ],
        "itemLeadingIcon": [
          "text-dimmed group-data-highlighted:not-group-data-disabled:text-default",
          "transition-colors"
        ]
      }
    },
    "loading": {
      "true": {
        "itemLeadingIcon": "animate-spin"
      }
    }
  },
  "defaultVariants": {
    "size": "md"
  }
};
const _sfc_main$1 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UCommandPalette",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    as: { type: null, required: false },
    size: { type: null, required: false },
    icon: { type: null, required: false },
    trailingIcon: { type: null, required: false },
    selectedIcon: { type: null, required: false },
    childrenIcon: { type: null, required: false },
    placeholder: { type: String, required: false },
    autofocus: { type: Boolean, required: false, default: true },
    close: { type: [Boolean, Object], required: false },
    closeIcon: { type: null, required: false },
    back: { type: [Boolean, Object], required: false, default: true },
    backIcon: { type: null, required: false },
    input: { type: [Boolean, Object], required: false, default: true },
    groups: { type: Array, required: false },
    fuse: { type: Object, required: false },
    virtualize: { type: [Boolean, Object], required: false, default: false },
    valueKey: { type: null, required: false },
    labelKey: { type: null, required: false, default: "label" },
    descriptionKey: { type: null, required: false, default: "description" },
    preserveGroupOrder: { type: Boolean, required: false, default: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    multiple: { type: Boolean, required: false },
    disabled: { type: Boolean, required: false },
    modelValue: { type: null, required: false },
    defaultValue: { type: null, required: false },
    highlightOnHover: { type: Boolean, required: false, default: true },
    selectionBehavior: { type: String, required: false },
    by: { type: [String, Function], required: false },
    loading: { type: Boolean, required: false },
    loadingIcon: { type: null, required: false }
  }, {
    "searchTerm": { type: String, ...{ default: "" } },
    "searchTermModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["update:modelValue", "highlight", "entryFocus", "leave", "update:open"], ["update:searchTerm"]),
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const searchTerm = useModel(__props, "searchTerm", { type: String, ...{ default: "" } });
    const { t } = useLocale();
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(reactivePick(props, "as", "disabled", "multiple", "modelValue", "defaultValue", "highlightOnHover", "by"), emits);
    const virtualizerProps = toRef(() => {
      if (!props.virtualize) return false;
      return defu(typeof props.virtualize === "boolean" ? {} : props.virtualize, {
        estimateSize: getEstimateSize(filteredItems.value, "md", props.descriptionKey, !!slots["item-description"])
      });
    });
    const [DefineItemTemplate, ReuseItemTemplate] = createReusableTemplate({
      props: {
        item: {
          type: Object,
          required: true
        },
        group: {
          type: Object,
          required: false
        },
        index: {
          type: Number,
          required: false
        }
      }
    });
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.commandPalette || {} })({
      size: props.size,
      virtualize: !!props.virtualize
    }));
    const fuse = computed(() => defu({}, props.fuse, {
      fuseOptions: {
        ignoreLocation: true,
        threshold: 0.1,
        keys: [props.labelKey, "suffix"]
      },
      resultLimit: 12,
      matchAllWhenSearchEmpty: true
    }));
    const history = ref([]);
    const placeholder = computed(() => history.value[history.value.length - 1]?.placeholder || props.placeholder || t("commandPalette.placeholder"));
    const groups = computed(() => history.value?.length ? [history.value[history.value.length - 1]] : props.groups);
    const items = computed(() => groups.value?.filter((group) => {
      if (!group.id) {
        console.warn(`[@nuxt/ui] CommandPalette group is missing an \`id\` property`);
        return false;
      }
      if (group.ignoreFilter) {
        return false;
      }
      return true;
    })?.flatMap((group) => group.items?.map((item) => ({ ...item, group: group.id })) || []) || []);
    const { results: fuseResults } = useFuse(searchTerm, items, fuse);
    const throttledFuseResults = refThrottled(fuseResults, 16, true);
    function processGroupItems(group, items2) {
      let processedItems = items2;
      if (group?.postFilter && typeof group.postFilter === "function") {
        processedItems = group.postFilter(searchTerm.value, processedItems);
      }
      return {
        ...group,
        items: processedItems.slice(0, fuse.value.resultLimit).map((item) => {
          return {
            ...item,
            labelHtml: highlight(item, searchTerm.value, props.labelKey),
            suffixHtml: highlight(item, searchTerm.value, void 0, [props.labelKey])
          };
        })
      };
    }
    const filteredGroups = computed(() => {
      const currentGroups = groups.value;
      const groupsById = throttledFuseResults.value.reduce((acc, result) => {
        const { item, matches } = result;
        if (!item.group) {
          return acc;
        }
        acc[item.group] ||= [];
        acc[item.group]?.push({ ...item, matches });
        return acc;
      }, {});
      if (props.preserveGroupOrder) {
        const processedGroups = [];
        for (const group of currentGroups || []) {
          if (!group.items?.length) {
            continue;
          }
          const items2 = group.ignoreFilter ? group.items : groupsById[group.id];
          if (!items2?.length) {
            continue;
          }
          const processedGroup = processGroupItems(group, items2);
          if (processedGroup.items?.length) {
            processedGroups.push(processedGroup);
          }
        }
        return processedGroups;
      }
      const fuseGroups = Object.entries(groupsById).map(([id, items2]) => {
        const group = currentGroups?.find((group2) => group2.id === id);
        if (!group) {
          return;
        }
        const processedGroup = processGroupItems(group, items2);
        return processedGroup.items?.length ? processedGroup : void 0;
      }).filter((group) => !!group);
      const nonFuseGroups = currentGroups?.map((group, index) => ({ ...group, index }))?.filter((group) => group.ignoreFilter && group.items?.length)?.map((group) => {
        const processedGroup = processGroupItems(group, group.items || []);
        return { ...processedGroup, index: group.index };
      })?.filter((group) => group.items?.length) || [];
      return nonFuseGroups.reduce((acc, group) => {
        acc.splice(group.index, 0, group);
        return acc;
      }, [...fuseGroups]);
    });
    const filteredItems = computed(() => filteredGroups.value.flatMap((group) => group.items || []));
    const rootRef = useTemplateRef("rootRef");
    function navigate(item) {
      if (!item.children?.length) {
        return;
      }
      history.value.push({
        id: `history-${history.value.length}`,
        label: item.label,
        slot: item.slot,
        placeholder: item.placeholder,
        items: item.children
      });
      searchTerm.value = "";
      rootRef.value?.highlightFirstItem();
    }
    function navigateBack() {
      if (!history.value.length) {
        return;
      }
      history.value.pop();
      searchTerm.value = "";
      rootRef.value?.highlightFirstItem();
    }
    function onBackspace() {
      if (!searchTerm.value) {
        navigateBack();
      }
    }
    function onSelect(e, item) {
      if (item.children?.length) {
        e.preventDefault();
        navigate(item);
      } else {
        item.onSelect?.(e);
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(DefineItemTemplate), null, {
        default: withCtx(({ item, index, group }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$9, mergeProps(unref(pickLinkProps)(item), { custom: "" }), {
              default: withCtx(({ active, ...slotProps }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(ListboxItem), {
                    value: props.valueKey ? unref(get)(item, props.valueKey) : unref(omit)(item, ["matches", "group", "onSelect", "labelHtml", "suffixHtml", "children"]),
                    disabled: item.disabled,
                    "as-child": "",
                    onSelect: ($event) => onSelect($event, item)
                  }, {
                    default: withCtx((_, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_sfc_main$a, mergeProps(slotProps, {
                          "data-slot": "item",
                          class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                        }), {
                          default: withCtx((_2, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              ssrRenderSlot(_ctx.$slots, item.slot || group?.slot || "item", {
                                item,
                                index,
                                ui: ui.value
                              }, () => {
                                ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group?.slot ? `${group.slot}-leading` : `item-leading`, {
                                  item,
                                  index,
                                  ui: ui.value
                                }, () => {
                                  if (item.loading) {
                                    _push5(ssrRenderComponent(_sfc_main$e, {
                                      name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                      "data-slot": "itemLeadingIcon",
                                      class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                    }, null, _parent5, _scopeId4));
                                  } else if (item.icon) {
                                    _push5(ssrRenderComponent(_sfc_main$e, {
                                      name: item.icon,
                                      "data-slot": "itemLeadingIcon",
                                      class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                    }, null, _parent5, _scopeId4));
                                  } else if (item.avatar) {
                                    _push5(ssrRenderComponent(_sfc_main$b, mergeProps({
                                      size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                    }, item.avatar, {
                                      "data-slot": "itemLeadingAvatar",
                                      class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                    }), null, _parent5, _scopeId4));
                                  } else if (item.chip) {
                                    _push5(ssrRenderComponent(_sfc_main$c, mergeProps({
                                      size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                      inset: "",
                                      standalone: ""
                                    }, item.chip, {
                                      "data-slot": "itemLeadingChip",
                                      class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                    }), null, _parent5, _scopeId4));
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                }, _push5, _parent5, _scopeId4);
                                if (item.prefix || (item.labelHtml || unref(get)(item, props.labelKey)) || (item.suffixHtml || item.suffix) || !!slots[item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`] || (unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`])) {
                                  _push5(`<span data-slot="itemWrapper" class="${ssrRenderClass(ui.value.itemWrapper({ class: [props.ui?.itemWrapper, item.ui?.itemWrapper] }))}"${_scopeId4}><span data-slot="itemLabel" class="${ssrRenderClass(ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active }))}"${_scopeId4}>`);
                                  ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`, {
                                    item,
                                    index,
                                    ui: ui.value
                                  }, () => {
                                    if (item.prefix) {
                                      _push5(`<span data-slot="itemLabelPrefix" class="${ssrRenderClass(ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] }))}"${_scopeId4}>${ssrInterpolate(item.prefix)}</span>`);
                                    } else {
                                      _push5(`<!---->`);
                                    }
                                    if (item.labelHtml) {
                                      _push5(`<span data-slot="itemLabelBase" class="${ssrRenderClass(ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }))}"${_scopeId4}>${item.labelHtml ?? ""}</span>`);
                                    } else {
                                      _push5(`<span data-slot="itemLabelBase" class="${ssrRenderClass(ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }))}"${_scopeId4}>${ssrInterpolate(unref(get)(item, props.labelKey))}</span>`);
                                    }
                                    if (item.suffixHtml) {
                                      _push5(`<span data-slot="itemLabelSuffix" class="${ssrRenderClass(ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }))}"${_scopeId4}>${item.suffixHtml ?? ""}</span>`);
                                    } else if (item.suffix) {
                                      _push5(`<span data-slot="itemLabelSuffix" class="${ssrRenderClass(ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }))}"${_scopeId4}>${ssrInterpolate(item.suffix)}</span>`);
                                    } else {
                                      _push5(`<!---->`);
                                    }
                                  }, _push5, _parent5, _scopeId4);
                                  _push5(`</span>`);
                                  if (unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`]) {
                                    _push5(`<span data-slot="itemDescription" class="${ssrRenderClass(ui.value.itemDescription({ class: [props.ui?.itemDescription, item.ui?.itemDescription] }))}"${_scopeId4}>`);
                                    ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`, {
                                      item,
                                      index,
                                      ui: ui.value
                                    }, () => {
                                      _push5(`${ssrInterpolate(unref(get)(item, props.descriptionKey))}`);
                                    }, _push5, _parent5, _scopeId4);
                                    _push5(`</span>`);
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                  _push5(`</span>`);
                                } else {
                                  _push5(`<!---->`);
                                }
                                _push5(`<span data-slot="itemTrailing" class="${ssrRenderClass(ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] }))}"${_scopeId4}>`);
                                ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group?.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                  item,
                                  index,
                                  ui: ui.value
                                }, () => {
                                  if (item.children && item.children.length > 0) {
                                    _push5(ssrRenderComponent(_sfc_main$e, {
                                      name: __props.childrenIcon || unref(appConfig).ui.icons.chevronRight,
                                      "data-slot": "itemTrailingIcon",
                                      class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                    }, null, _parent5, _scopeId4));
                                  } else if (item.kbds?.length) {
                                    _push5(`<span data-slot="itemTrailingKbds" class="${ssrRenderClass(ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] }))}"${_scopeId4}><!--[-->`);
                                    ssrRenderList(item.kbds, (kbd, kbdIndex) => {
                                      _push5(ssrRenderComponent(_sfc_main$3, mergeProps({
                                        key: kbdIndex,
                                        size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                      }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, _parent5, _scopeId4));
                                    });
                                    _push5(`<!--]--></span>`);
                                  } else if (group?.highlightedIcon) {
                                    _push5(ssrRenderComponent(_sfc_main$e, {
                                      name: group.highlightedIcon,
                                      "data-slot": "itemTrailingHighlightedIcon",
                                      class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                    }, null, _parent5, _scopeId4));
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                }, _push5, _parent5, _scopeId4);
                                if (!item.children?.length) {
                                  _push5(ssrRenderComponent(unref(ListboxItemIndicator), { "as-child": "" }, {
                                    default: withCtx((_3, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(ssrRenderComponent(_sfc_main$e, {
                                          name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                          "data-slot": "itemTrailingIcon",
                                          class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                        }, null, _parent6, _scopeId5));
                                      } else {
                                        return [
                                          createVNode(_sfc_main$e, {
                                            name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                            "data-slot": "itemTrailingIcon",
                                            class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                          }, null, 8, ["name", "class"])
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                } else {
                                  _push5(`<!---->`);
                                }
                                _push5(`</span>`);
                              }, _push5, _parent5, _scopeId4);
                            } else {
                              return [
                                renderSlot(_ctx.$slots, item.slot || group?.slot || "item", {
                                  item,
                                  index,
                                  ui: ui.value
                                }, () => [
                                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group?.slot ? `${group.slot}-leading` : `item-leading`, {
                                    item,
                                    index,
                                    ui: ui.value
                                  }, () => [
                                    item.loading ? (openBlock(), createBlock(_sfc_main$e, {
                                      key: 0,
                                      name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                      "data-slot": "itemLeadingIcon",
                                      class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                    }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                                      key: 1,
                                      name: item.icon,
                                      "data-slot": "itemLeadingIcon",
                                      class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                    }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                      key: 2,
                                      size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                    }, item.avatar, {
                                      "data-slot": "itemLeadingAvatar",
                                      class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                    }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$c, mergeProps({
                                      key: 3,
                                      size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                      inset: "",
                                      standalone: ""
                                    }, item.chip, {
                                      "data-slot": "itemLeadingChip",
                                      class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                    }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                                  ]),
                                  item.prefix || (item.labelHtml || unref(get)(item, props.labelKey)) || (item.suffixHtml || item.suffix) || !!slots[item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`] || (unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`]) ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    "data-slot": "itemWrapper",
                                    class: ui.value.itemWrapper({ class: [props.ui?.itemWrapper, item.ui?.itemWrapper] })
                                  }, [
                                    createVNode("span", {
                                      "data-slot": "itemLabel",
                                      class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                                    }, [
                                      renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`, {
                                        item,
                                        index,
                                        ui: ui.value
                                      }, () => [
                                        item.prefix ? (openBlock(), createBlock("span", {
                                          key: 0,
                                          "data-slot": "itemLabelPrefix",
                                          class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                        }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                        item.labelHtml ? (openBlock(), createBlock("span", {
                                          key: 1,
                                          "data-slot": "itemLabelBase",
                                          class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                          innerHTML: item.labelHtml
                                        }, null, 10, ["innerHTML"])) : (openBlock(), createBlock("span", {
                                          key: 2,
                                          "data-slot": "itemLabelBase",
                                          class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active })
                                        }, toDisplayString(unref(get)(item, props.labelKey)), 3)),
                                        item.suffixHtml ? (openBlock(), createBlock("span", {
                                          key: 3,
                                          "data-slot": "itemLabelSuffix",
                                          class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                          innerHTML: item.suffixHtml
                                        }, null, 10, ["innerHTML"])) : item.suffix ? (openBlock(), createBlock("span", {
                                          key: 4,
                                          "data-slot": "itemLabelSuffix",
                                          class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active })
                                        }, toDisplayString(item.suffix), 3)) : createCommentVNode("", true)
                                      ])
                                    ], 2),
                                    unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`] ? (openBlock(), createBlock("span", {
                                      key: 0,
                                      "data-slot": "itemDescription",
                                      class: ui.value.itemDescription({ class: [props.ui?.itemDescription, item.ui?.itemDescription] })
                                    }, [
                                      renderSlot(_ctx.$slots, item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`, {
                                        item,
                                        index,
                                        ui: ui.value
                                      }, () => [
                                        createTextVNode(toDisplayString(unref(get)(item, props.descriptionKey)), 1)
                                      ])
                                    ], 2)) : createCommentVNode("", true)
                                  ], 2)) : createCommentVNode("", true),
                                  createVNode("span", {
                                    "data-slot": "itemTrailing",
                                    class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                                  }, [
                                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group?.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                      item,
                                      index,
                                      ui: ui.value
                                    }, () => [
                                      item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$e, {
                                        key: 0,
                                        name: __props.childrenIcon || unref(appConfig).ui.icons.chevronRight,
                                        "data-slot": "itemTrailingIcon",
                                        class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                      }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                        key: 1,
                                        "data-slot": "itemTrailingKbds",
                                        class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                      }, [
                                        (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                          return openBlock(), createBlock(_sfc_main$3, mergeProps({
                                            key: kbdIndex,
                                            size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                          }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                        }), 128))
                                      ], 2)) : group?.highlightedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                                        key: 2,
                                        name: group.highlightedIcon,
                                        "data-slot": "itemTrailingHighlightedIcon",
                                        class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                      }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                    ]),
                                    !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                      key: 0,
                                      "as-child": ""
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_sfc_main$e, {
                                          name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                          "data-slot": "itemTrailingIcon",
                                          class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                        }, null, 8, ["name", "class"])
                                      ]),
                                      _: 2
                                    }, 1024)) : createCommentVNode("", true)
                                  ], 2)
                                ])
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_sfc_main$a, mergeProps(slotProps, {
                            "data-slot": "item",
                            class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                          }), {
                            default: withCtx(() => [
                              renderSlot(_ctx.$slots, item.slot || group?.slot || "item", {
                                item,
                                index,
                                ui: ui.value
                              }, () => [
                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group?.slot ? `${group.slot}-leading` : `item-leading`, {
                                  item,
                                  index,
                                  ui: ui.value
                                }, () => [
                                  item.loading ? (openBlock(), createBlock(_sfc_main$e, {
                                    key: 0,
                                    name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                    "data-slot": "itemLeadingIcon",
                                    class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                  }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                                    key: 1,
                                    name: item.icon,
                                    "data-slot": "itemLeadingIcon",
                                    class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                  }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                    key: 2,
                                    size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                  }, item.avatar, {
                                    "data-slot": "itemLeadingAvatar",
                                    class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                  }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$c, mergeProps({
                                    key: 3,
                                    size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                    inset: "",
                                    standalone: ""
                                  }, item.chip, {
                                    "data-slot": "itemLeadingChip",
                                    class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                  }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                                ]),
                                item.prefix || (item.labelHtml || unref(get)(item, props.labelKey)) || (item.suffixHtml || item.suffix) || !!slots[item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`] || (unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`]) ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  "data-slot": "itemWrapper",
                                  class: ui.value.itemWrapper({ class: [props.ui?.itemWrapper, item.ui?.itemWrapper] })
                                }, [
                                  createVNode("span", {
                                    "data-slot": "itemLabel",
                                    class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                                  }, [
                                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`, {
                                      item,
                                      index,
                                      ui: ui.value
                                    }, () => [
                                      item.prefix ? (openBlock(), createBlock("span", {
                                        key: 0,
                                        "data-slot": "itemLabelPrefix",
                                        class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                      }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                      item.labelHtml ? (openBlock(), createBlock("span", {
                                        key: 1,
                                        "data-slot": "itemLabelBase",
                                        class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                        innerHTML: item.labelHtml
                                      }, null, 10, ["innerHTML"])) : (openBlock(), createBlock("span", {
                                        key: 2,
                                        "data-slot": "itemLabelBase",
                                        class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active })
                                      }, toDisplayString(unref(get)(item, props.labelKey)), 3)),
                                      item.suffixHtml ? (openBlock(), createBlock("span", {
                                        key: 3,
                                        "data-slot": "itemLabelSuffix",
                                        class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                        innerHTML: item.suffixHtml
                                      }, null, 10, ["innerHTML"])) : item.suffix ? (openBlock(), createBlock("span", {
                                        key: 4,
                                        "data-slot": "itemLabelSuffix",
                                        class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active })
                                      }, toDisplayString(item.suffix), 3)) : createCommentVNode("", true)
                                    ])
                                  ], 2),
                                  unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`] ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    "data-slot": "itemDescription",
                                    class: ui.value.itemDescription({ class: [props.ui?.itemDescription, item.ui?.itemDescription] })
                                  }, [
                                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`, {
                                      item,
                                      index,
                                      ui: ui.value
                                    }, () => [
                                      createTextVNode(toDisplayString(unref(get)(item, props.descriptionKey)), 1)
                                    ])
                                  ], 2)) : createCommentVNode("", true)
                                ], 2)) : createCommentVNode("", true),
                                createVNode("span", {
                                  "data-slot": "itemTrailing",
                                  class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                                }, [
                                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group?.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                    item,
                                    index,
                                    ui: ui.value
                                  }, () => [
                                    item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$e, {
                                      key: 0,
                                      name: __props.childrenIcon || unref(appConfig).ui.icons.chevronRight,
                                      "data-slot": "itemTrailingIcon",
                                      class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                    }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                      key: 1,
                                      "data-slot": "itemTrailingKbds",
                                      class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                    }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                        return openBlock(), createBlock(_sfc_main$3, mergeProps({
                                          key: kbdIndex,
                                          size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                        }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                      }), 128))
                                    ], 2)) : group?.highlightedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                                      key: 2,
                                      name: group.highlightedIcon,
                                      "data-slot": "itemTrailingHighlightedIcon",
                                      class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                    }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                  ]),
                                  !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                    key: 0,
                                    "as-child": ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_sfc_main$e, {
                                        name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                        "data-slot": "itemTrailingIcon",
                                        class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                      }, null, 8, ["name", "class"])
                                    ]),
                                    _: 2
                                  }, 1024)) : createCommentVNode("", true)
                                ], 2)
                              ])
                            ]),
                            _: 2
                          }, 1040, ["class"])
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(ListboxItem), {
                      value: props.valueKey ? unref(get)(item, props.valueKey) : unref(omit)(item, ["matches", "group", "onSelect", "labelHtml", "suffixHtml", "children"]),
                      disabled: item.disabled,
                      "as-child": "",
                      onSelect: ($event) => onSelect($event, item)
                    }, {
                      default: withCtx(() => [
                        createVNode(_sfc_main$a, mergeProps(slotProps, {
                          "data-slot": "item",
                          class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                        }), {
                          default: withCtx(() => [
                            renderSlot(_ctx.$slots, item.slot || group?.slot || "item", {
                              item,
                              index,
                              ui: ui.value
                            }, () => [
                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group?.slot ? `${group.slot}-leading` : `item-leading`, {
                                item,
                                index,
                                ui: ui.value
                              }, () => [
                                item.loading ? (openBlock(), createBlock(_sfc_main$e, {
                                  key: 0,
                                  name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                  "data-slot": "itemLeadingIcon",
                                  class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                                  key: 1,
                                  name: item.icon,
                                  "data-slot": "itemLeadingIcon",
                                  class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                  key: 2,
                                  size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                }, item.avatar, {
                                  "data-slot": "itemLeadingAvatar",
                                  class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$c, mergeProps({
                                  key: 3,
                                  size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                  inset: "",
                                  standalone: ""
                                }, item.chip, {
                                  "data-slot": "itemLeadingChip",
                                  class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                              ]),
                              item.prefix || (item.labelHtml || unref(get)(item, props.labelKey)) || (item.suffixHtml || item.suffix) || !!slots[item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`] || (unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`]) ? (openBlock(), createBlock("span", {
                                key: 0,
                                "data-slot": "itemWrapper",
                                class: ui.value.itemWrapper({ class: [props.ui?.itemWrapper, item.ui?.itemWrapper] })
                              }, [
                                createVNode("span", {
                                  "data-slot": "itemLabel",
                                  class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                                }, [
                                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`, {
                                    item,
                                    index,
                                    ui: ui.value
                                  }, () => [
                                    item.prefix ? (openBlock(), createBlock("span", {
                                      key: 0,
                                      "data-slot": "itemLabelPrefix",
                                      class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                    }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                    item.labelHtml ? (openBlock(), createBlock("span", {
                                      key: 1,
                                      "data-slot": "itemLabelBase",
                                      class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                      innerHTML: item.labelHtml
                                    }, null, 10, ["innerHTML"])) : (openBlock(), createBlock("span", {
                                      key: 2,
                                      "data-slot": "itemLabelBase",
                                      class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active })
                                    }, toDisplayString(unref(get)(item, props.labelKey)), 3)),
                                    item.suffixHtml ? (openBlock(), createBlock("span", {
                                      key: 3,
                                      "data-slot": "itemLabelSuffix",
                                      class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                      innerHTML: item.suffixHtml
                                    }, null, 10, ["innerHTML"])) : item.suffix ? (openBlock(), createBlock("span", {
                                      key: 4,
                                      "data-slot": "itemLabelSuffix",
                                      class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active })
                                    }, toDisplayString(item.suffix), 3)) : createCommentVNode("", true)
                                  ])
                                ], 2),
                                unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`] ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  "data-slot": "itemDescription",
                                  class: ui.value.itemDescription({ class: [props.ui?.itemDescription, item.ui?.itemDescription] })
                                }, [
                                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`, {
                                    item,
                                    index,
                                    ui: ui.value
                                  }, () => [
                                    createTextVNode(toDisplayString(unref(get)(item, props.descriptionKey)), 1)
                                  ])
                                ], 2)) : createCommentVNode("", true)
                              ], 2)) : createCommentVNode("", true),
                              createVNode("span", {
                                "data-slot": "itemTrailing",
                                class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                              }, [
                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group?.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                  item,
                                  index,
                                  ui: ui.value
                                }, () => [
                                  item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$e, {
                                    key: 0,
                                    name: __props.childrenIcon || unref(appConfig).ui.icons.chevronRight,
                                    "data-slot": "itemTrailingIcon",
                                    class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                  }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                    key: 1,
                                    "data-slot": "itemTrailingKbds",
                                    class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                  }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                      return openBlock(), createBlock(_sfc_main$3, mergeProps({
                                        key: kbdIndex,
                                        size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                      }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                    }), 128))
                                  ], 2)) : group?.highlightedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                                    key: 2,
                                    name: group.highlightedIcon,
                                    "data-slot": "itemTrailingHighlightedIcon",
                                    class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                ]),
                                !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                  key: 0,
                                  "as-child": ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_sfc_main$e, {
                                      name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                      "data-slot": "itemTrailingIcon",
                                      class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                    }, null, 8, ["name", "class"])
                                  ]),
                                  _: 2
                                }, 1024)) : createCommentVNode("", true)
                              ], 2)
                            ])
                          ]),
                          _: 2
                        }, 1040, ["class"])
                      ]),
                      _: 2
                    }, 1032, ["value", "disabled", "onSelect"])
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_sfc_main$9, mergeProps(unref(pickLinkProps)(item), { custom: "" }), {
                default: withCtx(({ active, ...slotProps }) => [
                  createVNode(unref(ListboxItem), {
                    value: props.valueKey ? unref(get)(item, props.valueKey) : unref(omit)(item, ["matches", "group", "onSelect", "labelHtml", "suffixHtml", "children"]),
                    disabled: item.disabled,
                    "as-child": "",
                    onSelect: ($event) => onSelect($event, item)
                  }, {
                    default: withCtx(() => [
                      createVNode(_sfc_main$a, mergeProps(slotProps, {
                        "data-slot": "item",
                        class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                      }), {
                        default: withCtx(() => [
                          renderSlot(_ctx.$slots, item.slot || group?.slot || "item", {
                            item,
                            index,
                            ui: ui.value
                          }, () => [
                            renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group?.slot ? `${group.slot}-leading` : `item-leading`, {
                              item,
                              index,
                              ui: ui.value
                            }, () => [
                              item.loading ? (openBlock(), createBlock(_sfc_main$e, {
                                key: 0,
                                name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                "data-slot": "itemLeadingIcon",
                                class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                              }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                                key: 1,
                                name: item.icon,
                                "data-slot": "itemLeadingIcon",
                                class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                              }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                key: 2,
                                size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                              }, item.avatar, {
                                "data-slot": "itemLeadingAvatar",
                                class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                              }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$c, mergeProps({
                                key: 3,
                                size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                inset: "",
                                standalone: ""
                              }, item.chip, {
                                "data-slot": "itemLeadingChip",
                                class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                              }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                            ]),
                            item.prefix || (item.labelHtml || unref(get)(item, props.labelKey)) || (item.suffixHtml || item.suffix) || !!slots[item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`] || (unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`]) ? (openBlock(), createBlock("span", {
                              key: 0,
                              "data-slot": "itemWrapper",
                              class: ui.value.itemWrapper({ class: [props.ui?.itemWrapper, item.ui?.itemWrapper] })
                            }, [
                              createVNode("span", {
                                "data-slot": "itemLabel",
                                class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                              }, [
                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group?.slot ? `${group.slot}-label` : `item-label`, {
                                  item,
                                  index,
                                  ui: ui.value
                                }, () => [
                                  item.prefix ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    "data-slot": "itemLabelPrefix",
                                    class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                  }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                  item.labelHtml ? (openBlock(), createBlock("span", {
                                    key: 1,
                                    "data-slot": "itemLabelBase",
                                    class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                    innerHTML: item.labelHtml
                                  }, null, 10, ["innerHTML"])) : (openBlock(), createBlock("span", {
                                    key: 2,
                                    "data-slot": "itemLabelBase",
                                    class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active })
                                  }, toDisplayString(unref(get)(item, props.labelKey)), 3)),
                                  item.suffixHtml ? (openBlock(), createBlock("span", {
                                    key: 3,
                                    "data-slot": "itemLabelSuffix",
                                    class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                    innerHTML: item.suffixHtml
                                  }, null, 10, ["innerHTML"])) : item.suffix ? (openBlock(), createBlock("span", {
                                    key: 4,
                                    "data-slot": "itemLabelSuffix",
                                    class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active })
                                  }, toDisplayString(item.suffix), 3)) : createCommentVNode("", true)
                                ])
                              ], 2),
                              unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`] ? (openBlock(), createBlock("span", {
                                key: 0,
                                "data-slot": "itemDescription",
                                class: ui.value.itemDescription({ class: [props.ui?.itemDescription, item.ui?.itemDescription] })
                              }, [
                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-description` : group?.slot ? `${group.slot}-description` : `item-description`, {
                                  item,
                                  index,
                                  ui: ui.value
                                }, () => [
                                  createTextVNode(toDisplayString(unref(get)(item, props.descriptionKey)), 1)
                                ])
                              ], 2)) : createCommentVNode("", true)
                            ], 2)) : createCommentVNode("", true),
                            createVNode("span", {
                              "data-slot": "itemTrailing",
                              class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                            }, [
                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group?.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                item,
                                index,
                                ui: ui.value
                              }, () => [
                                item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$e, {
                                  key: 0,
                                  name: __props.childrenIcon || unref(appConfig).ui.icons.chevronRight,
                                  "data-slot": "itemTrailingIcon",
                                  class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                  key: 1,
                                  "data-slot": "itemTrailingKbds",
                                  class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                }, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                    return openBlock(), createBlock(_sfc_main$3, mergeProps({
                                      key: kbdIndex,
                                      size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                    }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                  }), 128))
                                ], 2)) : group?.highlightedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                                  key: 2,
                                  name: group.highlightedIcon,
                                  "data-slot": "itemTrailingHighlightedIcon",
                                  class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                              ]),
                              !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                key: 0,
                                "as-child": ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_sfc_main$e, {
                                    name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                    "data-slot": "itemTrailingIcon",
                                    class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                  }, null, 8, ["name", "class"])
                                ]),
                                _: 2
                              }, 1024)) : createCommentVNode("", true)
                            ], 2)
                          ])
                        ]),
                        _: 2
                      }, 1040, ["class"])
                    ]),
                    _: 2
                  }, 1032, ["value", "disabled", "onSelect"])
                ]),
                _: 2
              }, 1040)
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(ssrRenderComponent(unref(ListboxRoot), mergeProps({ ...unref(rootProps), ..._ctx.$attrs }, {
        ref_key: "rootRef",
        ref: rootRef,
        "selection-behavior": __props.selectionBehavior,
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (__props.input) {
              _push2(ssrRenderComponent(unref(ListboxFilter), {
                modelValue: searchTerm.value,
                "onUpdate:modelValue": ($event) => searchTerm.value = $event,
                "as-child": ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_sfc_main$4, mergeProps({
                      variant: "none",
                      size: __props.size
                    }, typeof props.input === "object" ? props.input : {}, {
                      placeholder: placeholder.value,
                      autofocus: __props.autofocus,
                      loading: __props.loading,
                      "loading-icon": __props.loadingIcon,
                      "trailing-icon": __props.trailingIcon,
                      icon: __props.icon || unref(appConfig).ui.icons.search,
                      "data-slot": "input",
                      class: ui.value.input({ class: props.ui?.input }),
                      onKeydown: onBackspace
                    }), createSlots({ _: 2 }, [
                      history.value?.length && (__props.back || !!slots.back) ? {
                        name: "leading",
                        fn: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            ssrRenderSlot(_ctx.$slots, "back", { ui: ui.value }, () => {
                              _push4(ssrRenderComponent(_sfc_main$8, mergeProps({
                                size: __props.size,
                                icon: __props.backIcon || unref(appConfig).ui.icons.arrowLeft,
                                color: "neutral",
                                variant: "link",
                                "aria-label": unref(t)("commandPalette.back")
                              }, typeof __props.back === "object" ? __props.back : {}, {
                                "data-slot": "back",
                                class: ui.value.back({ class: props.ui?.back }),
                                onClick: navigateBack
                              }), null, _parent4, _scopeId3));
                            }, _push4, _parent4, _scopeId3);
                          } else {
                            return [
                              renderSlot(_ctx.$slots, "back", { ui: ui.value }, () => [
                                createVNode(_sfc_main$8, mergeProps({
                                  size: __props.size,
                                  icon: __props.backIcon || unref(appConfig).ui.icons.arrowLeft,
                                  color: "neutral",
                                  variant: "link",
                                  "aria-label": unref(t)("commandPalette.back")
                                }, typeof __props.back === "object" ? __props.back : {}, {
                                  "data-slot": "back",
                                  class: ui.value.back({ class: props.ui?.back }),
                                  onClick: navigateBack
                                }), null, 16, ["size", "icon", "aria-label", "class"])
                              ])
                            ];
                          }
                        }),
                        key: "0"
                      } : void 0,
                      __props.close || !!slots.close ? {
                        name: "trailing",
                        fn: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            ssrRenderSlot(_ctx.$slots, "close", { ui: ui.value }, () => {
                              if (__props.close) {
                                _push4(ssrRenderComponent(_sfc_main$8, mergeProps({
                                  size: __props.size,
                                  icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                  color: "neutral",
                                  variant: "ghost",
                                  "aria-label": unref(t)("commandPalette.close")
                                }, typeof __props.close === "object" ? __props.close : {}, {
                                  "data-slot": "close",
                                  class: ui.value.close({ class: props.ui?.close }),
                                  onClick: ($event) => emits("update:open", false)
                                }), null, _parent4, _scopeId3));
                              } else {
                                _push4(`<!---->`);
                              }
                            }, _push4, _parent4, _scopeId3);
                          } else {
                            return [
                              renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                                __props.close ? (openBlock(), createBlock(_sfc_main$8, mergeProps({
                                  key: 0,
                                  size: __props.size,
                                  icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                  color: "neutral",
                                  variant: "ghost",
                                  "aria-label": unref(t)("commandPalette.close")
                                }, typeof __props.close === "object" ? __props.close : {}, {
                                  "data-slot": "close",
                                  class: ui.value.close({ class: props.ui?.close }),
                                  onClick: ($event) => emits("update:open", false)
                                }), null, 16, ["size", "icon", "aria-label", "class", "onClick"])) : createCommentVNode("", true)
                              ])
                            ];
                          }
                        }),
                        key: "1"
                      } : void 0
                    ]), _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_sfc_main$4, mergeProps({
                        variant: "none",
                        size: __props.size
                      }, typeof props.input === "object" ? props.input : {}, {
                        placeholder: placeholder.value,
                        autofocus: __props.autofocus,
                        loading: __props.loading,
                        "loading-icon": __props.loadingIcon,
                        "trailing-icon": __props.trailingIcon,
                        icon: __props.icon || unref(appConfig).ui.icons.search,
                        "data-slot": "input",
                        class: ui.value.input({ class: props.ui?.input }),
                        onKeydown: withKeys(onBackspace, ["backspace"])
                      }), createSlots({ _: 2 }, [
                        history.value?.length && (__props.back || !!slots.back) ? {
                          name: "leading",
                          fn: withCtx(() => [
                            renderSlot(_ctx.$slots, "back", { ui: ui.value }, () => [
                              createVNode(_sfc_main$8, mergeProps({
                                size: __props.size,
                                icon: __props.backIcon || unref(appConfig).ui.icons.arrowLeft,
                                color: "neutral",
                                variant: "link",
                                "aria-label": unref(t)("commandPalette.back")
                              }, typeof __props.back === "object" ? __props.back : {}, {
                                "data-slot": "back",
                                class: ui.value.back({ class: props.ui?.back }),
                                onClick: navigateBack
                              }), null, 16, ["size", "icon", "aria-label", "class"])
                            ])
                          ]),
                          key: "0"
                        } : void 0,
                        __props.close || !!slots.close ? {
                          name: "trailing",
                          fn: withCtx(() => [
                            renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                              __props.close ? (openBlock(), createBlock(_sfc_main$8, mergeProps({
                                key: 0,
                                size: __props.size,
                                icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                color: "neutral",
                                variant: "ghost",
                                "aria-label": unref(t)("commandPalette.close")
                              }, typeof __props.close === "object" ? __props.close : {}, {
                                "data-slot": "close",
                                class: ui.value.close({ class: props.ui?.close }),
                                onClick: ($event) => emits("update:open", false)
                              }), null, 16, ["size", "icon", "aria-label", "class", "onClick"])) : createCommentVNode("", true)
                            ])
                          ]),
                          key: "1"
                        } : void 0
                      ]), 1040, ["size", "placeholder", "autofocus", "loading", "loading-icon", "trailing-icon", "icon", "class"])
                    ];
                  }
                }),
                _: 3
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(unref(ListboxContent), {
              "data-slot": "content",
              class: ui.value.content({ class: props.ui?.content })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (filteredGroups.value?.length) {
                    _push3(`<div role="presentation" data-slot="viewport" class="${ssrRenderClass(ui.value.viewport({ class: props.ui?.viewport }))}"${_scopeId2}>`);
                    if (!!__props.virtualize) {
                      _push3(ssrRenderComponent(unref(ListboxVirtualizer), mergeProps({
                        options: filteredItems.value,
                        "text-content": (item2) => unref(get)(item2, props.labelKey)
                      }, virtualizerProps.value), {
                        default: withCtx(({ option: item, virtualItem }, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(unref(ReuseItemTemplate), {
                              item,
                              index: virtualItem.index
                            }, null, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(unref(ReuseItemTemplate), {
                                item,
                                index: virtualItem.index
                              }, null, 8, ["item", "index"])
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else {
                      _push3(`<!--[-->`);
                      ssrRenderList(filteredGroups.value, (group) => {
                        _push3(ssrRenderComponent(unref(ListboxGroup), {
                          key: `group-${group.id}`,
                          "data-slot": "group",
                          class: ui.value.group({ class: props.ui?.group })
                        }, {
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              if (unref(get)(group, props.labelKey)) {
                                _push4(ssrRenderComponent(unref(ListboxGroupLabel), {
                                  "data-slot": "label",
                                  class: ui.value.label({ class: props.ui?.label })
                                }, {
                                  default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                    if (_push5) {
                                      _push5(`${ssrInterpolate(unref(get)(group, props.labelKey))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(unref(get)(group, props.labelKey)), 1)
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent4, _scopeId3));
                              } else {
                                _push4(`<!---->`);
                              }
                              _push4(`<!--[-->`);
                              ssrRenderList(group.items, (item, index) => {
                                _push4(ssrRenderComponent(unref(ReuseItemTemplate), {
                                  key: `group-${group.id}-${index}`,
                                  item,
                                  index,
                                  group
                                }, null, _parent4, _scopeId3));
                              });
                              _push4(`<!--]-->`);
                            } else {
                              return [
                                unref(get)(group, props.labelKey) ? (openBlock(), createBlock(unref(ListboxGroupLabel), {
                                  key: 0,
                                  "data-slot": "label",
                                  class: ui.value.label({ class: props.ui?.label })
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(get)(group, props.labelKey)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["class"])) : createCommentVNode("", true),
                                (openBlock(true), createBlock(Fragment, null, renderList(group.items, (item, index) => {
                                  return openBlock(), createBlock(unref(ReuseItemTemplate), {
                                    key: `group-${group.id}-${index}`,
                                    item,
                                    index,
                                    group
                                  }, null, 8, ["item", "index", "group"]);
                                }), 128))
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                      });
                      _push3(`<!--]-->`);
                    }
                    _push3(`</div>`);
                  } else {
                    _push3(`<div data-slot="empty" class="${ssrRenderClass(ui.value.empty({ class: props.ui?.empty }))}"${_scopeId2}>`);
                    ssrRenderSlot(_ctx.$slots, "empty", { searchTerm: searchTerm.value }, () => {
                      _push3(`${ssrInterpolate(searchTerm.value ? unref(t)("commandPalette.noMatch", { searchTerm: searchTerm.value }) : unref(t)("commandPalette.noData"))}`);
                    }, _push3, _parent3, _scopeId2);
                    _push3(`</div>`);
                  }
                } else {
                  return [
                    filteredGroups.value?.length ? (openBlock(), createBlock("div", {
                      key: 0,
                      role: "presentation",
                      "data-slot": "viewport",
                      class: ui.value.viewport({ class: props.ui?.viewport })
                    }, [
                      !!__props.virtualize ? (openBlock(), createBlock(unref(ListboxVirtualizer), mergeProps({
                        key: 0,
                        options: filteredItems.value,
                        "text-content": (item2) => unref(get)(item2, props.labelKey)
                      }, virtualizerProps.value), {
                        default: withCtx(({ option: item, virtualItem }) => [
                          createVNode(unref(ReuseItemTemplate), {
                            item,
                            index: virtualItem.index
                          }, null, 8, ["item", "index"])
                        ]),
                        _: 1
                      }, 16, ["options", "text-content"])) : (openBlock(true), createBlock(Fragment, { key: 1 }, renderList(filteredGroups.value, (group) => {
                        return openBlock(), createBlock(unref(ListboxGroup), {
                          key: `group-${group.id}`,
                          "data-slot": "group",
                          class: ui.value.group({ class: props.ui?.group })
                        }, {
                          default: withCtx(() => [
                            unref(get)(group, props.labelKey) ? (openBlock(), createBlock(unref(ListboxGroupLabel), {
                              key: 0,
                              "data-slot": "label",
                              class: ui.value.label({ class: props.ui?.label })
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(get)(group, props.labelKey)), 1)
                              ]),
                              _: 2
                            }, 1032, ["class"])) : createCommentVNode("", true),
                            (openBlock(true), createBlock(Fragment, null, renderList(group.items, (item, index) => {
                              return openBlock(), createBlock(unref(ReuseItemTemplate), {
                                key: `group-${group.id}-${index}`,
                                item,
                                index,
                                group
                              }, null, 8, ["item", "index", "group"]);
                            }), 128))
                          ]),
                          _: 2
                        }, 1032, ["class"]);
                      }), 128))
                    ], 2)) : (openBlock(), createBlock("div", {
                      key: 1,
                      "data-slot": "empty",
                      class: ui.value.empty({ class: props.ui?.empty })
                    }, [
                      renderSlot(_ctx.$slots, "empty", { searchTerm: searchTerm.value }, () => [
                        createTextVNode(toDisplayString(searchTerm.value ? unref(t)("commandPalette.noMatch", { searchTerm: searchTerm.value }) : unref(t)("commandPalette.noData")), 1)
                      ])
                    ], 2))
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
            if (!!slots.footer) {
              _push2(`<div data-slot="footer" class="${ssrRenderClass(ui.value.footer({ class: props.ui?.footer }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "footer", { ui: ui.value }, null, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              __props.input ? (openBlock(), createBlock(unref(ListboxFilter), {
                key: 0,
                modelValue: searchTerm.value,
                "onUpdate:modelValue": ($event) => searchTerm.value = $event,
                "as-child": ""
              }, {
                default: withCtx(() => [
                  createVNode(_sfc_main$4, mergeProps({
                    variant: "none",
                    size: __props.size
                  }, typeof props.input === "object" ? props.input : {}, {
                    placeholder: placeholder.value,
                    autofocus: __props.autofocus,
                    loading: __props.loading,
                    "loading-icon": __props.loadingIcon,
                    "trailing-icon": __props.trailingIcon,
                    icon: __props.icon || unref(appConfig).ui.icons.search,
                    "data-slot": "input",
                    class: ui.value.input({ class: props.ui?.input }),
                    onKeydown: withKeys(onBackspace, ["backspace"])
                  }), createSlots({ _: 2 }, [
                    history.value?.length && (__props.back || !!slots.back) ? {
                      name: "leading",
                      fn: withCtx(() => [
                        renderSlot(_ctx.$slots, "back", { ui: ui.value }, () => [
                          createVNode(_sfc_main$8, mergeProps({
                            size: __props.size,
                            icon: __props.backIcon || unref(appConfig).ui.icons.arrowLeft,
                            color: "neutral",
                            variant: "link",
                            "aria-label": unref(t)("commandPalette.back")
                          }, typeof __props.back === "object" ? __props.back : {}, {
                            "data-slot": "back",
                            class: ui.value.back({ class: props.ui?.back }),
                            onClick: navigateBack
                          }), null, 16, ["size", "icon", "aria-label", "class"])
                        ])
                      ]),
                      key: "0"
                    } : void 0,
                    __props.close || !!slots.close ? {
                      name: "trailing",
                      fn: withCtx(() => [
                        renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                          __props.close ? (openBlock(), createBlock(_sfc_main$8, mergeProps({
                            key: 0,
                            size: __props.size,
                            icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                            color: "neutral",
                            variant: "ghost",
                            "aria-label": unref(t)("commandPalette.close")
                          }, typeof __props.close === "object" ? __props.close : {}, {
                            "data-slot": "close",
                            class: ui.value.close({ class: props.ui?.close }),
                            onClick: ($event) => emits("update:open", false)
                          }), null, 16, ["size", "icon", "aria-label", "class", "onClick"])) : createCommentVNode("", true)
                        ])
                      ]),
                      key: "1"
                    } : void 0
                  ]), 1040, ["size", "placeholder", "autofocus", "loading", "loading-icon", "trailing-icon", "icon", "class"])
                ]),
                _: 3
              }, 8, ["modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
              createVNode(unref(ListboxContent), {
                "data-slot": "content",
                class: ui.value.content({ class: props.ui?.content })
              }, {
                default: withCtx(() => [
                  filteredGroups.value?.length ? (openBlock(), createBlock("div", {
                    key: 0,
                    role: "presentation",
                    "data-slot": "viewport",
                    class: ui.value.viewport({ class: props.ui?.viewport })
                  }, [
                    !!__props.virtualize ? (openBlock(), createBlock(unref(ListboxVirtualizer), mergeProps({
                      key: 0,
                      options: filteredItems.value,
                      "text-content": (item2) => unref(get)(item2, props.labelKey)
                    }, virtualizerProps.value), {
                      default: withCtx(({ option: item, virtualItem }) => [
                        createVNode(unref(ReuseItemTemplate), {
                          item,
                          index: virtualItem.index
                        }, null, 8, ["item", "index"])
                      ]),
                      _: 1
                    }, 16, ["options", "text-content"])) : (openBlock(true), createBlock(Fragment, { key: 1 }, renderList(filteredGroups.value, (group) => {
                      return openBlock(), createBlock(unref(ListboxGroup), {
                        key: `group-${group.id}`,
                        "data-slot": "group",
                        class: ui.value.group({ class: props.ui?.group })
                      }, {
                        default: withCtx(() => [
                          unref(get)(group, props.labelKey) ? (openBlock(), createBlock(unref(ListboxGroupLabel), {
                            key: 0,
                            "data-slot": "label",
                            class: ui.value.label({ class: props.ui?.label })
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(get)(group, props.labelKey)), 1)
                            ]),
                            _: 2
                          }, 1032, ["class"])) : createCommentVNode("", true),
                          (openBlock(true), createBlock(Fragment, null, renderList(group.items, (item, index) => {
                            return openBlock(), createBlock(unref(ReuseItemTemplate), {
                              key: `group-${group.id}-${index}`,
                              item,
                              index,
                              group
                            }, null, 8, ["item", "index", "group"]);
                          }), 128))
                        ]),
                        _: 2
                      }, 1032, ["class"]);
                    }), 128))
                  ], 2)) : (openBlock(), createBlock("div", {
                    key: 1,
                    "data-slot": "empty",
                    class: ui.value.empty({ class: props.ui?.empty })
                  }, [
                    renderSlot(_ctx.$slots, "empty", { searchTerm: searchTerm.value }, () => [
                      createTextVNode(toDisplayString(searchTerm.value ? unref(t)("commandPalette.noMatch", { searchTerm: searchTerm.value }) : unref(t)("commandPalette.noData")), 1)
                    ])
                  ], 2))
                ]),
                _: 3
              }, 8, ["class"]),
              !!slots.footer ? (openBlock(), createBlock("div", {
                key: 1,
                "data-slot": "footer",
                class: ui.value.footer({ class: props.ui?.footer })
              }, [
                renderSlot(_ctx.$slots, "footer", { ui: ui.value })
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/CommandPalette.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminCommandPalette",
  __ssrInlineRender: true,
  setup(__props) {
    const { isOpen, close } = useCommandPalette();
    const router = useRouter();
    const overlay = useOverlay();
    const batchStore = useBatchStore();
    const bottleStore = useBottleStore();
    const recipeStore = useRecipeStore();
    const itemStore = useItemStore();
    const cocktailStore = useCocktailStore();
    const contactStore = useContactStore();
    const vesselStore = useVesselStore();
    usePurchaseOrderStore();
    const { meta, ctrl } = useMagicKeys();
    useEventListener("keydown", (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen.value = !isOpen.value;
      }
    });
    computed(() => void 0);
    const pages = [
      { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/admin/dashboard" },
      { label: "Batches", icon: "i-lucide-flask-conical", to: "/admin/batch" },
      { label: "Recipes", icon: "i-lucide-book-open", to: "/admin/recipes" },
      { label: "Vessels", icon: "i-lucide-container", to: "/admin/vessels" },
      { label: "Production", icon: "i-lucide-factory", to: "/admin/production" },
      { label: "Proofing", icon: "i-lucide-calculator", to: "/admin/proofing" },
      { label: "Bottles", icon: "i-lucide-wine", to: "/admin/bottles" },
      { label: "Cocktails", icon: "i-lucide-martini", to: "/admin/cocktails" },
      { label: "Cheat Sheets", icon: "i-lucide-file-text", to: "/admin/cocktails/grid" },
      { label: "Inventory", icon: "i-lucide-warehouse", to: "/admin/inventory" },
      { label: "Bottling Supplies", icon: "i-lucide-wine", to: "/admin/inventory/bottling" },
      { label: "Base Ingredients", icon: "i-lucide-wheat", to: "/admin/inventory/ingredients" },
      { label: "Botanicals", icon: "i-lucide-leaf", to: "/admin/inventory/botanicals" },
      { label: "Other Supplies", icon: "i-lucide-box", to: "/admin/inventory/other" },
      { label: "Count Inventory", icon: "i-lucide-clipboard-check", to: "/admin/inventory/input" },
      { label: "Print Inventory Sheet", icon: "i-lucide-printer", to: "/admin/inventory/print" },
      { label: "Items", icon: "i-lucide-package", to: "/admin/items" },
      { label: "Bottle Inventory", icon: "i-lucide-clipboard-list", to: "/admin/bottles/inventory" },
      { label: "Purchase Orders", icon: "i-lucide-receipt", to: "/admin/purchaseOrders" },
      { label: "Contacts", icon: "i-lucide-users", to: "/admin/contacts" },
      { label: "Controls", icon: "i-lucide-settings", to: "/admin/controls" }
    ];
    const actions = [
      {
        label: "New Batch",
        icon: "i-lucide-plus",
        suffix: "Create a new batch",
        onSelect: () => openPanel("PanelBatch")
      },
      {
        label: "New Production",
        icon: "i-lucide-plus",
        suffix: "Record a production run",
        onSelect: () => openPanel("PanelProduction")
      },
      {
        label: "New Purchase Order",
        icon: "i-lucide-plus",
        suffix: "Create a purchase order",
        onSelect: () => openPanel("PanelPurchaseOrder")
      },
      {
        label: "New Contact",
        icon: "i-lucide-plus",
        suffix: "Add a new contact",
        onSelect: () => openPanel("PanelContact")
      }
    ];
    async function openPanel(name) {
      close();
      const components = {
        PanelBatch: __nuxt_component_0,
        PanelProduction: __nuxt_component_1,
        PanelPurchaseOrder: __nuxt_component_2,
        PanelContact: __nuxt_component_3
      };
      const comp = components[name];
      if (comp) {
        const panel = overlay.create(comp);
        await panel.open();
      }
    }
    function navigate(to) {
      close();
      router.push(to);
    }
    const groups = computed(() => {
      const g = [
        {
          id: "pages",
          label: "Pages",
          items: pages.map((p) => ({
            ...p,
            onSelect: () => navigate(p.to)
          })),
          ignoreFilter: true,
          postFilter: (searchTerm, items) => {
            if (!searchTerm) return items;
            const term = searchTerm.toLowerCase();
            return items.filter((i) => i.label.toLowerCase().includes(term));
          }
        },
        {
          id: "actions",
          label: "Quick Actions",
          items: actions.map((a) => ({
            ...a,
            onSelect: () => {
              a.onSelect();
            }
          })),
          ignoreFilter: true,
          postFilter: (searchTerm, items) => {
            if (!searchTerm) return items;
            const term = searchTerm.toLowerCase();
            return items.filter((i) => i.label.toLowerCase().includes(term) || i.suffix?.toLowerCase().includes(term));
          }
        },
        {
          id: "batches",
          label: "Batches",
          items: batchStore.batches.map((b) => ({
            label: recipeStore.getRecipeById(b.recipe)?.name || "Unknown Recipe",
            suffix: b.status,
            icon: "i-lucide-flask-conical",
            onSelect: () => navigate(`/admin/batch/${b._id}`)
          }))
        },
        {
          id: "bottles",
          label: "Bottles",
          items: bottleStore.bottles.map((b) => ({
            label: b.name,
            suffix: b.inStock ? "In Stock" : "Out of Stock",
            icon: "i-lucide-wine",
            onSelect: () => navigate(`/admin/bottles/${b._id}`)
          }))
        },
        {
          id: "recipes",
          label: "Recipes",
          items: recipeStore.recipes.map((r) => ({
            label: r.name,
            suffix: r.class || r.type,
            icon: "i-lucide-book-open",
            onSelect: () => navigate(`/admin/recipes/${r._id}`)
          }))
        },
        {
          id: "items",
          label: "Items",
          items: itemStore.items.map((i) => ({
            label: i.name,
            suffix: i.type,
            icon: "i-lucide-package",
            onSelect: () => navigate(`/admin/items/${i._id}`)
          }))
        },
        {
          id: "cocktails",
          label: "Cocktails",
          items: cocktailStore.cocktails.map((c) => ({
            label: c.name,
            suffix: c.menu,
            icon: "i-lucide-martini",
            onSelect: () => navigate(`/admin/cocktails/${c._id}`)
          }))
        },
        {
          id: "contacts",
          label: "Contacts",
          items: contactStore.contacts.map((c) => ({
            label: c.businessName || `${c.firstName} ${c.lastName}`,
            suffix: c.type,
            icon: "i-lucide-users",
            onSelect: () => navigate(`/admin/contacts/${c._id}`)
          }))
        },
        {
          id: "vessels",
          label: "Vessels",
          items: vesselStore.vessels.map((v) => ({
            label: v.name,
            suffix: v.type,
            icon: "i-lucide-container",
            onSelect: () => navigate(`/admin/vessels/${v._id}`)
          }))
        }
      ];
      return g;
    });
    function onSelect(item) {
      if (item.onSelect) {
        item.onSelect();
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$2;
      const _component_UCommandPalette = _sfc_main$1;
      const _component_UIcon = _sfc_main$e;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        open: unref(isOpen),
        "onUpdate:open": ($event) => isRef(isOpen) ? isOpen.value = $event : null,
        ui: { content: "sm:max-w-2xl" }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UCommandPalette, {
              groups: unref(groups),
              fuse: {
                fuseOptions: {
                  ignoreLocation: true,
                  threshold: 0.1,
                  keys: ["label", "suffix"]
                },
                resultLimit: 12,
                matchAllWhenSearchEmpty: false
              },
              placeholder: "Search pages, batches, bottles, recipes...",
              close: true,
              "onUpdate:modelValue": onSelect,
              "onUpdate:open": (val) => {
                if (!val) unref(close)();
              },
              class: "h-[400px]"
            }, {
              empty: withCtx(({ searchTerm }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex flex-col items-center justify-center py-12 text-center"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UIcon, {
                    name: "i-lucide-search-x",
                    class: "text-3xl text-parchment/50 mb-2"
                  }, null, _parent3, _scopeId2));
                  _push3(`<p class="text-sm text-parchment/50"${_scopeId2}>${ssrInterpolate(searchTerm ? `No results for "${searchTerm}"` : "Start typing to search...")}</p></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex flex-col items-center justify-center py-12 text-center" }, [
                      createVNode(_component_UIcon, {
                        name: "i-lucide-search-x",
                        class: "text-3xl text-parchment/50 mb-2"
                      }),
                      createVNode("p", { class: "text-sm text-parchment/50" }, toDisplayString(searchTerm ? `No results for "${searchTerm}"` : "Start typing to search..."), 1)
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UCommandPalette, {
                groups: unref(groups),
                fuse: {
                  fuseOptions: {
                    ignoreLocation: true,
                    threshold: 0.1,
                    keys: ["label", "suffix"]
                  },
                  resultLimit: 12,
                  matchAllWhenSearchEmpty: false
                },
                placeholder: "Search pages, batches, bottles, recipes...",
                close: true,
                "onUpdate:modelValue": onSelect,
                "onUpdate:open": (val) => {
                  if (!val) unref(close)();
                },
                class: "h-[400px]"
              }, {
                empty: withCtx(({ searchTerm }) => [
                  createVNode("div", { class: "flex flex-col items-center justify-center py-12 text-center" }, [
                    createVNode(_component_UIcon, {
                      name: "i-lucide-search-x",
                      class: "text-3xl text-parchment/50 mb-2"
                    }),
                    createVNode("p", { class: "text-sm text-parchment/50" }, toDisplayString(searchTerm ? `No results for "${searchTerm}"` : "Start typing to search..."), 1)
                  ])
                ]),
                _: 1
              }, 8, ["groups", "onUpdate:open"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Admin/AdminCommandPalette.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const AdminCommandPalette = Object.assign(_sfc_main, { __name: "AdminCommandPalette" });

export { AdminCommandPalette as default };
//# sourceMappingURL=AdminCommandPalette-CgLazsMy.mjs.map
