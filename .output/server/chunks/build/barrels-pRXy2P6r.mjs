import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$4 } from './Select-xxK8NqZT.mjs';
import { e as _sfc_main$8, f as _sfc_main$e, h as useRouter } from './server.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { _ as _sfc_main$5 } from './Badge-BJMjvXJU.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, computed, withCtx, isRef, unref, createVNode, createTextVNode, toDisplayString, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { differenceInDays } from 'date-fns';
import { g as getBarrelAgeDefault } from './definitions-C7fnFA_u.mjs';
import { u as useVesselStore, a as useBatchStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import 'reka-ui';
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
import './errorMessage-C32Dqgoz.mjs';
import './batchPipeline-br9pdPdU.mjs';
import './conversions-t0mnZFvt.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BarrelCard",
  __ssrInlineRender: true,
  props: {
    vessel: {}
  },
  emits: ["dispose"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    useRouter();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const isDisposed = computed(() => props.vessel.status === "Disposed");
    const contentsName = computed(() => {
      if (!props.vessel.contents?.length) return "Empty";
      return props.vessel.contents.map((c) => {
        const batch = batchStore.getBatchById(c.batch);
        if (!batch?.recipe) return "Unknown";
        return recipeStore.getRecipeById(batch.recipe)?.name || "Unknown";
      }).filter((name, i, arr) => arr.indexOf(name) === i).join(", ");
    });
    const fillDate = computed(() => {
      if (!props.vessel.contents?.length) return null;
      const batch = batchStore.getBatchById(props.vessel.contents[0].batch);
      return batch?.stages?.barrelAging?.entry?.date ? new Date((batch?.stages).barrelAging.entry.date) : null;
    });
    const ageDays = computed(() => {
      if (!fillDate.value) return 0;
      return differenceInDays(/* @__PURE__ */ new Date(), fillDate.value);
    });
    const ageDisplay = computed(() => {
      const days = ageDays.value;
      if (days < 30) return `${days}d`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months}mo`;
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`;
    });
    const effectiveTargetAgeDays = computed(() => {
      const months = props.vessel.targetAge || getBarrelAgeDefault(props.vessel.barrel?.size) || 0;
      return months * 30;
    });
    const atTarget = computed(
      () => effectiveTargetAgeDays.value ? ageDays.value >= effectiveTargetAgeDays.value : false
    );
    const ageFraction = computed(() => {
      if (!ageDays.value || ageDays.value === 0) return 0;
      return Math.min(ageDays.value / (365 * 3), 1);
    });
    const borderColor = computed(() => {
      if (atTarget.value) return "border-gold ring-1 ring-gold/30";
      if (ageFraction.value > 0.66) return "border-amber-700/60";
      if (ageFraction.value > 0.33) return "border-amber-500/40";
      return "border-brown/30";
    });
    const ageBgGradient = computed(() => {
      if (!fillDate.value) return "bg-charcoal";
      if (ageFraction.value > 0.66) return "bg-gradient-to-b from-amber-900/20 to-charcoal";
      if (ageFraction.value > 0.33) return "bg-gradient-to-b from-amber-800/15 to-charcoal";
      return "bg-gradient-to-b from-amber-700/10 to-charcoal";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8;
      const _component_UBadge = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["rounded-xl border p-4 transition-all cursor-pointer hover:brightness-110 relative group", [unref(borderColor), unref(ageBgGradient), unref(isDisposed) ? "opacity-60" : ""]]
      }, _attrs))}>`);
      if (!unref(isDisposed)) {
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-trash-2",
          variant: "ghost",
          color: "error",
          size: "xs",
          class: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10",
          onClick: ($event) => emit("dispose", __props.vessel._id)
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isDisposed)) {
        _push(ssrRenderComponent(_component_UBadge, {
          color: "error",
          variant: "subtle",
          size: "sm",
          class: "absolute top-2 right-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Disposed `);
            } else {
              return [
                createTextVNode(" Disposed ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-start justify-between mb-2"><div><div class="text-sm font-medium text-parchment">${ssrInterpolate(__props.vessel.name)}</div><div class="text-xs text-parchment/60">${ssrInterpolate(unref(contentsName))}</div></div>`);
      if (__props.vessel.current?.abv && !unref(isDisposed)) {
        _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-500/15 text-blue-400 border-blue-500/25">${ssrInterpolate(__props.vessel.current.abv)}% ABV </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-1.5 text-xs">`);
      if (unref(fillDate)) {
        _push(`<div class="flex justify-between text-parchment/50"><span>Fill Date</span><span class="text-parchment/70">${ssrInterpolate(unref(fillDate).toLocaleDateString())}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(ageDays) > 0) {
        _push(`<div class="flex justify-between text-parchment/50"><span>Age</span><span class="${ssrRenderClass([unref(atTarget) ? "text-gold" : "text-parchment/70", "font-semibold"])}">${ssrInterpolate(unref(ageDisplay))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.vessel.barrel?.char) {
        _push(`<div class="flex justify-between text-parchment/50"><span>Char Level</span><span class="text-parchment/70">${ssrInterpolate(__props.vessel.barrel.char)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.vessel.barrel?.cost) {
        _push(`<div class="flex justify-between text-parchment/50"><span>Barrel Cost</span><span class="text-parchment/70">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.vessel.barrel.cost))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.vessel.current?.volume) {
        _push(`<div class="flex justify-between text-parchment/50"><span>Volume</span><span class="text-parchment/70">${ssrInterpolate(__props.vessel.current.volume)} ${ssrInterpolate(__props.vessel.current.volumeUnit || "gal")}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(atTarget) && !unref(isDisposed)) {
        _push(`<div class="mt-2 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/20 text-gold border border-gold/30"> At Target </span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Barrel/BarrelCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$2, { __name: "BarrelCard" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BarrelWarehouse",
  __ssrInlineRender: true,
  setup(__props) {
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const { confirm } = useDeleteConfirm();
    const sortBy = ref("name");
    const showDisposed = ref(false);
    const filterStatus = ref("all");
    const filterRecipe = ref(void 0);
    const getBarrelAge = (vessel) => {
      if (!vessel.contents?.length) return 0;
      const batch = batchStore.getBatchById(vessel.contents[0].batch);
      const fillDate = batch?.stages?.barrelAging?.entry?.date ? new Date((batch?.stages).barrelAging.entry.date) : null;
      if (!fillDate) return 0;
      return differenceInDays(/* @__PURE__ */ new Date(), fillDate);
    };
    const getBarrelTargetAgeDays = (vessel) => {
      const months = vessel.targetAge || getBarrelAgeDefault(vessel.barrel?.size) || 0;
      return months * 30;
    };
    const getBarrelRecipeId = (vessel) => {
      if (!vessel.contents?.length) return null;
      const batch = batchStore.getBatchById(vessel.contents[0].batch);
      return batch?.recipe || null;
    };
    const recipeOptions = computed(() => {
      const recipeIds = /* @__PURE__ */ new Set();
      vesselStore.barrels.forEach((b) => {
        const id = getBarrelRecipeId(b);
        if (id) recipeIds.add(id);
      });
      const options = Array.from(recipeIds).map((id) => {
        const recipe = recipeStore.getRecipeById(id);
        return { label: recipe?.name || "Unknown", value: id };
      }).sort((a, b) => a.label.localeCompare(b.label));
      return options;
    });
    const activeBarrels = computed(
      () => vesselStore.barrels.filter((b) => b.status !== "Disposed")
    );
    const disposedBarrels = computed(
      () => vesselStore.barrels.filter((b) => b.status === "Disposed")
    );
    const filteredBarrels = computed(() => {
      let barrels = showDisposed.value ? [...vesselStore.barrels] : [...activeBarrels.value];
      if (filterStatus.value === "filled") {
        barrels = barrels.filter((b) => b.contents && b.contents.length > 0);
      } else if (filterStatus.value === "empty") {
        barrels = barrels.filter((b) => !b.contents || b.contents.length === 0);
      } else if (filterStatus.value === "used") {
        barrels = barrels.filter((b) => b.isUsed);
      }
      if (filterRecipe.value) {
        barrels = barrels.filter((b) => getBarrelRecipeId(b) === filterRecipe.value);
      }
      switch (sortBy.value) {
        case "age-asc":
          return barrels.sort((a, b) => getBarrelAge(a) - getBarrelAge(b));
        case "age-desc":
          return barrels.sort((a, b) => getBarrelAge(b) - getBarrelAge(a));
        default:
          return barrels.sort((a, b) => a.name.localeCompare(b.name));
      }
    });
    const stats = computed(() => {
      const all = activeBarrels.value;
      const total = all.length;
      const filled = all.filter((b) => b.contents && b.contents.length > 0).length;
      const empty = total - filled;
      const atTarget = all.filter((b) => {
        const target = getBarrelTargetAgeDays(b);
        return target > 0 && getBarrelAge(b) >= target;
      }).length;
      const disposed = disposedBarrels.value.length;
      return { total, filled, empty, atTarget, disposed };
    });
    const handleDispose = async (vesselId) => {
      const barrel = vesselStore.barrels.find((b) => b._id === vesselId);
      if (!barrel) return;
      const confirmed = await confirm("Barrel", barrel.name);
      if (!confirmed) return;
      await vesselStore.disposeBarrel(vesselId);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UFormField = _sfc_main$3;
      const _component_USelect = _sfc_main$4;
      const _component_UButton = _sfc_main$8;
      const _component_UIcon = _sfc_main$e;
      const _component_BaseEmptyState = __nuxt_component_6;
      const _component_BarrelCard = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="flex flex-wrap items-end gap-4 mb-4">`);
      _push(ssrRenderComponent(_component_UFormField, { label: "Status" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(filterStatus),
              "onUpdate:modelValue": ($event) => isRef(filterStatus) ? filterStatus.value = $event : null,
              items: [
                { label: "All", value: "all" },
                { label: "Filled", value: "filled" },
                { label: "Empty", value: "empty" },
                { label: "Used", value: "used" }
              ],
              "value-key": "value",
              "label-key": "label"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_USelect, {
                modelValue: unref(filterStatus),
                "onUpdate:modelValue": ($event) => isRef(filterStatus) ? filterStatus.value = $event : null,
                items: [
                  { label: "All", value: "all" },
                  { label: "Filled", value: "filled" },
                  { label: "Empty", value: "empty" },
                  { label: "Used", value: "used" }
                ],
                "value-key": "value",
                "label-key": "label"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "Recipe" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(filterRecipe),
              "onUpdate:modelValue": ($event) => isRef(filterRecipe) ? filterRecipe.value = $event : null,
              items: unref(recipeOptions),
              "value-key": "value",
              "label-key": "label",
              placeholder: "All Recipes"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_USelect, {
                modelValue: unref(filterRecipe),
                "onUpdate:modelValue": ($event) => isRef(filterRecipe) ? filterRecipe.value = $event : null,
                items: unref(recipeOptions),
                "value-key": "value",
                "label-key": "label",
                placeholder: "All Recipes"
              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "Sort By" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(sortBy),
              "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
              items: [
                { label: "Name", value: "name" },
                { label: "Age (newest)", value: "age-asc" },
                { label: "Age (oldest)", value: "age-desc" }
              ],
              "value-key": "value"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_USelect, {
                modelValue: unref(sortBy),
                "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                items: [
                  { label: "Name", value: "name" },
                  { label: "Age (newest)", value: "age-asc" },
                  { label: "Age (oldest)", value: "age-desc" }
                ],
                "value-key": "value"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(stats).disposed > 0) {
        _push(ssrRenderComponent(_component_UButton, {
          icon: unref(showDisposed) ? "i-lucide-eye-off" : "i-lucide-eye",
          variant: "outline",
          color: "neutral",
          size: "sm",
          onClick: ($event) => showDisposed.value = !unref(showDisposed)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(showDisposed) ? "Hide" : "Show")} Disposed (${ssrInterpolate(unref(stats).disposed)}) `);
            } else {
              return [
                createTextVNode(toDisplayString(unref(showDisposed) ? "Hide" : "Show") + " Disposed (" + toDisplayString(unref(stats).disposed) + ") ", 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"><div class="bg-charcoal rounded-lg border border-brown/30 p-3 text-center"><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(stats).total)}</div><div class="text-xs text-parchment/60">Active</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-3 text-center"><div class="text-2xl font-bold text-copper">${ssrInterpolate(unref(stats).filled)}</div><div class="text-xs text-parchment/60">Filled</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-3 text-center"><div class="text-2xl font-bold text-parchment/60">${ssrInterpolate(unref(stats).empty)}</div><div class="text-xs text-parchment/60">Empty</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-3 text-center"><div class="text-2xl font-bold text-gold">${ssrInterpolate(unref(stats).atTarget)}</div><div class="text-xs text-parchment/60">At Target</div></div></div>`);
      if (unref(vesselStore).loading) {
        _push(`<div class="text-center py-12">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "text-2xl text-parchment/50 animate-spin mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">Loading barrels...</p></div>`);
      } else if (unref(activeBarrels).length === 0 && !unref(showDisposed)) {
        _push(ssrRenderComponent(_component_BaseEmptyState, {
          icon: "i-lucide-cylinder",
          title: "No barrels found",
          description: "Add barrel vessels to track your aging inventory"
        }, null, _parent));
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"><!--[-->`);
        ssrRenderList(unref(filteredBarrels), (barrel) => {
          _push(ssrRenderComponent(_component_BarrelCard, {
            key: barrel._id,
            vessel: barrel,
            onDispose: handleDispose
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Barrel/BarrelWarehouse.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$1, { __name: "BarrelWarehouse" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "barrels",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_BarrelWarehouse = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Barrel Warehouse",
        subtitle: "Monitor barrel aging and inventory",
        icon: "i-lucide-cylinder"
      }, null, _parent));
      _push(ssrRenderComponent(_component_BarrelWarehouse, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/barrels.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=barrels-pRXy2P6r.mjs.map
