import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { m as useToast, e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$1 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$2 } from './FormField-DcXe0kwN.mjs';
import { defineComponent, ref, watch, computed, withCtx, createTextVNode, unref, createVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
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
import './useCrudStore-CgiT9u6L.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "inventory",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const bottleStore = useBottleStore();
    const inventoryStore = useInventoryStore();
    const bottles = ref([]);
    watch(
      () => bottleStore.activeBottles,
      () => {
        bottles.value = bottleStore.activeBottles.map((bottle) => ({
          _id: bottle._id,
          bottle: bottle.name,
          bar: 0,
          office: 0,
          boxed: 0
        }));
      },
      { immediate: true }
    );
    const search = ref("");
    const saving = ref(false);
    const filteredBottles = computed(() => {
      if (!search.value) return bottles.value;
      return bottles.value.filter(
        (bottle) => bottle.bottle.toLowerCase().includes(search.value.toLowerCase())
      );
    });
    const getTotal = (bottle) => Number(bottle.bar) + Number(bottle.office) + Number(bottle.boxed) * 12;
    const getLastCount = (bottleId) => {
      const records = inventoryStore.inventories.filter((inv) => inv.item === bottleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return records[0] || null;
    };
    const getDelta = (bottle) => {
      const lastCount = getLastCount(bottle._id);
      if (!lastCount) return null;
      return getTotal(bottle) - lastCount.quantity;
    };
    const printSheet = () => (void 0).print();
    const submitInventory = async () => {
      saving.value = true;
      const date = /* @__PURE__ */ new Date();
      try {
        for (const bottle of bottles.value) {
          const total = getTotal(bottle);
          inventoryStore.inventory = {
            _id: "",
            date,
            item: bottle._id,
            quantity: total
          };
          await inventoryStore.updateInventory();
        }
        toast.add({ title: "Inventory submitted", color: "success", icon: "i-lucide-check-circle" });
      } catch (error) {
        toast.add({ title: "Failed to submit inventory", description: getErrorMessage(error), color: "error", icon: "i-lucide-alert-circle" });
      } finally {
        saving.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_UInput = _sfc_main$1;
      const _component_UFormField = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Bottle Inventory",
        subtitle: "Count and track bottle stock levels",
        icon: "i-lucide-package-check",
        class: "print:hidden"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              onClick: printSheet,
              icon: "i-lucide-printer",
              variant: "outline",
              class: "print:hidden"
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
              icon: "i-lucide-check",
              class: "print:hidden"
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
                variant: "outline",
                class: "print:hidden"
              }, {
                default: withCtx(() => [
                  createTextVNode("Print Sheet")
                ]),
                _: 1
              }),
              createVNode(_component_UButton, {
                onClick: submitInventory,
                loading: unref(saving),
                icon: "i-lucide-check",
                class: "print:hidden"
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
      _push(`<div class="mb-4 print:hidden">`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(search),
        "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
        placeholder: "Search bottles...",
        icon: "i-lucide-search",
        class: "max-w-xs"
      }, null, _parent));
      _push(`</div><div class="hidden sm:block print:hidden"><div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden"><table class="w-full"><thead><tr class="border-b border-brown/30"><th class="text-left px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider">Bottle</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24">Bar</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24">Office</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24">Boxed</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-20">Total</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-28">Last Count</th><th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-20">Delta</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(filteredBottles), (bottle) => {
        _push(`<tr class="border-b border-brown/15 last:border-0"><td class="px-4 py-2 text-sm font-medium text-parchment">${ssrInterpolate(bottle.bottle)}</td><td class="px-4 py-2">`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: bottle.bar,
          "onUpdate:modelValue": ($event) => bottle.bar = $event,
          type: "number",
          min: "0",
          class: "text-center"
        }, null, _parent));
        _push(`</td><td class="px-4 py-2">`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: bottle.office,
          "onUpdate:modelValue": ($event) => bottle.office = $event,
          type: "number",
          min: "0",
          class: "text-center"
        }, null, _parent));
        _push(`</td><td class="px-4 py-2">`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: bottle.boxed,
          "onUpdate:modelValue": ($event) => bottle.boxed = $event,
          type: "number",
          min: "0",
          class: "text-center"
        }, null, _parent));
        _push(`</td><td class="px-4 py-2 text-center text-sm font-semibold text-parchment">${ssrInterpolate(getTotal(bottle))}</td><td class="px-4 py-2 text-center text-xs text-parchment/50">`);
        if (getLastCount(bottle._id)) {
          _push(`<!--[-->${ssrInterpolate(getLastCount(bottle._id).quantity)} <span class="text-parchment/50">(${ssrInterpolate(new Date(getLastCount(bottle._id).date).toLocaleDateString())})</span><!--]-->`);
        } else {
          _push(`<span class="text-parchment/20">--</span>`);
        }
        _push(`</td><td class="px-4 py-2 text-center text-sm font-semibold">`);
        if (getDelta(bottle) !== null) {
          _push(`<span class="${ssrRenderClass(getDelta(bottle) >= 0 ? "text-green-400" : "text-red-400")}">${ssrInterpolate(getDelta(bottle) > 0 ? "+" : "")}${ssrInterpolate(getDelta(bottle))}</span>`);
        } else {
          _push(`<span class="text-parchment/20">--</span>`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div><div class="sm:hidden space-y-3 print:hidden"><!--[-->`);
      ssrRenderList(unref(filteredBottles), (bottle) => {
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-4"><div class="text-sm font-medium text-parchment mb-3">${ssrInterpolate(bottle.bottle)}</div><div class="grid grid-cols-3 gap-2 mb-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Bar" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: bottle.bar,
                "onUpdate:modelValue": ($event) => bottle.bar = $event,
                type: "number",
                min: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: bottle.bar,
                  "onUpdate:modelValue": ($event) => bottle.bar = $event,
                  type: "number",
                  min: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Office" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: bottle.office,
                "onUpdate:modelValue": ($event) => bottle.office = $event,
                type: "number",
                min: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: bottle.office,
                  "onUpdate:modelValue": ($event) => bottle.office = $event,
                  type: "number",
                  min: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Boxed" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: bottle.boxed,
                "onUpdate:modelValue": ($event) => bottle.boxed = $event,
                type: "number",
                min: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: bottle.boxed,
                  "onUpdate:modelValue": ($event) => bottle.boxed = $event,
                  type: "number",
                  min: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div><div class="flex justify-between items-center text-xs"><span class="text-parchment/60">Total: <span class="font-semibold text-parchment">${ssrInterpolate(getTotal(bottle))}</span></span>`);
        if (getDelta(bottle) !== null) {
          _push(`<span class="${ssrRenderClass(getDelta(bottle) >= 0 ? "text-green-400" : "text-red-400")}"> Delta: ${ssrInterpolate(getDelta(bottle) > 0 ? "+" : "")}${ssrInterpolate(getDelta(bottle))}</span>`);
        } else {
          _push(`<span class="text-parchment/20">No previous count</span>`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div><div id="inventory-sheet" class="hidden print:block"><div class="text-center mb-4"><h1 class="text-xl font-bold">Galveston Distilling Co</h1><h2 class="text-lg">Inventory Count Sheet</h2><p class="text-sm mt-1">Date: ${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleDateString())}</p></div><div class="mb-6 text-sm"> Counted by: ________________________________________ </div><table class="w-full border-collapse"><thead><tr><th class="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Bottle</th><th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Bar</th><th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Office</th><th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Boxed</th><th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Total</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(bottles), (bottle) => {
        _push(`<tr><td class="border border-gray-400 px-3 py-3 text-sm">${ssrInterpolate(bottle.bottle)}</td><td class="border border-gray-400 px-3 py-3"> </td><td class="border border-gray-400 px-3 py-3"> </td><td class="border border-gray-400 px-3 py-3"> </td><td class="border border-gray-400 px-3 py-3"> </td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/bottles/inventory.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=inventory-A6e9TTTI.mjs.map
