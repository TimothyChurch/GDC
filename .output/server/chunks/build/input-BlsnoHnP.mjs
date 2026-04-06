import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { m as useToast, e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$1 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$2 } from './Tabs-rL7xWWdN.mjs';
import { _ as _sfc_main$3 } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$4 } from './FormField-DcXe0kwN.mjs';
import { b as allUnits } from './units-DWysHFem.mjs';
import { defineComponent, ref, watch, computed, withCtx, createTextVNode, unref, createVNode, isRef, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { d as useInventoryCategories, u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';
import '../nitro/nitro.mjs';
import 'mongoose';
import 'yup';
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
import 'pinia';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import 'reka-ui';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './Badge-BJMjvXJU.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "input",
  __ssrInlineRender: true,
  setup(__props) {
    const categories = useInventoryCategories();
    const toast = useToast();
    const itemStore = useItemStore();
    const inventoryStore = useInventoryStore();
    const search = ref("");
    const saving = ref(false);
    const activeTab = ref("bottling");
    const countData = ref({});
    watch(
      [() => itemStore.items, categories],
      () => {
        for (const cat of categories.value) {
          const items = itemStore.getItemsByCategory(cat.category);
          countData.value[cat.key] = items.map((item) => ({
            _id: item._id,
            name: item.name,
            unit: item.inventoryUnit || "",
            quantity: 0,
            unitSize: item.unitSize || 0,
            unitSizeUnit: item.inventoryUnit || "",
            unitLabel: item.unitLabel || "",
            unitInput: 0
          }));
        }
      },
      { immediate: true }
    );
    function onUnitInputChange(entry) {
      if (entry.unitSize > 0) {
        entry.quantity = entry.unitInput * entry.unitSize;
      } else {
        entry.quantity = entry.unitInput;
      }
    }
    function getTotal(entry) {
      if (entry.unitSize > 0) {
        return entry.unitInput * entry.unitSize;
      }
      return entry.unitInput;
    }
    function formatLastCount(entry, qty) {
      const unit = entry.unitSizeUnit || entry.unit;
      return `${qty} ${unit}`;
    }
    function getLastCount(itemId) {
      const records = inventoryStore.inventories.filter((inv) => inv.item === itemId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return records[0] || null;
    }
    function getDelta(entry) {
      const lastCount = getLastCount(entry._id);
      if (!lastCount) return null;
      return Number(entry.quantity) - lastCount.quantity;
    }
    function getFilteredEntries(key) {
      const entries = countData.value[key] || [];
      if (!search.value) return entries;
      const term = search.value.toLowerCase();
      return entries.filter((e) => e.name.toLowerCase().includes(term));
    }
    const tabs = computed(
      () => categories.value.map((cat) => ({
        label: cat.label,
        value: cat.key,
        icon: cat.icon
      }))
    );
    const submitInventory = async () => {
      saving.value = true;
      const date = /* @__PURE__ */ new Date();
      try {
        for (const key of Object.keys(countData.value)) {
          for (const entry of countData.value[key]) {
            inventoryStore.inventory = {
              _id: "",
              date,
              item: entry._id,
              quantity: Number(entry.quantity),
              ...entry.unitSize > 0 && { unitSize: entry.unitSize, unitSizeUnit: entry.unitSizeUnit }
            };
            await inventoryStore.updateInventory();
          }
        }
        toast.add({ title: "Inventory submitted", color: "success", icon: "i-lucide-check-circle" });
      } catch (error) {
        toast.add({ title: "Failed to submit inventory", description: getErrorMessage(error), color: "error", icon: "i-lucide-alert-circle" });
      } finally {
        saving.value = false;
      }
    };
    const printSheet = () => {
      (void 0).open("/admin/inventory/print", "_blank");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_UInput = _sfc_main$1;
      const _component_UTabs = _sfc_main$2;
      const _component_USelect = _sfc_main$3;
      const _component_UFormField = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Count Inventory",
        subtitle: "Enter current stock levels for all raw materials",
        icon: "i-lucide-clipboard-check"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              onClick: printSheet,
              icon: "i-lucide-printer",
              variant: "outline"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Print Sheet`);
                } else {
                  return [
                    createTextVNode("Print Sheet")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              onClick: submitInventory,
              loading: unref(saving),
              icon: "i-lucide-check"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Submit Inventory`);
                } else {
                  return [
                    createTextVNode("Submit Inventory")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                onClick: printSheet,
                icon: "i-lucide-printer",
                variant: "outline"
              }, {
                default: withCtx(() => [
                  createTextVNode("Print Sheet")
                ]),
                _: 1
              }),
              createVNode(_component_UButton, {
                onClick: submitInventory,
                loading: unref(saving),
                icon: "i-lucide-check"
              }, {
                default: withCtx(() => [
                  createTextVNode("Submit Inventory")
                ]),
                _: 1
              }, 8, ["loading"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="mb-4">`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(search),
        "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
        placeholder: "Search items...",
        icon: "i-lucide-search",
        class: "max-w-xs"
      }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UTabs, {
        modelValue: unref(activeTab),
        "onUpdate:modelValue": ($event) => isRef(activeTab) ? activeTab.value = $event : null,
        items: unref(tabs)
      }, {
        content: withCtx(({ item }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="hidden sm:block mt-4"${_scopeId}><div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden"${_scopeId}><table class="w-full"${_scopeId}><thead${_scopeId}><tr class="border-b border-brown/30"${_scopeId}><th class="text-left px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider"${_scopeId}>Item</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24"${_scopeId}># Units</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24"${_scopeId}>Per Unit</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-28"${_scopeId}>Unit</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24"${_scopeId}>Total</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-28"${_scopeId}>Last Count</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-20"${_scopeId}>Delta</th></tr></thead><tbody${_scopeId}><!--[-->`);
            ssrRenderList(getFilteredEntries(item.value), (entry) => {
              _push2(`<tr class="border-b border-brown/15 last:border-0"${_scopeId}><td class="px-4 py-2 text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(entry.name)}</td><td class="px-4 py-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: entry.unitInput,
                "onUpdate:modelValue": [($event) => entry.unitInput = $event, ($event) => onUnitInputChange(entry)],
                type: "number",
                min: "0",
                class: "text-center"
              }, null, _parent2, _scopeId));
              _push2(`</td><td class="px-4 py-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: entry.unitSize,
                "onUpdate:modelValue": [($event) => entry.unitSize = $event, ($event) => onUnitInputChange(entry)],
                modelModifiers: { number: true },
                type: "number",
                min: "0",
                class: "text-center"
              }, null, _parent2, _scopeId));
              _push2(`</td><td class="px-4 py-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: entry.unitSizeUnit,
                "onUpdate:modelValue": ($event) => entry.unitSizeUnit = $event,
                items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                placeholder: "unit"
              }, null, _parent2, _scopeId));
              _push2(`</td><td class="px-4 py-2 text-center text-sm font-semibold text-gold"${_scopeId}>${ssrInterpolate(getTotal(entry).toLocaleString())} ${ssrInterpolate(entry.unitSizeUnit)}</td><td class="px-4 py-2 text-center text-xs text-parchment/50"${_scopeId}>`);
              if (getLastCount(entry._id)) {
                _push2(`<!--[-->${ssrInterpolate(formatLastCount(entry, getLastCount(entry._id).quantity))} <div class="text-parchment/60"${_scopeId}>${ssrInterpolate(new Date(getLastCount(entry._id).date).toLocaleDateString())}</div><!--]-->`);
              } else {
                _push2(`<span class="text-parchment/20"${_scopeId}>--</span>`);
              }
              _push2(`</td><td class="px-4 py-2 text-center text-sm font-semibold"${_scopeId}>`);
              if (getDelta(entry) !== null) {
                _push2(`<span class="${ssrRenderClass(getDelta(entry) >= 0 ? "text-green-400" : "text-red-400")}"${_scopeId}>${ssrInterpolate(getDelta(entry) > 0 ? "+" : "")}${ssrInterpolate(getDelta(entry))}</span>`);
              } else {
                _push2(`<span class="text-parchment/20"${_scopeId}>--</span>`);
              }
              _push2(`</td></tr>`);
            });
            _push2(`<!--]-->`);
            if (getFilteredEntries(item.value).length === 0) {
              _push2(`<tr${_scopeId}><td colspan="7" class="text-center py-6 text-parchment/50 text-sm"${_scopeId}> No items in this category </td></tr>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</tbody></table></div></div><div class="sm:hidden space-y-3 mt-4"${_scopeId}><!--[-->`);
            ssrRenderList(getFilteredEntries(item.value), (entry) => {
              _push2(`<div class="bg-charcoal rounded-xl border border-brown/30 p-4"${_scopeId}><div class="text-sm font-medium text-parchment mb-3"${_scopeId}>${ssrInterpolate(entry.name)}</div><div class="grid grid-cols-3 gap-2 mb-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UFormField, { label: "# Units" }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UInput, {
                      modelValue: entry.unitInput,
                      "onUpdate:modelValue": [($event) => entry.unitInput = $event, ($event) => onUnitInputChange(entry)],
                      type: "number",
                      min: "0"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UInput, {
                        modelValue: entry.unitInput,
                        "onUpdate:modelValue": [($event) => entry.unitInput = $event, ($event) => onUnitInputChange(entry)],
                        type: "number",
                        min: "0"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UFormField, { label: "Per Unit" }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UInput, {
                      modelValue: entry.unitSize,
                      "onUpdate:modelValue": [($event) => entry.unitSize = $event, ($event) => onUnitInputChange(entry)],
                      modelModifiers: { number: true },
                      type: "number",
                      min: "0"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UInput, {
                        modelValue: entry.unitSize,
                        "onUpdate:modelValue": [($event) => entry.unitSize = $event, ($event) => onUnitInputChange(entry)],
                        modelModifiers: { number: true },
                        type: "number",
                        min: "0"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_USelect, {
                      modelValue: entry.unitSizeUnit,
                      "onUpdate:modelValue": ($event) => entry.unitSizeUnit = $event,
                      items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                      placeholder: "unit"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_USelect, {
                        modelValue: entry.unitSizeUnit,
                        "onUpdate:modelValue": ($event) => entry.unitSizeUnit = $event,
                        items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                        placeholder: "unit"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div><div class="text-xs text-parchment/60 mb-3"${_scopeId}> Total: <span class="font-semibold text-gold"${_scopeId}>${ssrInterpolate(getTotal(entry).toLocaleString())} ${ssrInterpolate(entry.unitSizeUnit)}</span></div><div class="flex justify-between items-center text-xs"${_scopeId}>`);
              if (getLastCount(entry._id)) {
                _push2(`<span class="text-parchment/50"${_scopeId}> Last: ${ssrInterpolate(formatLastCount(entry, getLastCount(entry._id).quantity))} (${ssrInterpolate(new Date(getLastCount(entry._id).date).toLocaleDateString())}) </span>`);
              } else {
                _push2(`<span class="text-parchment/20"${_scopeId}>No previous count</span>`);
              }
              if (getDelta(entry) !== null) {
                _push2(`<span class="${ssrRenderClass(getDelta(entry) >= 0 ? "text-green-400" : "text-red-400")}"${_scopeId}> Delta: ${ssrInterpolate(getDelta(entry) > 0 ? "+" : "")}${ssrInterpolate(getDelta(entry))}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            });
            _push2(`<!--]-->`);
            if (getFilteredEntries(item.value).length === 0) {
              _push2(`<div class="text-center py-6 text-parchment/50 text-sm"${_scopeId}> No items in this category </div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "hidden sm:block mt-4" }, [
                createVNode("div", { class: "bg-charcoal rounded-xl border border-brown/30 overflow-hidden" }, [
                  createVNode("table", { class: "w-full" }, [
                    createVNode("thead", null, [
                      createVNode("tr", { class: "border-b border-brown/30" }, [
                        createVNode("th", { class: "text-left px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider" }, "Item"),
                        createVNode("th", { class: "text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24" }, "# Units"),
                        createVNode("th", { class: "text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24" }, "Per Unit"),
                        createVNode("th", { class: "text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-28" }, "Unit"),
                        createVNode("th", { class: "text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24" }, "Total"),
                        createVNode("th", { class: "text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-28" }, "Last Count"),
                        createVNode("th", { class: "text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-20" }, "Delta")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(getFilteredEntries(item.value), (entry) => {
                        return openBlock(), createBlock("tr", {
                          key: entry._id,
                          class: "border-b border-brown/15 last:border-0"
                        }, [
                          createVNode("td", { class: "px-4 py-2 text-sm font-medium text-parchment" }, toDisplayString(entry.name), 1),
                          createVNode("td", { class: "px-4 py-2" }, [
                            createVNode(_component_UInput, {
                              modelValue: entry.unitInput,
                              "onUpdate:modelValue": [($event) => entry.unitInput = $event, ($event) => onUnitInputChange(entry)],
                              type: "number",
                              min: "0",
                              class: "text-center"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          createVNode("td", { class: "px-4 py-2" }, [
                            createVNode(_component_UInput, {
                              modelValue: entry.unitSize,
                              "onUpdate:modelValue": [($event) => entry.unitSize = $event, ($event) => onUnitInputChange(entry)],
                              modelModifiers: { number: true },
                              type: "number",
                              min: "0",
                              class: "text-center"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          createVNode("td", { class: "px-4 py-2" }, [
                            createVNode(_component_USelect, {
                              modelValue: entry.unitSizeUnit,
                              "onUpdate:modelValue": ($event) => entry.unitSizeUnit = $event,
                              items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                              placeholder: "unit"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          createVNode("td", { class: "px-4 py-2 text-center text-sm font-semibold text-gold" }, toDisplayString(getTotal(entry).toLocaleString()) + " " + toDisplayString(entry.unitSizeUnit), 1),
                          createVNode("td", { class: "px-4 py-2 text-center text-xs text-parchment/50" }, [
                            getLastCount(entry._id) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                              createTextVNode(toDisplayString(formatLastCount(entry, getLastCount(entry._id).quantity)) + " ", 1),
                              createVNode("div", { class: "text-parchment/60" }, toDisplayString(new Date(getLastCount(entry._id).date).toLocaleDateString()), 1)
                            ], 64)) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "text-parchment/20"
                            }, "--"))
                          ]),
                          createVNode("td", { class: "px-4 py-2 text-center text-sm font-semibold" }, [
                            getDelta(entry) !== null ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: getDelta(entry) >= 0 ? "text-green-400" : "text-red-400"
                            }, toDisplayString(getDelta(entry) > 0 ? "+" : "") + toDisplayString(getDelta(entry)), 3)) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "text-parchment/20"
                            }, "--"))
                          ])
                        ]);
                      }), 128)),
                      getFilteredEntries(item.value).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          colspan: "7",
                          class: "text-center py-6 text-parchment/50 text-sm"
                        }, " No items in this category ")
                      ])) : createCommentVNode("", true)
                    ])
                  ])
                ])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3 mt-4" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(getFilteredEntries(item.value), (entry) => {
                  return openBlock(), createBlock("div", {
                    key: entry._id,
                    class: "bg-charcoal rounded-xl border border-brown/30 p-4"
                  }, [
                    createVNode("div", { class: "text-sm font-medium text-parchment mb-3" }, toDisplayString(entry.name), 1),
                    createVNode("div", { class: "grid grid-cols-3 gap-2 mb-2" }, [
                      createVNode(_component_UFormField, { label: "# Units" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: entry.unitInput,
                            "onUpdate:modelValue": [($event) => entry.unitInput = $event, ($event) => onUnitInputChange(entry)],
                            type: "number",
                            min: "0"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Per Unit" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: entry.unitSize,
                            "onUpdate:modelValue": [($event) => entry.unitSize = $event, ($event) => onUnitInputChange(entry)],
                            modelModifiers: { number: true },
                            type: "number",
                            min: "0"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Unit" }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: entry.unitSizeUnit,
                            "onUpdate:modelValue": ($event) => entry.unitSizeUnit = $event,
                            items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                            placeholder: "unit"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 2
                      }, 1024)
                    ]),
                    createVNode("div", { class: "text-xs text-parchment/60 mb-3" }, [
                      createTextVNode(" Total: "),
                      createVNode("span", { class: "font-semibold text-gold" }, toDisplayString(getTotal(entry).toLocaleString()) + " " + toDisplayString(entry.unitSizeUnit), 1)
                    ]),
                    createVNode("div", { class: "flex justify-between items-center text-xs" }, [
                      getLastCount(entry._id) ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "text-parchment/50"
                      }, " Last: " + toDisplayString(formatLastCount(entry, getLastCount(entry._id).quantity)) + " (" + toDisplayString(new Date(getLastCount(entry._id).date).toLocaleDateString()) + ") ", 1)) : (openBlock(), createBlock("span", {
                        key: 1,
                        class: "text-parchment/20"
                      }, "No previous count")),
                      getDelta(entry) !== null ? (openBlock(), createBlock("span", {
                        key: 2,
                        class: getDelta(entry) >= 0 ? "text-green-400" : "text-red-400"
                      }, " Delta: " + toDisplayString(getDelta(entry) > 0 ? "+" : "") + toDisplayString(getDelta(entry)), 3)) : createCommentVNode("", true)
                    ])
                  ]);
                }), 128)),
                getFilteredEntries(item.value).length === 0 ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "text-center py-6 text-parchment/50 text-sm"
                }, " No items in this category ")) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/inventory/input.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=input-BlsnoHnP.mjs.map
