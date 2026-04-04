import { u as useRoute, h as useRouter, g as useOverlay, f as _sfc_main$e$1, e as _sfc_main$8$1, c as __nuxt_component_1$1, m as useToast } from './server.mjs';
import { _ as _sfc_main$o } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$r } from './SiteDatePicker-pVMyeD61.mjs';
import { _ as _sfc_main$m } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$p } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$n } from './Textarea-f7RIzcnS.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, ref, unref, mergeProps, withCtx, createTextVNode, createVNode, isRef, toDisplayString, resolveDynamicComponent, watch, openBlock, createBlock, createCommentVNode, Fragment, renderList, provide, reactive, inject, toRaw, defineAsyncComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderVNode, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderStyle } from 'vue/server-renderer';
import { a as useBatchStore, u as useVesselStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useItemStore, a as useUnitConversion } from './useItemStore-Cpj9s1UF.mjs';
import { l as latestPrice, r as recipePrice } from './helpers-pfHQ8kqT.mjs';
import { Line } from 'vue-chartjs';
import { u as useChartRegistration } from './useChartRegistration-vDVtbpQr.mjs';
import { _ as _sfc_main$q } from './Badge-BJMjvXJU.mjs';
import { c as calculateProofGallons } from './proofGallons--xmqBsFG.mjs';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
import { h as hasStageVolumes, g as getActiveStages, f as getNextStage, a as getPreviousStage, i as isStageActive, j as hasReachedStage, c as STAGE_DISPLAY, k as getAvailableStages, s as stageBgColor, e as stageTextColor, d as getStageVolume, l as getVesselRemainingCapacity, m as STAGE_VESSEL_TYPE, S as STAGE_KEY_MAP } from './batchPipeline-br9pdPdU.mjs';
import { n as normalizeDistillingRuns } from './distillingMigration-D0KFnhrX.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';
import { _ as __nuxt_component_8$1 } from './BaseItemSelect-8IgvW2BX.mjs';
import { _ as _sfc_main$l } from './Modal-GBrZNdlF.mjs';
import { _ as __nuxt_component_2$1 } from './VesselCard-DfVt2H43.mjs';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { L as LazyPanelProduction } from './PanelProduction-CicAwPD9.mjs';
import { _ as __nuxt_component_0$1 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$s } from './Tooltip-wiUkEzv7.mjs';
import { _ as _sfc_main$t } from './SelectMenu-DljUyjmT.mjs';
import { v as volumeUnits } from './units-DWysHFem.mjs';
import { u as useBulkSpiritStore } from './useBulkSpiritStore-Bx2u4RsR.mjs';
import { L as LazyPanelBatch } from './PanelBatch-C1RtjSaY.mjs';
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
import './Popover-BvOOk09Z.mjs';
import 'reka-ui/namespaced';
import './FieldGroup-bwPzB93U.mjs';
import 'v-calendar';
import 'date-fns';
import './useCrudStore-CgiT9u6L.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useContactStore-DKhOek2F.mjs';
import 'chart.js';
import './Kbd-C22JBoFL.mjs';

const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "BatchMashing",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const itemStore = useItemStore();
    const { convertQuantity, ingredientCost } = useUnitConversion();
    const recipe = computed(() => props.batch?.recipe ? recipeStore.getRecipeById(props.batch.recipe) : void 0);
    const scaleFactor = computed(() => {
      if (!props.batch || !recipe.value?.volume) return 1;
      const batchInRecipeUnits = convertQuantity(props.batch.batchSize, props.batch.batchSizeUnit, recipe.value.volumeUnit);
      return batchInRecipeUnits / recipe.value.volume;
    });
    const scaledIngredients = computed(() => {
      if (!recipe.value?.items) return [];
      return recipe.value.items.map((ing) => {
        const item = itemStore.getItemById(ing._id);
        const pricePerUnit = latestPrice(ing._id);
        const scaledAmount = ing.amount * scaleFactor.value;
        const cost = ingredientCost(pricePerUnit, scaledAmount, ing.unit, item?.inventoryUnit || ing.unit);
        return { id: ing._id, name: item?.name || "Unknown", amount: scaledAmount, unit: ing.unit, cost };
      });
    });
    const scaledTotalCost = computed(
      () => scaledIngredients.value.reduce((sum, ing) => sum + ing.cost, 0)
    );
    const updatingCost = ref(false);
    const updateBatchCost = async () => {
      if (!props.batch || !recipe.value) return;
      updatingCost.value = true;
      try {
        const newRecipeCost = recipePrice(recipe.value);
        batchStore.setBatch(props.batch._id);
        batchStore.batch.recipeCost = newRecipeCost;
        batchStore.batch.batchCost = scaledTotalCost.value;
        await batchStore.updateBatch();
      } finally {
        updatingCost.value = false;
      }
    };
    const stage = computed(() => props.batch.stages?.mashing);
    const vesselName = computed(() => {
      if (!stage.value?.vessel) return "Not assigned";
      return vesselStore.getVesselById(stage.value.vessel)?.name || "Unknown";
    });
    const startDate = computed(() => {
      if (!stage.value?.startedAt) return "Not set";
      return new Date(stage.value.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    });
    const local = ref({
      vessel: stage.value?.vessel || "",
      startedAt: stage.value?.startedAt ? new Date(stage.value.startedAt) : /* @__PURE__ */ new Date(),
      strikeWaterVolume: stage.value?.strikeWaterVolume,
      strikeWaterVolumeUnit: stage.value?.strikeWaterVolumeUnit || "gallon",
      strikeWaterTemp: stage.value?.strikeWaterTemp,
      strikeWaterTempUnit: stage.value?.strikeWaterTempUnit || "F",
      mashTemp: stage.value?.mashTemp,
      mashTempUnit: stage.value?.mashTempUnit || "F",
      mashDuration: stage.value?.mashDuration,
      pH: stage.value?.pH,
      preBoilGravity: stage.value?.preBoilGravity,
      postBoilGravity: stage.value?.postBoilGravity,
      notes: stage.value?.notes || ""
    });
    const mashTunOptions = computed(
      () => vesselStore.mashTuns.map((v) => ({ label: v.name, value: v._id }))
    );
    const saving = ref(false);
    const save = async () => {
      saving.value = true;
      try {
        await batchStore.updateStageData(props.batch._id, "Mashing", {
          vessel: local.value.vessel || void 0,
          startedAt: local.value.startedAt,
          strikeWaterVolume: local.value.strikeWaterVolume,
          strikeWaterVolumeUnit: local.value.strikeWaterVolumeUnit,
          strikeWaterTemp: local.value.strikeWaterTemp,
          strikeWaterTempUnit: local.value.strikeWaterTempUnit,
          mashTemp: local.value.mashTemp,
          mashTempUnit: local.value.mashTempUnit,
          mashDuration: local.value.mashDuration,
          pH: local.value.pH,
          preBoilGravity: local.value.preBoilGravity,
          postBoilGravity: local.value.postBoilGravity,
          notes: local.value.notes
        });
      } finally {
        saving.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_UButton = _sfc_main$8$1;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_USelect = _sfc_main$o;
      const _component_SiteDatePicker = _sfc_main$r;
      const _component_UInput = _sfc_main$m;
      const _component_UFormField = _sfc_main$p;
      const _component_UTextarea = _sfc_main$n;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-orange-500/30 p-5" }, _attrs))}><div class="flex items-center gap-2 mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-flame",
        class: "text-lg text-orange-400"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Mashing</h3></div>`);
      if (unref(scaledIngredients).length > 0) {
        _push(`<div class="mb-5 pb-4 border-b border-brown/20"><div class="flex items-center justify-between mb-3"><div class="text-xs text-parchment/60 uppercase tracking-wider"> Ingredients <span class="text-parchment/60 ml-1">(scaled to ${ssrInterpolate(__props.batch.batchSize)} ${ssrInterpolate(__props.batch.batchSizeUnit)})</span></div><div class="flex items-center gap-3"><span class="text-sm font-semibold text-gold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(scaledTotalCost)))}</span>`);
        if (unref(scaledTotalCost) !== (__props.batch.batchCost || 0)) {
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-refresh-cw",
            size: "xs",
            variant: "soft",
            loading: unref(updatingCost),
            onClick: updateBatchCost
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Update Cost `);
              } else {
                return [
                  createTextVNode(" Update Cost ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="divide-y divide-brown/10"><div class="grid grid-cols-3 gap-4 pb-2 text-xs text-parchment/50 uppercase tracking-wider"><span>Item</span><span>Amount</span><span class="text-right">Cost</span></div><!--[-->`);
        ssrRenderList(unref(scaledIngredients), (ing) => {
          _push(`<div class="grid grid-cols-3 gap-4 py-2 text-sm">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/items/${ing.id}`,
            class: "text-gold hover:text-copper transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(ing.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(ing.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-parchment/60">${ssrInterpolate(Number(ing.amount.toFixed(2)))} ${ssrInterpolate(ing.unit)}</span><span class="text-parchment text-right">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(ing.cost))}</span></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).vessel,
          "onUpdate:modelValue": ($event) => unref(local).vessel = $event,
          items: unref(mashTunOptions),
          "value-key": "value",
          "label-key": "label",
          placeholder: "Select mash tun"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(vesselName))}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_SiteDatePicker, {
          modelValue: unref(local).startedAt,
          "onUpdate:modelValue": ($event) => unref(local).startedAt = $event
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(startDate))}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Duration (min)</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).mashDuration,
          "onUpdate:modelValue": ($event) => unref(local).mashDuration = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "60"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(stage)?.mashDuration || "N/A")}</div>`);
      }
      _push(`</div></div><div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Strike Water</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).strikeWaterVolume,
                "onUpdate:modelValue": ($event) => unref(local).strikeWaterVolume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).strikeWaterVolume,
                  "onUpdate:modelValue": ($event) => unref(local).strikeWaterVolume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).strikeWaterVolumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).strikeWaterVolumeUnit = $event,
                items: ["gallon", "L"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).strikeWaterVolumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).strikeWaterVolumeUnit = $event,
                  items: ["gallon", "L"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Temp" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).strikeWaterTemp,
                "onUpdate:modelValue": ($event) => unref(local).strikeWaterTemp = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "165"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).strikeWaterTemp,
                  "onUpdate:modelValue": ($event) => unref(local).strikeWaterTemp = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "165"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).strikeWaterTempUnit,
                "onUpdate:modelValue": ($event) => unref(local).strikeWaterTempUnit = $event,
                items: ["F", "C"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).strikeWaterTempUnit,
                  "onUpdate:modelValue": ($event) => unref(local).strikeWaterTempUnit = $event,
                  items: ["F", "C"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="text-sm text-parchment/60">`);
        if (unref(stage)?.strikeWaterVolume) {
          _push(`<!--[-->${ssrInterpolate(unref(stage).strikeWaterVolume)} ${ssrInterpolate(unref(stage).strikeWaterVolumeUnit)} @ ${ssrInterpolate(unref(stage).strikeWaterTemp)}°${ssrInterpolate(unref(stage).strikeWaterTempUnit)}<!--]-->`);
        } else {
          _push(`<!--[-->Not recorded<!--]-->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Mash Conditions</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Mash Temp" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).mashTemp,
                "onUpdate:modelValue": ($event) => unref(local).mashTemp = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "152"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).mashTemp,
                  "onUpdate:modelValue": ($event) => unref(local).mashTemp = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "152"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).mashTempUnit,
                "onUpdate:modelValue": ($event) => unref(local).mashTempUnit = $event,
                items: ["F", "C"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).mashTempUnit,
                  "onUpdate:modelValue": ($event) => unref(local).mashTempUnit = $event,
                  items: ["F", "C"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "pH" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).pH,
                "onUpdate:modelValue": ($event) => unref(local).pH = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.1",
                placeholder: "5.4"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).pH,
                  "onUpdate:modelValue": ($event) => unref(local).pH = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "5.4"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div></div></div>`);
      } else {
        _push(`<div class="flex gap-6 text-sm text-parchment/60">`);
        if (unref(stage)?.mashTemp) {
          _push(`<span>Temp: ${ssrInterpolate(unref(stage).mashTemp)}°${ssrInterpolate(unref(stage).mashTempUnit)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.pH) {
          _push(`<span>pH: ${ssrInterpolate(unref(stage).pH)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(stage)?.mashTemp && !unref(stage)?.pH) {
          _push(`<span>Not recorded</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Gravity</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Pre-Boil Gravity" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).preBoilGravity,
                "onUpdate:modelValue": ($event) => unref(local).preBoilGravity = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.001",
                placeholder: "1.050"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).preBoilGravity,
                  "onUpdate:modelValue": ($event) => unref(local).preBoilGravity = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.001",
                  placeholder: "1.050"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Post-Boil Gravity" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).postBoilGravity,
                "onUpdate:modelValue": ($event) => unref(local).postBoilGravity = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.001",
                placeholder: "1.060"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).postBoilGravity,
                  "onUpdate:modelValue": ($event) => unref(local).postBoilGravity = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.001",
                  placeholder: "1.060"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex gap-6 text-sm text-parchment/60">`);
        if (unref(stage)?.preBoilGravity) {
          _push(`<span>Pre-Boil: ${ssrInterpolate(unref(stage).preBoilGravity)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.postBoilGravity) {
          _push(`<span>Post-Boil: ${ssrInterpolate(unref(stage).postBoilGravity)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(stage)?.preBoilGravity && !unref(stage)?.postBoilGravity) {
          _push(`<span>Not recorded</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(local).notes,
          "onUpdate:modelValue": ($event) => unref(local).notes = $event,
          placeholder: "Mashing notes...",
          rows: 2
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.notes || "None")}</div>`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<div class="mt-4 flex justify-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: save,
          loading: unref(saving),
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Mashing`);
            } else {
              return [
                createTextVNode("Save Mashing")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchMashing.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$k, { __name: "BatchMashing" });
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "BatchFermenting",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    useChartRegistration();
    const props = __props;
    const batchStore = useBatchStore();
    const vesselStore = useVesselStore();
    const stage = computed(() => props.batch.stages?.fermenting);
    const vesselName = computed(() => {
      if (!stage.value?.vessel) return "Not assigned";
      return vesselStore.getVesselById(stage.value.vessel)?.name || "Unknown";
    });
    const sortedReadings = computed(() => {
      const readings = stage.value?.readings || [];
      return [...readings].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
    const estimatedABV = computed(() => {
      const og = stage.value?.originalGravity;
      const fg = stage.value?.finalGravity;
      if (og && fg) return ((og - fg) * 131.25).toFixed(2);
      if (!sortedReadings.value || sortedReadings.value.length < 2) return null;
      const first = sortedReadings.value[0].gravity;
      const last = sortedReadings.value[sortedReadings.value.length - 1].gravity;
      if (!first || !last) return null;
      return ((first - last) * 131.25).toFixed(2);
    });
    const effectiveOG = computed(() => {
      if (stage.value?.originalGravity) return stage.value.originalGravity;
      if (sortedReadings.value.length > 0) return sortedReadings.value[0].gravity;
      return null;
    });
    const potentialABV = computed(() => {
      if (!effectiveOG.value) return null;
      return (effectiveOG.value - 1) * 131.25;
    });
    const readingABV = (gravity) => {
      if (!effectiveOG.value || !gravity) return null;
      return ((effectiveOG.value - gravity) * 131.25).toFixed(1);
    };
    const readingPercentDone = (gravity) => {
      if (!effectiveOG.value || !gravity || !potentialABV.value) return null;
      const currentABV = (effectiveOG.value - gravity) * 131.25;
      return Math.min(100, Math.max(0, currentABV / potentialABV.value * 100)).toFixed(0);
    };
    const startDate = computed(() => {
      if (!stage.value?.startedAt) return "Not set";
      return new Date(stage.value.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    });
    const chartData = computed(() => ({
      labels: sortedReadings.value.map(
        (r) => new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      ),
      datasets: [{
        label: "Gravity",
        data: sortedReadings.value.map((r) => r.gravity),
        borderColor: "#eab308",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        tension: 0.3,
        fill: true
      }]
    }));
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: "rgba(255,255,255,0.4)" }, grid: { color: "rgba(255,255,255,0.05)" } },
        x: { ticks: { color: "rgba(255,255,255,0.4)" }, grid: { color: "rgba(255,255,255,0.05)" } }
      }
    };
    const showAddReading = ref(false);
    const newReading = ref({
      date: /* @__PURE__ */ new Date(),
      temperature: void 0,
      temperatureUnit: "F",
      gravity: void 0,
      pH: void 0,
      notes: ""
    });
    const addReading = async () => {
      const r = newReading.value;
      const readings = [...stage.value?.readings || [], { ...r }];
      const details = [
        r.gravity != null ? `SG ${r.gravity}` : null,
        r.temperature != null ? `${r.temperature}°${r.temperatureUnit}` : null,
        r.pH != null ? `pH ${r.pH}` : null
      ].filter(Boolean).join(", ");
      await batchStore.updateStageData(props.batch._id, "Fermenting", { readings }, `Fermentation reading added${details ? ": " + details : ""}`);
      showAddReading.value = false;
      newReading.value = { date: /* @__PURE__ */ new Date(), temperature: void 0, temperatureUnit: "F", gravity: void 0, pH: void 0, notes: "" };
    };
    const local = ref({
      vessel: stage.value?.vessel || "",
      startedAt: stage.value?.startedAt ? new Date(stage.value.startedAt) : /* @__PURE__ */ new Date(),
      yeastStrain: stage.value?.yeastStrain || "",
      pitchTemp: stage.value?.pitchTemp,
      pitchTempUnit: stage.value?.pitchTempUnit || "F",
      originalGravity: stage.value?.originalGravity,
      finalGravity: stage.value?.finalGravity,
      washVolume: stage.value?.washVolume,
      washVolumeUnit: stage.value?.washVolumeUnit || "gallon",
      notes: stage.value?.notes || ""
    });
    const fermenterOptions = computed(
      () => vesselStore.fermenters.map((v) => ({ label: v.name, value: v._id }))
    );
    const savingEdits = ref(false);
    const saveEdits = async () => {
      savingEdits.value = true;
      try {
        await batchStore.updateStageData(props.batch._id, "Fermenting", {
          vessel: local.value.vessel || void 0,
          startedAt: local.value.startedAt,
          yeastStrain: local.value.yeastStrain,
          pitchTemp: local.value.pitchTemp,
          pitchTempUnit: local.value.pitchTempUnit,
          originalGravity: local.value.originalGravity,
          finalGravity: local.value.finalGravity,
          washVolume: local.value.washVolume,
          washVolumeUnit: local.value.washVolumeUnit,
          notes: local.value.notes
        });
      } finally {
        savingEdits.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_UButton = _sfc_main$8$1;
      const _component_USelect = _sfc_main$o;
      const _component_SiteDatePicker = _sfc_main$r;
      const _component_UInput = _sfc_main$m;
      const _component_UTextarea = _sfc_main$n;
      const _component_UFormField = _sfc_main$p;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-yellow-500/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-beaker",
        class: "text-lg text-yellow-400"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Fermenting</h3></div><div class="flex items-center gap-3">`);
      if (unref(estimatedABV)) {
        _push(`<span class="text-sm font-semibold text-yellow-400"> ~${ssrInterpolate(unref(estimatedABV))}% ABV </span>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          variant: "outline",
          icon: "i-lucide-plus",
          onClick: ($event) => showAddReading.value = !unref(showAddReading)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add Reading `);
            } else {
              return [
                createTextVNode(" Add Reading ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>`);
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).vessel,
          "onUpdate:modelValue": ($event) => unref(local).vessel = $event,
          items: unref(fermenterOptions),
          "value-key": "value",
          "label-key": "label",
          placeholder: "Select fermenter"
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Pitch Date</div>`);
        _push(ssrRenderComponent(_component_SiteDatePicker, {
          modelValue: unref(local).startedAt,
          "onUpdate:modelValue": ($event) => unref(local).startedAt = $event
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Yeast Strain</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).yeastStrain,
          "onUpdate:modelValue": ($event) => unref(local).yeastStrain = $event,
          placeholder: "e.g. Safale US-05"
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Pitch Temp</div><div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).pitchTemp,
          "onUpdate:modelValue": ($event) => unref(local).pitchTemp = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "72",
          class: "flex-1"
        }, null, _parent));
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).pitchTempUnit,
          "onUpdate:modelValue": ($event) => unref(local).pitchTempUnit = $event,
          items: ["F", "C"],
          class: "w-16"
        }, null, _parent));
        _push(`</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>`);
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(local).notes,
          "onUpdate:modelValue": ($event) => unref(local).notes = $event,
          placeholder: "Fermentation notes...",
          rows: 2
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vesselName))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Pitch Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(startDate))}</div></div>`);
        if (unref(stage)?.yeastStrain) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Yeast</div><div class="text-sm text-parchment">${ssrInterpolate(unref(stage).yeastStrain)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.pitchTemp) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Pitch Temp</div><div class="text-sm text-parchment">${ssrInterpolate(unref(stage).pitchTemp)}°${ssrInterpolate(unref(stage).pitchTempUnit)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.notes) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div><div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage).notes)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Original Gravity" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).originalGravity,
                "onUpdate:modelValue": ($event) => unref(local).originalGravity = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.001",
                placeholder: "1.060"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).originalGravity,
                  "onUpdate:modelValue": ($event) => unref(local).originalGravity = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.001",
                  placeholder: "1.060"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Final Gravity" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).finalGravity,
                "onUpdate:modelValue": ($event) => unref(local).finalGravity = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.001",
                placeholder: "1.010"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).finalGravity,
                  "onUpdate:modelValue": ($event) => unref(local).finalGravity = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.001",
                  placeholder: "1.010"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Wash Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).washVolume,
                "onUpdate:modelValue": ($event) => unref(local).washVolume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).washVolume,
                  "onUpdate:modelValue": ($event) => unref(local).washVolume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Vol. Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).washVolumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).washVolumeUnit = $event,
                items: ["gallon", "L"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).washVolumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).washVolumeUnit = $event,
                  items: ["gallon", "L"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex flex-wrap gap-6 mb-4 text-sm text-parchment/60">`);
        if (unref(stage)?.originalGravity) {
          _push(`<span>OG: ${ssrInterpolate(unref(stage).originalGravity)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.finalGravity) {
          _push(`<span>FG: ${ssrInterpolate(unref(stage).finalGravity)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.washVolume) {
          _push(`<span>Wash: ${ssrInterpolate(unref(stage).washVolume)} ${ssrInterpolate(unref(stage).washVolumeUnit)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      if (__props.editing) {
        _push(`<div class="mb-4 flex justify-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          size: "sm",
          onClick: saveEdits,
          loading: unref(savingEdits)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save`);
            } else {
              return [
                createTextVNode("Save")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showAddReading)) {
        _push(`<div class="mb-4 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5"><div class="grid grid-cols-2 sm:grid-cols-5 gap-3"><div><div class="text-xs text-parchment/60 mb-1">Date</div>`);
        _push(ssrRenderComponent(_component_SiteDatePicker, {
          modelValue: unref(newReading).date,
          "onUpdate:modelValue": ($event) => unref(newReading).date = $event
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 mb-1">Gravity</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newReading).gravity,
          "onUpdate:modelValue": ($event) => unref(newReading).gravity = $event,
          modelModifiers: { number: true },
          type: "number",
          step: "0.001",
          placeholder: "1.050"
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 mb-1">Temperature</div><div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newReading).temperature,
          "onUpdate:modelValue": ($event) => unref(newReading).temperature = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "72",
          class: "flex-1"
        }, null, _parent));
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(newReading).temperatureUnit,
          "onUpdate:modelValue": ($event) => unref(newReading).temperatureUnit = $event,
          items: ["F", "C"],
          class: "w-16"
        }, null, _parent));
        _push(`</div></div><div><div class="text-xs text-parchment/60 mb-1">pH</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newReading).pH,
          "onUpdate:modelValue": ($event) => unref(newReading).pH = $event,
          modelModifiers: { number: true },
          type: "number",
          step: "0.1",
          placeholder: "4.5"
        }, null, _parent));
        _push(`</div><div class="flex items-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          size: "sm",
          onClick: addReading
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Add`);
            } else {
              return [
                createTextVNode("Add")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sortedReadings).length > 0) {
        _push(`<div class="h-48 mb-4">`);
        _push(ssrRenderComponent(unref(Line), {
          data: unref(chartData),
          options: chartOptions
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sortedReadings).length > 0) {
        _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Readings</div><div class="divide-y divide-brown/20"><div class="grid grid-cols-5 gap-2 pb-2 text-xs text-parchment/50 uppercase tracking-wider"><span>Date</span><span>Gravity</span><span>ABV</span><span>% Done</span><span>Temp</span></div><!--[-->`);
        ssrRenderList(unref(sortedReadings), (reading, i) => {
          _push(`<div class="grid grid-cols-5 gap-2 py-2 text-sm items-center"><span class="text-parchment/60">${ssrInterpolate(new Date(reading.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }))}</span><span class="text-parchment">${ssrInterpolate(reading.gravity)}</span><span class="text-yellow-400">${ssrInterpolate(readingABV(reading.gravity) ? `${readingABV(reading.gravity)}%` : "—")}</span><span class="text-parchment/60">${ssrInterpolate(readingPercentDone(reading.gravity) ? `${readingPercentDone(reading.gravity)}%` : "—")}</span><span class="text-parchment/60">`);
          if (reading.temperature) {
            _push(`<!--[-->${ssrInterpolate(reading.temperature)}°${ssrInterpolate(reading.temperatureUnit)}<!--]-->`);
          } else {
            _push(`<!--[-->—<!--]-->`);
          }
          _push(`</span></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<div class="text-center py-4"><p class="text-sm text-parchment/50">No readings recorded</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchFermenting.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$j, { __name: "BatchFermenting" });
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "BatchDistillingRun",
  __ssrInlineRender: true,
  props: {
    run: {},
    runIndex: {},
    batchId: {}
  },
  emits: ["delete"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const batchStore = useBatchStore();
    const vesselStore = useVesselStore();
    const runEditing = ref(false);
    const hasData = computed(() => {
      const r = props.run;
      if (r.runType === "stripping" && r.output?.volume && r.output.volume > 0) return true;
      if (r.runType === "spirit" && r.collected?.hearts?.volume && r.collected.hearts.volume > 0) return true;
      if (r.total?.volume && r.total.volume > 0) return true;
      return false;
    });
    const isRunEditing = computed(() => runEditing.value);
    const globalExpanded = inject("distillingRunsGlobalExpanded", ref(null));
    const localCollapsed = ref(true);
    watch(globalExpanded, (val) => {
      if (val === null) return;
      localCollapsed.value = !val;
    }, { immediate: false });
    const collapsed = computed(() => isRunEditing.value ? false : localCollapsed.value);
    const volumeUnits2 = ["gallon", "L", "mL", "fl oz"];
    const local = ref(structuredClone(toRaw(props.run)));
    watch(() => props.run, (newRun) => {
      local.value = structuredClone(toRaw(newRun));
    }, { deep: true });
    const dateString = computed({
      get: () => {
        if (!local.value.date) return "";
        return new Date(local.value.date).toISOString().split("T")[0];
      },
      set: (val) => {
        local.value.date = val ? new Date(val) : void 0;
      }
    });
    const destinationVesselOptions = computed(() => [
      ...vesselStore.stills.map((v) => ({ label: `${v.name} (Still)`, value: v._id })),
      ...vesselStore.tanks.map((v) => ({ label: `${v.name} (Tank)`, value: v._id })),
      ...vesselStore.emptyBarrels.map((v) => ({ label: `${v.name} (Barrel)`, value: v._id }))
    ]);
    const cutVesselOptions = computed(() => [
      { label: "Disposed", value: "disposed" },
      ...destinationVesselOptions.value
    ]);
    const sourceVesselOptions = computed(() => [
      ...vesselStore.stills.map((v) => ({ label: `${v.name} (Still)`, value: v._id })),
      ...vesselStore.tanks.map((v) => ({ label: `${v.name} (Tank)`, value: v._id })),
      ...vesselStore.barrels.map((v) => ({ label: `${v.name} (Barrel)`, value: v._id }))
    ]);
    const getVesselName = (id) => {
      if (!id) return "N/A";
      if (id === "disposed") return "Disposed";
      return vesselStore.getVesselById(id)?.name || "Unknown";
    };
    const addAddition = () => {
      if (!local.value.additions) local.value.additions = [];
      local.value.additions.push({ label: "", sourceVessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 });
    };
    const removeAddition = (index) => {
      local.value.additions?.splice(index, 1);
    };
    const ensureCollected = () => {
      if (!local.value.collected) {
        local.value.collected = {
          foreshots: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
          heads: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
          lateHeads: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
          hearts: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
          tails: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 }
        };
      }
      if (local.value.collected && !local.value.collected.lateHeads) {
        local.value.collected.lateHeads = { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 };
      }
    };
    const ensureOutput = () => {
      if (!local.value.output) {
        local.value.output = { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0, proofGallons: void 0 };
      }
    };
    if (local.value.runType === "spirit") ensureCollected();
    if (local.value.runType === "stripping") ensureOutput();
    watch(() => local.value.runType, (type) => {
      if (type === "spirit") ensureCollected();
      if (type === "stripping") ensureOutput();
    });
    const calculatedTotal = computed(() => {
      const r = local.value;
      if (r.runType === "stripping" && r.output) {
        const vol = r.output.volume || 0;
        const unit = r.output.volumeUnit || "gallon";
        const abv = r.output.abv || 0;
        return {
          volume: vol,
          volumeUnit: unit,
          abv,
          proofGallons: vol && abv ? calculateProofGallons(vol, unit, abv) : 0
        };
      }
      if (r.runType === "spirit" && r.collected) {
        const cuts = [r.collected.foreshots, r.collected.heads, r.collected.lateHeads, r.collected.hearts, r.collected.tails].filter(Boolean);
        const baseUnit = cuts[0]?.volumeUnit || "gallon";
        const totalVol = cuts.reduce(
          (sum, c) => sum + (c.volume || 0) * convertUnitRatio(c.volumeUnit || "gallon", baseUnit),
          0
        );
        const weightedAbv = totalVol > 0 ? cuts.reduce(
          (sum, c) => sum + (c.volume || 0) * convertUnitRatio(c.volumeUnit || "gallon", baseUnit) * (c.abv || 0),
          0
        ) / totalVol : 0;
        return {
          volume: totalVol,
          volumeUnit: baseUnit,
          abv: +weightedAbv.toFixed(2),
          proofGallons: totalVol && weightedAbv ? calculateProofGallons(totalVol, baseUnit, weightedAbv) : 0
        };
      }
      return null;
    });
    const displayTotal = computed(() => {
      if (props.run.total?.proofGallons) return props.run.total;
      return calculatedTotal.value;
    });
    const cutLabels = ["foreshots", "heads", "lateHeads", "hearts", "tails"];
    const cutDisplayLabels = {
      foreshots: "Foreshots",
      heads: "Heads",
      lateHeads: "Late Heads",
      hearts: "Hearts",
      tails: "Tails"
    };
    const displayCuts = computed(() => {
      if (!props.run.collected) return [];
      return cutLabels.map((key) => ({ label: cutDisplayLabels[key] || key, key, data: props.run.collected[key] })).filter((c) => c.data);
    });
    const saving = ref(false);
    const save = async () => {
      saving.value = true;
      try {
        const data = { ...local.value };
        if (calculatedTotal.value) {
          data.total = calculatedTotal.value;
        }
        if (data.output && !data.output.vessel) data.output.vessel = void 0;
        if (data.collected) {
          for (const key of cutLabels) {
            const cut = data.collected[key];
            if (cut && !cut.vessel) cut.vessel = void 0;
          }
        }
        await batchStore.updateDistillingRun(props.batchId, props.runIndex, data);
        runEditing.value = false;
      } finally {
        saving.value = false;
      }
    };
    const completing = ref(false);
    const completeRun = async () => {
      completing.value = true;
      try {
        const data = { ...local.value };
        if (calculatedTotal.value) {
          data.total = calculatedTotal.value;
        }
        data.completed = true;
        if (data.output && !data.output.vessel) data.output.vessel = void 0;
        if (data.collected) {
          for (const key of cutLabels) {
            const cut = data.collected[key];
            if (cut && !cut.vessel) cut.vessel = void 0;
          }
        }
        const batch = batchStore.items.find((b) => b._id === props.batchId);
        const stillId = batch?.stages?.distilling?.vessel;
        if (stillId) {
          const still = vesselStore.getVesselById(stillId);
          const stillBatchEntry = still?.contents?.find((c) => c.batch === props.batchId);
          const chargeValue = stillBatchEntry?.value || 0;
          if (still?.contents) {
            still.contents = still.contents.filter((c) => c.batch !== props.batchId);
            vesselStore.vessel = still;
            await vesselStore.updateVessel();
          }
          if (data.runType === "stripping" && data.output?.vessel && data.output.vessel !== "disposed") {
            await vesselStore.addContents(data.output.vessel, {
              batch: props.batchId,
              volume: data.output.volume || 0,
              volumeUnit: data.output.volumeUnit || "gallon",
              abv: data.output.abv || 0,
              value: chargeValue
            });
          } else if (data.runType === "spirit" && data.collected) {
            for (const key of cutLabels) {
              const cut = data.collected[key];
              if (!cut || !cut.vessel || cut.vessel === "disposed" || cut.disposed) continue;
              if ((cut.volume || 0) <= 0) continue;
              await vesselStore.addContents(cut.vessel, {
                batch: props.batchId,
                volume: cut.volume || 0,
                volumeUnit: cut.volumeUnit || "gallon",
                abv: cut.abv || 0,
                value: key === "hearts" ? chargeValue : 0
              });
            }
          }
        }
        await batchStore.updateDistillingRun(props.batchId, props.runIndex, data);
        runEditing.value = false;
      } finally {
        completing.value = false;
      }
    };
    const canComplete = computed(() => {
      if (props.run.completed) return false;
      const r = local.value;
      if (r.runType === "stripping") {
        return (r.output?.volume || 0) > 0 && !!r.output?.vessel;
      }
      if (r.runType === "spirit") {
        return (r.collected?.hearts?.volume || 0) > 0;
      }
      return false;
    });
    const cancelEdit = () => {
      runEditing.value = false;
      local.value = structuredClone(toRaw(props.run));
    };
    const formatDate = (d) => {
      if (!d) return "Not set";
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };
    const summaryCharge = computed(() => {
      const r = props.run;
      if (!r.chargeVolume) return "";
      return `${r.chargeVolume} ${r.chargeVolumeUnit || "gal"} @ ${r.chargeAbv || 0}% ABV`;
    });
    const summaryProofGallons = computed(() => {
      const total = displayTotal.value;
      if (!total?.proofGallons) return "";
      return `${total.proofGallons.toFixed(2)} PG`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_UBadge = _sfc_main$q;
      const _component_UButton = _sfc_main$8$1;
      const _component_UFormField = _sfc_main$p;
      const _component_USelect = _sfc_main$o;
      const _component_UInput = _sfc_main$m;
      const _component_UTextarea = _sfc_main$n;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["bg-brown/5 rounded-lg border border-brown/20 overflow-hidden", { "border-green-500/30": __props.run.completed }]
      }, _attrs))}><div class="${ssrRenderClass([{ "cursor-default": unref(isRunEditing) }, "flex items-center gap-2 px-4 py-3 cursor-pointer select-none transition-colors hover:bg-brown/10"])}">`);
      if (!unref(isRunEditing)) {
        _push(ssrRenderComponent(_component_UIcon, {
          name: unref(collapsed) ? "i-lucide-chevron-right" : "i-lucide-chevron-down",
          class: "text-parchment/60 shrink-0 transition-transform duration-200"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="text-sm font-bold text-parchment font-[Cormorant_Garamond] shrink-0"> Run #${ssrInterpolate(unref(local).runNumber)}</span>`);
      _push(ssrRenderComponent(_component_UBadge, {
        color: unref(local).runType === "spirit" ? "primary" : "neutral",
        variant: "subtle",
        size: "xs",
        class: "shrink-0"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(local).runType || "unset")}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(local).runType || "unset"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (__props.run.completed) {
        _push(ssrRenderComponent(_component_UBadge, {
          color: "success",
          variant: "subtle",
          size: "xs",
          class: "shrink-0"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Complete `);
            } else {
              return [
                createTextVNode(" Complete ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(collapsed)) {
        _push(`<!--[--><span class="text-xs text-parchment/50 shrink-0">${ssrInterpolate(formatDate(unref(local).date))}</span>`);
        if (unref(summaryCharge)) {
          _push(`<span class="text-xs text-parchment/60 truncate hidden sm:inline">${ssrInterpolate(unref(summaryCharge))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span class="ml-auto"></span>`);
        if (unref(summaryProofGallons)) {
          _push(`<span class="text-xs font-semibold text-copper shrink-0">${ssrInterpolate(unref(summaryProofGallons))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!--[--><span class="ml-auto"></span><span class="text-xs text-parchment/50">${ssrInterpolate(formatDate(unref(local).date))}</span>`);
        if (!unref(isRunEditing)) {
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-pencil",
            variant: "ghost",
            size: "xs",
            onClick: ($event) => runEditing.value = true
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(isRunEditing)) {
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-trash-2",
            color: "error",
            variant: "ghost",
            size: "xs",
            onClick: ($event) => emit("delete", __props.runIndex)
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div><div class="${ssrRenderClass([unref(collapsed) ? "grid-rows-[0fr]" : "grid-rows-[1fr]", "grid transition-[grid-template-rows] duration-200 ease-in-out"])}"><div class="overflow-hidden"><div class="px-4 pb-4">`);
      if (unref(isRunEditing)) {
        _push(`<!--[--><div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Run Type" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).runType,
                "onUpdate:modelValue": ($event) => unref(local).runType = $event,
                items: ["stripping", "spirit"],
                placeholder: "Select type"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).runType,
                  "onUpdate:modelValue": ($event) => unref(local).runType = $event,
                  items: ["stripping", "spirit"],
                  placeholder: "Select type"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Date" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(dateString),
                "onUpdate:modelValue": ($event) => isRef(dateString) ? dateString.value = $event : null,
                type: "date"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(dateString),
                  "onUpdate:modelValue": ($event) => isRef(dateString) ? dateString.value = $event : null,
                  type: "date"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Charge (into still)</div><div class="grid grid-cols-3 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).chargeVolume,
                "onUpdate:modelValue": ($event) => unref(local).chargeVolume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).chargeVolume,
                  "onUpdate:modelValue": ($event) => unref(local).chargeVolume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).chargeVolumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).chargeVolumeUnit = $event,
                items: volumeUnits2
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).chargeVolumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).chargeVolumeUnit = $event,
                  items: volumeUnits2
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).chargeAbv,
                "onUpdate:modelValue": ($event) => unref(local).chargeAbv = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.1",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).chargeAbv,
                  "onUpdate:modelValue": ($event) => unref(local).chargeAbv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="mb-4"><div class="flex items-center justify-between mb-2"><div class="text-xs text-parchment/60 uppercase tracking-wider">Additions</div>`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-plus",
          size: "xs",
          variant: "ghost",
          onClick: addAddition
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Add`);
            } else {
              return [
                createTextVNode("Add")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(local).additions?.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(local).additions, (addition, i) => {
            _push(`<div class="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end p-2 rounded border border-brown/10 bg-brown/5">`);
            _push(ssrRenderComponent(_component_UFormField, { label: "Label" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UInput, {
                    modelValue: addition.label,
                    "onUpdate:modelValue": ($event) => addition.label = $event,
                    placeholder: "Tails, Low wines...",
                    size: "sm"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: addition.label,
                      "onUpdate:modelValue": ($event) => addition.label = $event,
                      placeholder: "Tails, Low wines...",
                      size: "sm"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UFormField, { label: "Source Vessel" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_USelect, {
                    modelValue: addition.sourceVessel,
                    "onUpdate:modelValue": ($event) => addition.sourceVessel = $event,
                    items: unref(sourceVesselOptions),
                    "value-key": "value",
                    "label-key": "label",
                    placeholder: "Vessel",
                    size: "sm"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_USelect, {
                      modelValue: addition.sourceVessel,
                      "onUpdate:modelValue": ($event) => addition.sourceVessel = $event,
                      items: unref(sourceVesselOptions),
                      "value-key": "value",
                      "label-key": "label",
                      placeholder: "Vessel",
                      size: "sm"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UInput, {
                    modelValue: addition.volume,
                    "onUpdate:modelValue": ($event) => addition.volume = $event,
                    modelModifiers: { number: true },
                    type: "number",
                    placeholder: "0",
                    size: "sm"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: addition.volume,
                      "onUpdate:modelValue": ($event) => addition.volume = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      placeholder: "0",
                      size: "sm"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UInput, {
                    modelValue: addition.abv,
                    "onUpdate:modelValue": ($event) => addition.abv = $event,
                    modelModifiers: { number: true },
                    type: "number",
                    step: "0.1",
                    placeholder: "0",
                    size: "sm"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: addition.abv,
                      "onUpdate:modelValue": ($event) => addition.abv = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      step: "0.1",
                      placeholder: "0",
                      size: "sm"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<div class="flex justify-end">`);
            _push(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-x",
              color: "error",
              variant: "ghost",
              size: "xs",
              onClick: ($event) => removeAddition(i)
            }, null, _parent));
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-xs text-parchment/50 italic">None</div>`);
        }
        _push(`</div>`);
        if (unref(local).runType === "stripping") {
          _push(`<div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Output</div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3">`);
          _push(ssrRenderComponent(_component_UFormField, { label: "Vessel" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_USelect, {
                  modelValue: unref(local).output.vessel,
                  "onUpdate:modelValue": ($event) => unref(local).output.vessel = $event,
                  items: unref(cutVesselOptions),
                  "value-key": "value",
                  "label-key": "label",
                  placeholder: "Vessel"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_USelect, {
                    modelValue: unref(local).output.vessel,
                    "onUpdate:modelValue": ($event) => unref(local).output.vessel = $event,
                    items: unref(cutVesselOptions),
                    "value-key": "value",
                    "label-key": "label",
                    placeholder: "Vessel"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: unref(local).output.volume,
                  "onUpdate:modelValue": ($event) => unref(local).output.volume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UInput, {
                    modelValue: unref(local).output.volume,
                    "onUpdate:modelValue": ($event) => unref(local).output.volume = $event,
                    modelModifiers: { number: true },
                    type: "number",
                    placeholder: "0"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_USelect, {
                  modelValue: unref(local).output.volumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).output.volumeUnit = $event,
                  items: volumeUnits2
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_USelect, {
                    modelValue: unref(local).output.volumeUnit,
                    "onUpdate:modelValue": ($event) => unref(local).output.volumeUnit = $event,
                    items: volumeUnits2
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: unref(local).output.abv,
                  "onUpdate:modelValue": ($event) => unref(local).output.abv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "0"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UInput, {
                    modelValue: unref(local).output.abv,
                    "onUpdate:modelValue": ($event) => unref(local).output.abv = $event,
                    modelModifiers: { number: true },
                    type: "number",
                    step: "0.1",
                    placeholder: "0"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(local).runType === "spirit") {
          _push(`<div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Collected Cuts</div><div class="space-y-2"><!--[-->`);
          ssrRenderList(cutLabels, (cut) => {
            _push(`<div class="p-3 rounded border border-brown/10 bg-brown/5">`);
            if (unref(local).collected?.[cut]) {
              _push(`<!--[--><div class="flex items-center justify-between mb-2"><div class="text-xs font-semibold text-parchment/60 uppercase">${ssrInterpolate(cutDisplayLabels[cut] || cut)}</div><label class="flex items-center gap-1.5 cursor-pointer"><input type="checkbox"${ssrIncludeBooleanAttr(unref(local).collected[cut].disposed || unref(local).collected[cut].vessel === "disposed") ? " checked" : ""} class="rounded border-brown/30 bg-charcoal text-error-500 focus:ring-error-500/50"><span class="text-xs text-parchment/50">Disposed</span></label></div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3">`);
              _push(ssrRenderComponent(_component_UFormField, { label: "Vessel" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_USelect, {
                      modelValue: unref(local).collected[cut].vessel,
                      "onUpdate:modelValue": ($event) => unref(local).collected[cut].vessel = $event,
                      items: unref(cutVesselOptions),
                      "value-key": "value",
                      "label-key": "label",
                      placeholder: "Vessel",
                      disabled: unref(local).collected[cut].disposed
                    }, null, _parent2, _scopeId));
                  } else {
                    return [
                      createVNode(_component_USelect, {
                        modelValue: unref(local).collected[cut].vessel,
                        "onUpdate:modelValue": ($event) => unref(local).collected[cut].vessel = $event,
                        items: unref(cutVesselOptions),
                        "value-key": "value",
                        "label-key": "label",
                        placeholder: "Vessel",
                        disabled: unref(local).collected[cut].disposed
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items", "disabled"])
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_UInput, {
                      modelValue: unref(local).collected[cut].volume,
                      "onUpdate:modelValue": ($event) => unref(local).collected[cut].volume = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      placeholder: "0"
                    }, null, _parent2, _scopeId));
                  } else {
                    return [
                      createVNode(_component_UInput, {
                        modelValue: unref(local).collected[cut].volume,
                        "onUpdate:modelValue": ($event) => unref(local).collected[cut].volume = $event,
                        modelModifiers: { number: true },
                        type: "number",
                        placeholder: "0"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_USelect, {
                      modelValue: unref(local).collected[cut].volumeUnit,
                      "onUpdate:modelValue": ($event) => unref(local).collected[cut].volumeUnit = $event,
                      items: volumeUnits2
                    }, null, _parent2, _scopeId));
                  } else {
                    return [
                      createVNode(_component_USelect, {
                        modelValue: unref(local).collected[cut].volumeUnit,
                        "onUpdate:modelValue": ($event) => unref(local).collected[cut].volumeUnit = $event,
                        items: volumeUnits2
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_UInput, {
                      modelValue: unref(local).collected[cut].abv,
                      "onUpdate:modelValue": ($event) => unref(local).collected[cut].abv = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      step: "0.1",
                      placeholder: "0"
                    }, null, _parent2, _scopeId));
                  } else {
                    return [
                      createVNode(_component_UInput, {
                        modelValue: unref(local).collected[cut].abv,
                        "onUpdate:modelValue": ($event) => unref(local).collected[cut].abv = $event,
                        modelModifiers: { number: true },
                        type: "number",
                        step: "0.1",
                        placeholder: "0"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div><!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(calculatedTotal) && unref(local).runType) {
          _push(`<div class="mb-4 p-3 rounded border border-copper/20 bg-copper/5"><div class="text-xs font-semibold text-copper uppercase mb-1">Calculated Total</div><div class="flex gap-4 text-sm text-parchment"><span>${ssrInterpolate(unref(calculatedTotal).volume?.toFixed(2))} ${ssrInterpolate(unref(calculatedTotal).volumeUnit)}</span><span>${ssrInterpolate(unref(calculatedTotal).abv)}% ABV</span><span class="text-copper font-semibold">${ssrInterpolate(unref(calculatedTotal).proofGallons?.toFixed(4))} PG</span></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mb-4">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Notes" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UTextarea, {
                modelValue: unref(local).notes,
                "onUpdate:modelValue": ($event) => unref(local).notes = $event,
                placeholder: "Run notes...",
                rows: 2
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UTextarea, {
                  modelValue: unref(local).notes,
                  "onUpdate:modelValue": ($event) => unref(local).notes = $event,
                  placeholder: "Run notes...",
                  rows: 2
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="flex items-center gap-2 justify-end">`);
        if (unref(hasData)) {
          _push(ssrRenderComponent(_component_UButton, {
            variant: "ghost",
            color: "neutral",
            size: "sm",
            onClick: cancelEdit
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Cancel `);
              } else {
                return [
                  createTextVNode(" Cancel ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UButton, {
          onClick: save,
          loading: unref(saving),
          size: "sm",
          variant: "outline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Run`);
            } else {
              return [
                createTextVNode("Save Run")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(canComplete)) {
          _push(ssrRenderComponent(_component_UButton, {
            onClick: completeRun,
            loading: unref(completing),
            size: "sm",
            color: "success",
            icon: "i-lucide-check"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Complete Run `);
              } else {
                return [
                  createTextVNode(" Complete Run ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><!--]-->`);
      } else {
        _push(`<!--[--><div class="mb-3"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Charge</div><div class="text-sm text-parchment">`);
        if (__props.run.chargeVolume) {
          _push(`<!--[-->${ssrInterpolate(__props.run.chargeVolume)} ${ssrInterpolate(__props.run.chargeVolumeUnit || "gallon")} @ ${ssrInterpolate(__props.run.chargeAbv || 0)}% ABV `);
          if (__props.run.chargeSourceVessels?.length) {
            _push(`<span class="text-parchment/50"> (from ${ssrInterpolate(__props.run.chargeSourceVessels.map((id) => getVesselName(id)).join(", "))}) </span>`);
          } else if (__props.run.chargeSourceVessel) {
            _push(`<span class="text-parchment/50"> (from ${ssrInterpolate(getVesselName(__props.run.chargeSourceVessel))}) </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        } else {
          _push(`<!--[-->Not recorded<!--]-->`);
        }
        _push(`</div></div>`);
        if (__props.run.additions?.length) {
          _push(`<div class="mb-3"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Additions</div><!--[-->`);
          ssrRenderList(__props.run.additions, (a, i) => {
            _push(`<div class="text-sm text-parchment/70">${ssrInterpolate(a.label || "Addition")}: ${ssrInterpolate(a.volume)} ${ssrInterpolate(a.volumeUnit || "gallon")} @ ${ssrInterpolate(a.abv || 0)}% ABV `);
            if (a.sourceVessel) {
              _push(`<span class="text-parchment/50">(from ${ssrInterpolate(getVesselName(a.sourceVessel))})</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.run.runType === "stripping" && __props.run.output) {
          _push(`<div class="mb-3"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Output</div><div class="text-sm text-parchment">${ssrInterpolate(__props.run.output.volume)} ${ssrInterpolate(__props.run.output.volumeUnit || "gallon")} @ ${ssrInterpolate(__props.run.output.abv || 0)}% ABV <span class="text-parchment/50">→ ${ssrInterpolate(getVesselName(__props.run.output.vessel))}</span></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.run.runType === "spirit" && unref(displayCuts).length) {
          _push(`<div class="mb-3"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Cuts</div><div class="divide-y divide-brown/10"><!--[-->`);
          ssrRenderList(unref(displayCuts), (cut) => {
            _push(`<div class="flex items-center justify-between py-1.5 gap-2"><span class="text-xs font-medium text-parchment/60 uppercase w-20 shrink-0">${ssrInterpolate(cut.label)}</span><span class="${ssrRenderClass([cut.data?.disposed || cut.data?.vessel === "disposed" ? "text-error-400" : "text-parchment/50", "text-sm truncate"])}">`);
            if (cut.data?.disposed || cut.data?.vessel === "disposed") {
              _push(`<!--[-->`);
              _push(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-trash-2",
                class: "inline-block mr-0.5 text-xs"
              }, null, _parent));
              _push(` Disposed <!--]-->`);
            } else {
              _push(`<!--[-->${ssrInterpolate(getVesselName(cut.data?.vessel))}<!--]-->`);
            }
            _push(`</span><span class="text-sm text-parchment whitespace-nowrap">${ssrInterpolate(cut.data?.volume || 0)} ${ssrInterpolate(cut.data?.volumeUnit || "gallon")}</span><span class="text-sm text-parchment/60 whitespace-nowrap">${ssrInterpolate(cut.data?.abv || 0)}% ABV</span></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(displayTotal)) {
          _push(`<div class="mb-3 p-2 rounded bg-copper/5 border border-copper/10"><div class="flex items-center justify-between text-sm"><span class="text-xs font-semibold text-copper uppercase">Total</span><span class="text-parchment">${ssrInterpolate(unref(displayTotal).volume?.toFixed(2))} ${ssrInterpolate(unref(displayTotal).volumeUnit || "gallon")} @ ${ssrInterpolate(unref(displayTotal).abv)}% ABV </span>`);
          if (unref(displayTotal).proofGallons) {
            _push(`<span class="text-copper font-semibold">${ssrInterpolate(unref(displayTotal).proofGallons?.toFixed(4))} PG </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.run.notes) {
          _push(`<div class="text-sm text-parchment/50 italic">${ssrInterpolate(__props.run.notes)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchDistillingRun.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const __nuxt_component_4$2 = Object.assign(_sfc_main$i, { __name: "BatchDistillingRun" });
const LazyModalDistillingCharge = defineAsyncComponent(() => import('./ModalDistillingCharge-DUXLrys7.mjs').then((r) => r["default"] || r.default || r));
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "BatchDistilling",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const vesselStore = useVesselStore();
    const overlay = useOverlay();
    const globalExpanded = ref(null);
    provide("distillingRunsGlobalExpanded", globalExpanded);
    const allExpanded = ref(false);
    const toggleAllRuns = () => {
      allExpanded.value = !allExpanded.value;
      globalExpanded.value = allExpanded.value;
    };
    const stage = computed(() => props.batch.stages?.distilling);
    const runs = computed(() => normalizeDistillingRuns(stage.value));
    const vesselName = computed(() => {
      if (!stage.value?.vessel) return "Not assigned";
      return vesselStore.getVesselById(stage.value.vessel)?.name || "Unknown";
    });
    const stillOptions = computed(
      () => vesselStore.stills.map((v) => ({ label: v.name, value: v._id }))
    );
    const localVessel = ref(stage.value?.vessel || "");
    const localNotes = ref(stage.value?.notes || "");
    watch(() => stage.value?.vessel, (v) => {
      localVessel.value = v || "";
    });
    watch(() => stage.value?.notes, (n) => {
      localNotes.value = n || "";
    });
    const startDate = computed(() => {
      if (!stage.value?.startedAt) return "Not set";
      return new Date(stage.value.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    });
    const strippingRuns = computed(() => runs.value.filter((r) => r.runType === "stripping"));
    const spiritRuns = computed(() => runs.value.filter((r) => r.runType === "spirit"));
    const totalRuns = computed(() => runs.value.length);
    const totalProofGallons = computed(
      () => runs.value.reduce((sum, r) => sum + (r.total?.proofGallons || 0), 0)
    );
    const strippingCount = computed(() => strippingRuns.value.length);
    const spiritCount = computed(() => spiritRuns.value.length);
    const strippingTotalVolume = computed(
      () => strippingRuns.value.reduce((sum, r) => sum + (r.output?.volume || r.total?.volume || 0), 0)
    );
    const strippingTotalUnit = computed(
      () => strippingRuns.value[0]?.output?.volumeUnit || strippingRuns.value[0]?.total?.volumeUnit || "gallon"
    );
    const strippingAvgAbv = computed(() => {
      const runsWithOutput = strippingRuns.value.filter((r) => (r.output?.volume || r.total?.volume) && (r.output?.abv || r.total?.abv));
      if (runsWithOutput.length === 0) return 0;
      const totalVol = runsWithOutput.reduce((s, r) => s + (r.output?.volume || r.total?.volume || 0), 0);
      if (totalVol === 0) return 0;
      return runsWithOutput.reduce((s, r) => {
        const vol = r.output?.volume || r.total?.volume || 0;
        const abv = r.output?.abv || r.total?.abv || 0;
        return s + vol * abv;
      }, 0) / totalVol;
    });
    const heartsTotalVolume = computed(
      () => spiritRuns.value.reduce((sum, r) => sum + (r.collected?.hearts?.volume || 0), 0)
    );
    const heartsTotalUnit = computed(
      () => spiritRuns.value[0]?.collected?.hearts?.volumeUnit || "gallon"
    );
    const workflowPhase = computed(() => {
      if (runs.value.length === 0) return "not-started";
      const hasStripping = strippingCount.value > 0;
      const hasSpirit = spiritCount.value > 0;
      const spiritComplete = hasSpirit && spiritRuns.value.every((r) => r.total?.volume && r.total.volume > 0);
      if (spiritComplete) return "complete";
      if (hasSpirit) return "spirit";
      if (hasStripping) return "ready-for-spirit";
      return "stripping";
    });
    const getRunIndex = (run) => runs.value.indexOf(run);
    const fermentingVesselId = computed(() => {
      const fermStageKey = STAGE_KEY_MAP["Fermenting"];
      const fermStage = props.batch.stages?.[fermStageKey];
      return fermStage?.vessel;
    });
    const addingRun = ref(false);
    const addRun = async (defaultRunType) => {
      const chargeModal = overlay.create(LazyModalDistillingCharge);
      const result = await chargeModal.open({
        batchId: props.batch._id,
        sourceVesselId: fermentingVesselId.value,
        defaultRunType,
        isFirstRun: false
      });
      if (!result) return;
      addingRun.value = true;
      try {
        const sourceVessels = result.chargeSourceVessels || (result.chargeSourceVessel ? [result.chargeSourceVessel] : []);
        if (result.chargeVolume > 0 && sourceVessels.length > 0) {
          for (const vesselId of sourceVessels) {
            const perVessel = result.chargePerVessel?.find((p) => p.vesselId === vesselId);
            if (perVessel) {
              await vesselStore.transferBatchContents(
                vesselId,
                result.stillId,
                props.batch._id,
                perVessel.volume,
                perVessel.volumeUnit
              );
            } else {
              const vessel = vesselStore.getVesselById(vesselId);
              const entry = vessel?.contents?.find((c) => c.batch === props.batch._id);
              if (!entry || entry.volume <= 0) continue;
              await vesselStore.transferBatchContents(
                vesselId,
                result.stillId,
                props.batch._id,
                entry.volume,
                entry.volumeUnit
              );
            }
          }
        }
        for (const addition of result.additions) {
          if (addition.sourceVessel && (addition.volume || 0) > 0) {
            await vesselStore.transferBatch(addition.sourceVessel, result.stillId, {
              volume: addition.volume,
              volumeUnit: addition.volumeUnit || "gallon",
              abv: addition.abv || 0,
              value: 0
            });
          }
        }
        if (result.stillId !== stage.value?.vessel) {
          await batchStore.updateStageData(props.batch._id, "Distilling", {
            vessel: result.stillId
          });
        }
        const newRun = {
          runType: result.runType,
          date: /* @__PURE__ */ new Date(),
          chargeVolume: result.chargeVolume,
          chargeVolumeUnit: result.chargeVolumeUnit,
          chargeAbv: result.chargeAbv,
          chargeSourceVessel: sourceVessels[0] || "",
          chargeSourceVessels: sourceVessels,
          additions: result.additions.length > 0 ? result.additions : void 0
        };
        if (result.runType === "stripping") {
          newRun.output = { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0, proofGallons: void 0 };
        } else {
          newRun.collected = {
            foreshots: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
            heads: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
            lateHeads: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
            hearts: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
            tails: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 }
          };
        }
        await batchStore.addDistillingRun(props.batch._id, newRun);
      } catch (error) {
        const toast = useToast();
        toast.add({
          title: "Failed to add distilling run",
          description: getErrorMessage(error),
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        addingRun.value = false;
      }
    };
    const deleteRun = async (runIndex) => {
      await batchStore.deleteDistillingRun(props.batch._id, runIndex);
    };
    const savingStage = ref(false);
    const saveStageFields = async () => {
      savingStage.value = true;
      try {
        await batchStore.updateStageData(props.batch._id, "Distilling", {
          vessel: localVessel.value || void 0,
          notes: localNotes.value || void 0
        });
      } finally {
        savingStage.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_USelect = _sfc_main$o;
      const _component_UTextarea = _sfc_main$n;
      const _component_UButton = _sfc_main$8$1;
      const _component_BatchDistillingRun = __nuxt_component_4$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-copper/30 p-5" }, _attrs))}><div class="flex items-center gap-2 mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-flask-conical",
        class: "text-lg text-copper"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Distilling</h3></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Still</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(localVessel),
          "onUpdate:modelValue": ($event) => isRef(localVessel) ? localVessel.value = $event : null,
          items: unref(stillOptions),
          "value-key": "value",
          "label-key": "label",
          placeholder: "Select still"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(vesselName))}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(startDate))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Overall Notes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(localNotes),
          "onUpdate:modelValue": ($event) => isRef(localNotes) ? localNotes.value = $event : null,
          placeholder: "Stage-level notes...",
          rows: 1
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.notes || "None")}</div>`);
      }
      _push(`</div></div>`);
      if (__props.editing) {
        _push(`<div class="flex justify-end mb-4">`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: saveStageFields,
          loading: unref(savingStage),
          size: "xs",
          variant: "outline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Stage Info`);
            } else {
              return [
                createTextVNode("Save Stage Info")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(runs).length > 0) {
        _push(`<div class="mb-5 rounded-lg border border-brown/20 bg-brown/5 p-4"><div class="flex items-center justify-between mb-3"><div class="text-xs text-parchment/60 uppercase tracking-wider">Distilling Workflow</div></div><div class="flex items-center gap-0"><div class="flex flex-col items-center gap-1 flex-1"><div class="${ssrRenderClass([
          "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
          unref(strippingCount) > 0 ? "bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/30" : "bg-brown/20 text-parchment/50",
          unref(workflowPhase) === "stripping" && "animate-pulse"
        ])}">`);
        _push(ssrRenderComponent(_component_UIcon, { name: "i-lucide-flame" }, null, _parent));
        _push(`</div><span class="text-[10px] text-parchment/50 uppercase tracking-wider">Strip</span>`);
        if (unref(strippingCount) > 0) {
          _push(`<span class="text-[10px] text-amber-400 font-semibold">${ssrInterpolate(unref(strippingCount))} ${ssrInterpolate(unref(strippingCount) === 1 ? "run" : "runs")}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([
          "flex-1 h-0.5 rounded -mt-5",
          unref(strippingCount) > 0 ? "bg-amber-500/40" : "bg-brown/20"
        ])}"></div><div class="flex flex-col items-center gap-1 flex-1"><div class="${ssrRenderClass([
          "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
          unref(workflowPhase) === "ready-for-spirit" || unref(workflowPhase) === "spirit" || unref(workflowPhase) === "complete" ? "bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/30" : unref(strippingCount) > 0 ? "bg-yellow-500/10 text-yellow-400/60 ring-1 ring-yellow-500/20" : "bg-brown/20 text-parchment/50",
          unref(workflowPhase) === "ready-for-spirit" && "animate-pulse"
        ])}">`);
        _push(ssrRenderComponent(_component_UIcon, { name: "i-lucide-beaker" }, null, _parent));
        _push(`</div><span class="text-[10px] text-parchment/50 uppercase tracking-wider">Low Wines</span>`);
        if (unref(strippingTotalVolume) > 0) {
          _push(`<span class="text-[10px] text-yellow-400 font-semibold">${ssrInterpolate(unref(strippingTotalVolume).toFixed(1))} ${ssrInterpolate(unref(strippingTotalUnit) === "gallon" ? "gal" : unref(strippingTotalUnit))} `);
          if (unref(strippingAvgAbv) > 0) {
            _push(`<span class="text-parchment/60">@ ${ssrInterpolate(unref(strippingAvgAbv).toFixed(1))}%</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([
          "flex-1 h-0.5 rounded -mt-5",
          unref(spiritCount) > 0 ? "bg-copper/40" : "bg-brown/20"
        ])}"></div><div class="flex flex-col items-center gap-1 flex-1"><div class="${ssrRenderClass([
          "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
          unref(spiritCount) > 0 ? "bg-copper/20 text-copper ring-2 ring-copper/30" : "bg-brown/20 text-parchment/50",
          unref(workflowPhase) === "spirit" && "animate-pulse"
        ])}">`);
        _push(ssrRenderComponent(_component_UIcon, { name: "i-lucide-flask-conical" }, null, _parent));
        _push(`</div><span class="text-[10px] text-parchment/50 uppercase tracking-wider">Spirit</span>`);
        if (unref(spiritCount) > 0) {
          _push(`<span class="text-[10px] text-copper font-semibold">${ssrInterpolate(unref(spiritCount))} ${ssrInterpolate(unref(spiritCount) === 1 ? "run" : "runs")}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([
          "flex-1 h-0.5 rounded -mt-5",
          unref(workflowPhase) === "complete" ? "bg-green-500/40" : "bg-brown/20"
        ])}"></div><div class="flex flex-col items-center gap-1 flex-1"><div class="${ssrRenderClass([
          "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
          unref(workflowPhase) === "complete" ? "bg-green-500/20 text-green-400 ring-2 ring-green-500/30" : "bg-brown/20 text-parchment/50"
        ])}">`);
        _push(ssrRenderComponent(_component_UIcon, { name: "i-lucide-heart" }, null, _parent));
        _push(`</div><span class="text-[10px] text-parchment/50 uppercase tracking-wider">Hearts</span>`);
        if (unref(heartsTotalVolume) > 0) {
          _push(`<span class="text-[10px] text-green-400 font-semibold">${ssrInterpolate(unref(heartsTotalVolume).toFixed(1))} ${ssrInterpolate(unref(heartsTotalUnit) === "gallon" ? "gal" : unref(heartsTotalUnit))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5"><div class="bg-brown/10 rounded-lg p-3 text-center"><div class="text-xl font-bold text-parchment">${ssrInterpolate(unref(totalRuns))}</div><div class="text-xs text-parchment/50">Total Runs</div></div><div class="bg-brown/10 rounded-lg p-3 text-center"><div class="text-xl font-bold text-parchment">${ssrInterpolate(unref(strippingCount))}</div><div class="text-xs text-parchment/50">Stripping</div></div><div class="bg-brown/10 rounded-lg p-3 text-center"><div class="text-xl font-bold text-parchment">${ssrInterpolate(unref(spiritCount))}</div><div class="text-xs text-parchment/50">Spirit</div></div><div class="bg-brown/10 rounded-lg p-3 text-center"><div class="text-xl font-bold text-copper">${ssrInterpolate(unref(totalProofGallons).toFixed(2))}</div><div class="text-xs text-parchment/50">Total PG</div></div></div>`);
      if (unref(runs).length >= 2 && !__props.editing) {
        _push(`<div class="flex justify-end mb-2">`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: unref(allExpanded) ? "i-lucide-chevrons-down-up" : "i-lucide-chevrons-up-down",
          variant: "ghost",
          size: "xs",
          color: "neutral",
          onClick: toggleAllRuns
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(allExpanded) ? "Collapse All" : "Expand All")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(allExpanded) ? "Collapse All" : "Expand All"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(strippingRuns).length > 0) {
        _push(`<div class="mb-4"><div class="flex items-center gap-2 mb-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-flame",
          class: "text-amber-400 text-sm"
        }, null, _parent));
        _push(`<span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Stripping Runs</span><span class="text-[10px] text-parchment/60">(${ssrInterpolate(unref(strippingCount))})</span></div><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(strippingRuns), (run) => {
          _push(ssrRenderComponent(_component_BatchDistillingRun, {
            key: run.runNumber || getRunIndex(run),
            run,
            "run-index": getRunIndex(run),
            "batch-id": __props.batch._id,
            onDelete: deleteRun
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(workflowPhase) === "ready-for-spirit") {
        _push(`<div class="flex items-center justify-between rounded-lg border border-copper/30 bg-copper/10 px-4 py-3 mb-4"><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-flask-conical",
          class: "text-copper shrink-0"
        }, null, _parent));
        _push(`<span class="text-sm text-parchment/80"> Low wines accumulated from ${ssrInterpolate(unref(strippingCount))} stripping ${ssrInterpolate(unref(strippingCount) === 1 ? "run" : "runs")}. Ready for spirit run. </span></div>`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-plus",
          color: "primary",
          size: "sm",
          loading: unref(addingRun),
          onClick: ($event) => addRun("spirit")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Start Spirit Run `);
            } else {
              return [
                createTextVNode(" Start Spirit Run ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(spiritRuns).length > 0) {
        _push(`<div class="mb-4"><div class="flex items-center gap-2 mb-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-flask-conical",
          class: "text-copper text-sm"
        }, null, _parent));
        _push(`<span class="text-xs font-semibold text-copper uppercase tracking-wider">Spirit Runs</span><span class="text-[10px] text-parchment/60">(${ssrInterpolate(unref(spiritCount))})</span></div><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(spiritRuns), (run) => {
          _push(ssrRenderComponent(_component_BatchDistillingRun, {
            key: run.runNumber || getRunIndex(run),
            run,
            "run-index": getRunIndex(run),
            "batch-id": __props.batch._id,
            onDelete: deleteRun
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(runs).length === 0) {
        _push(`<div class="text-center py-8 text-parchment/50 text-sm"> No distilling runs recorded yet. `);
        if (__props.editing) {
          _push(`<span>Use the buttons below to add a run.</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.editing) {
        _push(`<div class="flex gap-3 mt-4">`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-plus",
          variant: "outline",
          size: "sm",
          loading: unref(addingRun),
          onClick: ($event) => addRun("stripping")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add Stripping Run `);
            } else {
              return [
                createTextVNode(" Add Stripping Run ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-plus",
          variant: "outline",
          color: "primary",
          size: "sm",
          loading: unref(addingRun),
          onClick: ($event) => addRun("spirit")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add Spirit Run `);
            } else {
              return [
                createTextVNode(" Add Spirit Run ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchDistilling.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$h, { __name: "BatchDistilling" });
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "BatchMaceration",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const vesselStore = useVesselStore();
    const itemStore = useItemStore();
    const recipeStore = useRecipeStore();
    const { convertQuantity, ingredientCost } = useUnitConversion();
    const stage = computed(() => props.batch.stages?.maceration);
    const recipe = computed(() => props.batch?.recipe ? recipeStore.getRecipeById(props.batch.recipe) : void 0);
    const scaleFactor = computed(() => {
      if (!props.batch || !recipe.value?.volume) return 1;
      const batchInRecipeUnits = convertQuantity(props.batch.batchSize, props.batch.batchSizeUnit, recipe.value.volumeUnit);
      return batchInRecipeUnits / recipe.value.volume;
    });
    const scaledIngredients = computed(() => {
      if (!recipe.value?.items) return [];
      return recipe.value.items.map((ing) => {
        const item = itemStore.getItemById(ing._id);
        const pricePerUnit = latestPrice(ing._id);
        const scaledAmount = ing.amount * scaleFactor.value;
        const cost = ingredientCost(pricePerUnit, scaledAmount, ing.unit, item?.inventoryUnit || ing.unit);
        return { id: ing._id, name: item?.name || "Unknown", amount: scaledAmount, unit: ing.unit, cost };
      });
    });
    const scaledTotalCost = computed(
      () => scaledIngredients.value.reduce((sum, ing) => sum + ing.cost, 0)
    );
    const vesselName = computed(() => {
      if (!stage.value?.vessel) return "Not assigned";
      return vesselStore.getVesselById(stage.value.vessel)?.name || "Unknown";
    });
    const elapsedDays = computed(() => {
      const start = stage.value?.startDate;
      if (!start) return null;
      const end = stage.value?.endDate || /* @__PURE__ */ new Date();
      const ms = new Date(end).getTime() - new Date(start).getTime();
      return Math.round(ms / (1e3 * 60 * 60 * 24));
    });
    const formatDate = (d) => {
      if (!d) return "Not set";
      return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    };
    const getBotanicalName = (botanical) => {
      if (botanical.name) return botanical.name;
      if (botanical.item) return itemStore.nameById(botanical.item) || "Unknown";
      return "Unknown";
    };
    const local = ref({
      vessel: stage.value?.vessel || "",
      baseSpirit: {
        source: stage.value?.baseSpirit?.source || "",
        volume: stage.value?.baseSpirit?.volume,
        volumeUnit: stage.value?.baseSpirit?.volumeUnit || "gallon",
        abv: stage.value?.baseSpirit?.abv
      },
      method: stage.value?.method || "",
      startDate: stage.value?.startDate ? new Date(stage.value.startDate) : void 0,
      endDate: stage.value?.endDate ? new Date(stage.value.endDate) : void 0,
      temperature: stage.value?.temperature,
      temperatureUnit: stage.value?.temperatureUnit || "F",
      duration: stage.value?.duration ?? recipe.value?.macerationDays,
      notes: stage.value?.notes || ""
    });
    const tankOptions = computed(
      () => vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
    );
    const methodOptions = ["direct", "vapor basket", "both"];
    const volumeUnits2 = ["gallon", "L", "mL", "fl oz"];
    const weightUnits = ["g", "kg", "oz", "lb"];
    const showAddBotanical = ref(false);
    const newBotanical = ref({
      item: "",
      name: "",
      weight: void 0,
      weightUnit: "g"
    });
    const addBotanical = async () => {
      const botanicals = [
        ...stage.value?.botanicals || [],
        {
          item: newBotanical.value.item || void 0,
          name: newBotanical.value.name || (newBotanical.value.item ? itemStore.nameById(newBotanical.value.item) : ""),
          weight: newBotanical.value.weight,
          weightUnit: newBotanical.value.weightUnit
        }
      ];
      await batchStore.updateStageData(props.batch._id, "Maceration", { botanicals });
      showAddBotanical.value = false;
      newBotanical.value = { item: "", name: "", weight: void 0, weightUnit: "g" };
    };
    const removeBotanical = async (index) => {
      const botanicals = [...stage.value?.botanicals || []];
      botanicals.splice(index, 1);
      await batchStore.updateStageData(props.batch._id, "Maceration", { botanicals });
    };
    const saving = ref(false);
    const save = async () => {
      saving.value = true;
      try {
        await batchStore.updateStageData(props.batch._id, "Maceration", {
          vessel: local.value.vessel || void 0,
          baseSpirit: {
            source: local.value.baseSpirit.source,
            volume: local.value.baseSpirit.volume,
            volumeUnit: local.value.baseSpirit.volumeUnit,
            abv: local.value.baseSpirit.abv
          },
          method: local.value.method || void 0,
          startDate: local.value.startDate,
          endDate: local.value.endDate,
          temperature: local.value.temperature,
          temperatureUnit: local.value.temperatureUnit,
          duration: local.value.duration,
          notes: local.value.notes
        });
      } finally {
        saving.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_USelect = _sfc_main$o;
      const _component_UInput = _sfc_main$m;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_SiteDatePicker = _sfc_main$r;
      const _component_UFormField = _sfc_main$p;
      const _component_UButton = _sfc_main$8$1;
      const _component_BaseItemSelect = __nuxt_component_8$1;
      const _component_UTextarea = _sfc_main$n;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-emerald-500/30 p-5" }, _attrs))}><div class="flex items-center gap-2 mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-leaf",
        class: "text-lg text-emerald-400"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Maceration</h3></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).vessel,
          "onUpdate:modelValue": ($event) => unref(local).vessel = $event,
          items: unref(tankOptions),
          "value-key": "value",
          "label-key": "label",
          placeholder: "Select tank"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(vesselName))}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Method</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).method,
          "onUpdate:modelValue": ($event) => unref(local).method = $event,
          items: methodOptions,
          placeholder: "Select method"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment capitalize">${ssrInterpolate(unref(stage)?.method || "Not set")}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Temperature</div>`);
      if (__props.editing) {
        _push(`<div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).temperature,
          "onUpdate:modelValue": ($event) => unref(local).temperature = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "68",
          class: "flex-1"
        }, null, _parent));
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).temperatureUnit,
          "onUpdate:modelValue": ($event) => unref(local).temperatureUnit = $event,
          items: ["F", "C"],
          class: "w-16"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="text-sm text-parchment">`);
        if (unref(stage)?.temperature) {
          _push(`<!--[-->${ssrInterpolate(unref(stage).temperature)}°${ssrInterpolate(unref(stage).temperatureUnit)}<!--]-->`);
        } else {
          _push(`<!--[-->Not set<!--]-->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Desired Days</div>`);
      if (__props.editing) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).duration,
          "onUpdate:modelValue": ($event) => unref(local).duration = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "e.g. 7"
        }, null, _parent));
        if (unref(recipe)?.macerationDays && !unref(stage)?.duration) {
          _push(`<div class="text-xs text-parchment/60 mt-1"> Default from recipe: ${ssrInterpolate(unref(recipe).macerationDays)} days </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<div class="text-sm text-parchment">`);
        if (unref(stage)?.duration) {
          _push(`<!--[-->${ssrInterpolate(unref(stage).duration)} days<!--]-->`);
        } else if (unref(recipe)?.macerationDays) {
          _push(`<!--[-->${ssrInterpolate(unref(recipe).macerationDays)} days <span class="text-parchment/60">(from recipe)</span><!--]-->`);
        } else {
          _push(`<!--[-->N/A<!--]-->`);
        }
        _push(`</div>`);
      }
      _push(`</div></div>`);
      if (unref(scaledIngredients).length > 0) {
        _push(`<div class="mb-5 pb-4 border-b border-brown/20"><div class="flex items-center justify-between mb-3"><div class="text-xs text-parchment/60 uppercase tracking-wider"> Ingredients <span class="text-parchment/60 ml-1">(scaled to ${ssrInterpolate(__props.batch.batchSize)} ${ssrInterpolate(__props.batch.batchSizeUnit)})</span></div><span class="text-sm font-semibold text-gold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(scaledTotalCost)))}</span></div><div class="divide-y divide-brown/10"><div class="grid grid-cols-3 gap-4 pb-2 text-xs text-parchment/50 uppercase tracking-wider"><span>Item</span><span>Amount</span><span class="text-right">Cost</span></div><!--[-->`);
        ssrRenderList(unref(scaledIngredients), (ing) => {
          _push(`<div class="grid grid-cols-3 gap-4 py-2 text-sm">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/items/${ing.id}`,
            class: "text-gold hover:text-copper transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(ing.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(ing.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-parchment/60">${ssrInterpolate(Number(ing.amount.toFixed(2)))} ${ssrInterpolate(ing.unit)}</span><span class="text-parchment text-right">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(ing.cost))}</span></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_SiteDatePicker, {
          modelValue: unref(local).startDate,
          "onUpdate:modelValue": ($event) => unref(local).startDate = $event
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(formatDate(unref(stage)?.startDate))}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">End Date</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_SiteDatePicker, {
          modelValue: unref(local).endDate,
          "onUpdate:modelValue": ($event) => unref(local).endDate = $event
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(formatDate(unref(stage)?.endDate))}</div>`);
      }
      _push(`</div></div>`);
      if (unref(elapsedDays) != null && !__props.editing) {
        _push(`<div class="mb-5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><div class="flex items-center justify-between text-sm"><span class="text-emerald-400"> Elapsed: ${ssrInterpolate(unref(elapsedDays))} day${ssrInterpolate(unref(elapsedDays) !== 1 ? "s" : "")}</span>`);
        if (unref(stage)?.duration || unref(recipe)?.macerationDays) {
          _push(`<span class="text-parchment/50">${ssrInterpolate(Math.max(0, (unref(stage)?.duration || unref(recipe)?.macerationDays || 0) - unref(elapsedDays)))} day${ssrInterpolate(Math.max(0, (unref(stage)?.duration || unref(recipe)?.macerationDays || 0) - unref(elapsedDays)) !== 1 ? "s" : "")} remaining </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mb-5"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Base Spirit</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Source" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).baseSpirit.source,
                "onUpdate:modelValue": ($event) => unref(local).baseSpirit.source = $event,
                placeholder: "e.g. GNS, house vodka"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).baseSpirit.source,
                  "onUpdate:modelValue": ($event) => unref(local).baseSpirit.source = $event,
                  placeholder: "e.g. GNS, house vodka"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).baseSpirit.volume,
                "onUpdate:modelValue": ($event) => unref(local).baseSpirit.volume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).baseSpirit.volume,
                  "onUpdate:modelValue": ($event) => unref(local).baseSpirit.volume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).baseSpirit.volumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).baseSpirit.volumeUnit = $event,
                items: volumeUnits2
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).baseSpirit.volumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).baseSpirit.volumeUnit = $event,
                  items: volumeUnits2
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).baseSpirit.abv,
                "onUpdate:modelValue": ($event) => unref(local).baseSpirit.abv = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).baseSpirit.abv,
                  "onUpdate:modelValue": ($event) => unref(local).baseSpirit.abv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="text-sm text-parchment/60">`);
        if (unref(stage)?.baseSpirit?.source) {
          _push(`<!--[-->${ssrInterpolate(unref(stage).baseSpirit.source)} `);
          if (unref(stage).baseSpirit.volume) {
            _push(`<!--[--> — ${ssrInterpolate(unref(stage).baseSpirit.volume)} ${ssrInterpolate(unref(stage).baseSpirit.volumeUnit)} @ ${ssrInterpolate(unref(stage).baseSpirit.abv)}% ABV <!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        } else {
          _push(`<!--[-->Not recorded<!--]-->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div class="mb-5"><div class="flex items-center justify-between mb-2"><div class="text-xs text-parchment/60 uppercase tracking-wider">Botanicals</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          variant: "outline",
          icon: "i-lucide-plus",
          onClick: ($event) => showAddBotanical.value = !unref(showAddBotanical)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add Botanical `);
            } else {
              return [
                createTextVNode(" Add Botanical ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(showAddBotanical)) {
        _push(`<div class="mb-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5"><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="col-span-2 sm:col-span-1"><div class="text-xs text-parchment/60 mb-1">Item (optional)</div>`);
        _push(ssrRenderComponent(_component_BaseItemSelect, {
          modelValue: unref(newBotanical).item,
          "onUpdate:modelValue": ($event) => unref(newBotanical).item = $event,
          placeholder: "Select item",
          size: "sm"
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 mb-1">Name</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newBotanical).name,
          "onUpdate:modelValue": ($event) => unref(newBotanical).name = $event,
          placeholder: "e.g. Juniper berries"
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 mb-1">Weight</div><div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newBotanical).weight,
          "onUpdate:modelValue": ($event) => unref(newBotanical).weight = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "0",
          class: "flex-1"
        }, null, _parent));
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(newBotanical).weightUnit,
          "onUpdate:modelValue": ($event) => unref(newBotanical).weightUnit = $event,
          items: weightUnits,
          class: "w-16"
        }, null, _parent));
        _push(`</div></div><div class="flex items-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          size: "sm",
          onClick: addBotanical
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Add`);
            } else {
              return [
                createTextVNode("Add")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if ((unref(stage)?.botanicals || []).length > 0) {
        _push(`<div class="divide-y divide-brown/20"><!--[-->`);
        ssrRenderList(unref(stage)?.botanicals, (botanical, i) => {
          _push(`<div class="flex items-center justify-between py-2 text-sm"><span class="text-parchment">${ssrInterpolate(getBotanicalName(botanical))}</span><div class="flex items-center gap-3">`);
          if (botanical.weight) {
            _push(`<span class="text-parchment/60">${ssrInterpolate(botanical.weight)} ${ssrInterpolate(botanical.weightUnit)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (__props.editing) {
            _push(ssrRenderComponent(_component_UButton, {
              size: "xs",
              variant: "ghost",
              color: "error",
              icon: "i-lucide-x",
              onClick: ($event) => removeBotanical(i)
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-center py-3"><p class="text-sm text-parchment/50">No botanicals added</p></div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(local).notes,
          "onUpdate:modelValue": ($event) => unref(local).notes = $event,
          placeholder: "Maceration notes...",
          rows: 2
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.notes || "None")}</div>`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<div class="mt-4 flex justify-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: save,
          loading: unref(saving),
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Maceration`);
            } else {
              return [
                createTextVNode("Save Maceration")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchMaceration.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$g, { __name: "BatchMaceration" });
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "BatchFiltering",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    const stage = computed(() => props.batch.stages?.filtering);
    const vesselName = computed(() => {
      if (!stage.value?.vessel) return "Not assigned";
      return vesselStore.getVesselById(stage.value.vessel)?.name || "Unknown";
    });
    const startDate = computed(() => {
      if (!stage.value?.startedAt) return "Not set";
      return new Date(stage.value.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    });
    const local = ref({
      vessel: stage.value?.vessel || "",
      method: stage.value?.method || "",
      preVolume: stage.value?.preVolume,
      preVolumeUnit: stage.value?.preVolumeUnit || "gallon",
      preAbv: stage.value?.preAbv,
      postVolume: stage.value?.postVolume,
      postVolumeUnit: stage.value?.postVolumeUnit || "gallon",
      postAbv: stage.value?.postAbv,
      filterMedia: stage.value?.filterMedia || "",
      passes: stage.value?.passes,
      notes: stage.value?.notes || ""
    });
    const tankOptions = computed(
      () => vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
    );
    const volumeLoss = computed(() => {
      if (local.value.preVolume && local.value.postVolume) {
        const loss = local.value.preVolume - local.value.postVolume;
        return loss > 0 ? loss.toFixed(2) : null;
      }
      return null;
    });
    const saving = ref(false);
    const save = async () => {
      saving.value = true;
      try {
        await batchStore.updateStageData(props.batch._id, "Filtering", {
          vessel: local.value.vessel || void 0,
          method: local.value.method,
          preVolume: local.value.preVolume,
          preVolumeUnit: local.value.preVolumeUnit,
          preAbv: local.value.preAbv,
          postVolume: local.value.postVolume,
          postVolumeUnit: local.value.postVolumeUnit,
          postAbv: local.value.postAbv,
          filterMedia: local.value.filterMedia,
          passes: local.value.passes,
          notes: local.value.notes
        });
        if (local.value.vessel && local.value.postVolume != null && local.value.postAbv != null) {
          const vessel = vesselStore.getVesselById(local.value.vessel);
          if (vessel) {
            vesselStore.setVessel(vessel._id);
            const batchContent = vesselStore.vessel.contents?.find((c) => c.batch === props.batch._id);
            if (batchContent) {
              batchContent.volume = local.value.postVolume;
              batchContent.volumeUnit = local.value.postVolumeUnit;
              batchContent.abv = local.value.postAbv;
            }
            await vesselStore.updateVessel();
          }
        }
      } finally {
        saving.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_USelect = _sfc_main$o;
      const _component_UInput = _sfc_main$m;
      const _component_UFormField = _sfc_main$p;
      const _component_UTextarea = _sfc_main$n;
      const _component_UButton = _sfc_main$8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-sky-500/30 p-5" }, _attrs))}><div class="flex items-center gap-2 mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-filter",
        class: "text-lg text-sky-400"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Filtering</h3></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).vessel,
          "onUpdate:modelValue": ($event) => unref(local).vessel = $event,
          items: unref(tankOptions),
          "value-key": "value",
          "label-key": "label",
          placeholder: "Select tank"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(vesselName))}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Method</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).method,
          "onUpdate:modelValue": ($event) => unref(local).method = $event,
          placeholder: "e.g. charcoal, chill, plate, gravity"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(stage)?.method || "Not specified")}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(startDate))}</div></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Filter Media</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).filterMedia,
          "onUpdate:modelValue": ($event) => unref(local).filterMedia = $event,
          placeholder: "e.g. activated carbon, cellulose pads"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.filterMedia || "Not recorded")}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Passes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).passes,
          "onUpdate:modelValue": ($event) => unref(local).passes = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "1"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.passes || "N/A")}</div>`);
      }
      _push(`</div></div><div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Pre-Filter</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).preVolume,
                "onUpdate:modelValue": ($event) => unref(local).preVolume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).preVolume,
                  "onUpdate:modelValue": ($event) => unref(local).preVolume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).preVolumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).preVolumeUnit = $event,
                items: ["gallon", "L", "mL"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).preVolumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).preVolumeUnit = $event,
                  items: ["gallon", "L", "mL"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).preAbv,
                "onUpdate:modelValue": ($event) => unref(local).preAbv = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.1",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).preAbv,
                  "onUpdate:modelValue": ($event) => unref(local).preAbv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="text-sm text-parchment/60">`);
        if (unref(stage)?.preVolume) {
          _push(`<!--[-->${ssrInterpolate(unref(stage).preVolume)} ${ssrInterpolate(unref(stage).preVolumeUnit)} @ ${ssrInterpolate(unref(stage).preAbv)}% ABV <!--]-->`);
        } else {
          _push(`<!--[-->Not recorded<!--]-->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Post-Filter</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).postVolume,
                "onUpdate:modelValue": ($event) => unref(local).postVolume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).postVolume,
                  "onUpdate:modelValue": ($event) => unref(local).postVolume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).postVolumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).postVolumeUnit = $event,
                items: ["gallon", "L", "mL"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).postVolumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).postVolumeUnit = $event,
                  items: ["gallon", "L", "mL"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).postAbv,
                "onUpdate:modelValue": ($event) => unref(local).postAbv = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.1",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).postAbv,
                  "onUpdate:modelValue": ($event) => unref(local).postAbv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="text-sm text-parchment/60">`);
        if (unref(stage)?.postVolume) {
          _push(`<!--[-->${ssrInterpolate(unref(stage).postVolume)} ${ssrInterpolate(unref(stage).postVolumeUnit)} @ ${ssrInterpolate(unref(stage).postAbv)}% ABV <!--]-->`);
        } else {
          _push(`<!--[-->Not recorded<!--]-->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
      if (!__props.editing && unref(volumeLoss)) {
        _push(`<div class="mb-4 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20"><span class="text-xs text-sky-400">Volume loss: ${ssrInterpolate(unref(volumeLoss))} ${ssrInterpolate(unref(stage)?.preVolumeUnit || "gallon")}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(local).notes,
          "onUpdate:modelValue": ($event) => unref(local).notes = $event,
          placeholder: "Filtering notes...",
          rows: 2
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.notes || "None")}</div>`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<div class="mt-4 flex justify-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: save,
          loading: unref(saving),
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Filtering`);
            } else {
              return [
                createTextVNode("Save Filtering")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchFiltering.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const __nuxt_component_4$1 = Object.assign(_sfc_main$f, { __name: "BatchFiltering" });
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "BatchBarrelEntryExit",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean },
    type: {},
    localEntryExit: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const toast = useToast();
    const stage = computed(() => props.batch.stages?.barrelAging);
    const stageData = computed(() => stage.value?.[props.type]);
    const volumeUnits2 = ["gallon", "L", "mL"];
    const formatDate = (d) => {
      if (!d) return "Not set";
      return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    };
    const toDateInputValue = (d) => {
      if (!d) return "";
      const date = new Date(d);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 10);
    };
    const inlineEditing = ref(false);
    const inlineData = ref({
      date: "",
      abv: void 0
    });
    const startInlineEdit = () => {
      inlineData.value.date = toDateInputValue(stageData.value?.date);
      inlineData.value.abv = stageData.value?.abv;
      inlineEditing.value = true;
    };
    const cancelInlineEdit = () => {
      inlineEditing.value = false;
    };
    const inlineDateError = computed(() => {
      if (!inlineData.value.date) return props.type === "entry" ? "Date is required" : "";
      const d = new Date(inlineData.value.date);
      if (isNaN(d.getTime())) return "Invalid date";
      return "";
    });
    const inlineAbvError = computed(() => {
      const abv = inlineData.value.abv;
      if (abv === void 0 || abv === null) return "";
      if (abv < 0) return "ABV cannot be negative";
      if (abv > 100) return "ABV cannot exceed 100";
      return "";
    });
    const inlineValid = computed(() => {
      return !inlineDateError.value && !inlineAbvError.value;
    });
    const inlinePG = computed(() => {
      const volume = stageData.value?.volume;
      const abv = inlineData.value.abv;
      const unit = stageData.value?.volumeUnit || "gallon";
      if (volume && abv) return calculateProofGallons(volume, unit, abv);
      return null;
    });
    const displayPG = computed(() => {
      const d = stageData.value;
      if (d?.proofGallons) return d.proofGallons;
      if (d?.volume && d?.abv) return calculateProofGallons(d.volume, d.volumeUnit || "gallon", d.abv);
      return null;
    });
    const calculatedPG = computed(() => {
      const e = props.localEntryExit;
      if (e.volume && e.abv) return calculateProofGallons(e.volume, e.volumeUnit, e.abv);
      return null;
    });
    watch([() => props.localEntryExit.volume, () => props.localEntryExit.abv, () => props.localEntryExit.volumeUnit], () => {
      if (calculatedPG.value !== null) props.localEntryExit.proofGallons = calculatedPG.value;
    });
    const savingInline = ref(false);
    const saveInline = async () => {
      if (!inlineValid.value) return;
      savingInline.value = true;
      try {
        const updated = {
          ...stageData.value,
          ...inlineData.value.date ? { date: /* @__PURE__ */ new Date(inlineData.value.date + "T12:00:00") } : {},
          abv: inlineData.value.abv,
          proofGallons: inlinePG.value ?? stageData.value?.proofGallons
        };
        await batchStore.updateStageData(props.batch._id, "Barrel Aging", {
          [props.type]: updated
        }, `Updated barrel ${props.type} date/proof`);
        inlineEditing.value = false;
        toast.add({ title: `Barrel ${props.type} updated`, color: "success", icon: "i-lucide-check-circle" });
      } catch {
        toast.add({ title: `Failed to update barrel ${props.type}`, color: "error", icon: "i-lucide-alert-circle" });
      } finally {
        savingInline.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8$1;
      const _component_UFormField = _sfc_main$p;
      const _component_SiteDatePicker = _sfc_main$r;
      const _component_UInput = _sfc_main$m;
      const _component_USelect = _sfc_main$o;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-3 rounded-lg border border-brown/20 bg-brown/5" }, _attrs))}><div class="flex items-center justify-between mb-3"><div class="text-xs font-semibold text-parchment/60 uppercase">${ssrInterpolate(__props.type === "entry" ? "Entry" : "Exit")}</div>`);
      if (!__props.editing && !unref(inlineEditing)) {
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          variant: "ghost",
          color: "neutral",
          icon: "i-lucide-pencil",
          onClick: startInlineEdit
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Edit `);
            } else {
              return [
                createTextVNode(" Edit ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<div class="space-y-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Date" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_SiteDatePicker, {
                modelValue: __props.localEntryExit.date,
                "onUpdate:modelValue": ($event) => __props.localEntryExit.date = $event
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_SiteDatePicker, {
                  modelValue: __props.localEntryExit.date,
                  "onUpdate:modelValue": ($event) => __props.localEntryExit.date = $event
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid grid-cols-2 gap-2">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: __props.localEntryExit.volume,
                "onUpdate:modelValue": ($event) => __props.localEntryExit.volume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: __props.localEntryExit.volume,
                  "onUpdate:modelValue": ($event) => __props.localEntryExit.volume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: __props.localEntryExit.volumeUnit,
                "onUpdate:modelValue": ($event) => __props.localEntryExit.volumeUnit = $event,
                items: volumeUnits2
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: __props.localEntryExit.volumeUnit,
                  "onUpdate:modelValue": ($event) => __props.localEntryExit.volumeUnit = $event,
                  items: volumeUnits2
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="grid grid-cols-2 gap-2">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: __props.localEntryExit.abv,
                "onUpdate:modelValue": ($event) => __props.localEntryExit.abv = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0",
                min: "0",
                max: "100"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: __props.localEntryExit.abv,
                  "onUpdate:modelValue": ($event) => __props.localEntryExit.abv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0",
                  min: "0",
                  max: "100"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Proof Gallons" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: __props.localEntryExit.proofGallons,
                "onUpdate:modelValue": ($event) => __props.localEntryExit.proofGallons = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.01",
                placeholder: unref(calculatedPG)?.toString() || "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: __props.localEntryExit.proofGallons,
                  "onUpdate:modelValue": ($event) => __props.localEntryExit.proofGallons = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.01",
                  placeholder: unref(calculatedPG)?.toString() || "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else if (unref(inlineEditing)) {
        _push(`<div class="space-y-3">`);
        _push(ssrRenderComponent(_component_UFormField, {
          label: "Date",
          error: unref(inlineDateError) || void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(inlineData).date,
                "onUpdate:modelValue": ($event) => unref(inlineData).date = $event,
                type: "date"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(inlineData).date,
                  "onUpdate:modelValue": ($event) => unref(inlineData).date = $event,
                  type: "date"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid grid-cols-2 gap-2">`);
        _push(ssrRenderComponent(_component_UFormField, {
          label: "ABV %",
          error: unref(inlineAbvError) || void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(inlineData).abv,
                "onUpdate:modelValue": ($event) => unref(inlineData).abv = $event,
                modelModifiers: { number: true },
                type: "number",
                min: "0",
                max: "100",
                step: "0.1",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(inlineData).abv,
                  "onUpdate:modelValue": ($event) => unref(inlineData).abv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  min: "0",
                  max: "100",
                  step: "0.1",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div><div class="text-xs text-parchment/60 mb-1">Proof Gallons</div><div class="text-sm text-amber-400 font-semibold pt-2">${ssrInterpolate(unref(inlinePG) !== null ? `${unref(inlinePG)} PG` : unref(displayPG) ? `${unref(displayPG)} PG` : "--")}</div></div></div><div class="text-xs text-parchment/50"> Volume: ${ssrInterpolate(unref(stageData)?.volume || 0)} ${ssrInterpolate(unref(stageData)?.volumeUnit || "gallon")} (not changed) </div><div class="flex items-center gap-2 pt-1">`);
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          loading: unref(savingInline),
          disabled: !unref(inlineValid),
          onClick: saveInline
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save`);
            } else {
              return [
                createTextVNode("Save")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          variant: "ghost",
          color: "neutral",
          onClick: cancelInlineEdit
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Cancel`);
            } else {
              return [
                createTextVNode("Cancel")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<div class="space-y-1 text-sm"><div class="flex justify-between"><span class="text-parchment/60">Date</span><span class="text-parchment">${ssrInterpolate(formatDate(unref(stageData)?.date))}</span></div><div class="flex justify-between"><span class="text-parchment/60">Volume</span><span class="text-parchment">${ssrInterpolate(unref(stageData)?.volume || 0)} ${ssrInterpolate(unref(stageData)?.volumeUnit)}</span></div><div class="flex justify-between"><span class="text-parchment/60">ABV</span><span class="text-parchment">${ssrInterpolate(unref(stageData)?.abv || 0)}%</span></div>`);
        if (unref(displayPG)) {
          _push(`<div class="flex justify-between"><span class="text-parchment/60">Proof Gallons</span><span class="text-amber-400 font-semibold">${ssrInterpolate(unref(displayPG))} PG</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchBarrelEntryExit.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$e, { __name: "BatchBarrelEntryExit" });
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "BatchBarrelSampling",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const stage = computed(() => props.batch.stages?.barrelAging);
    const sortedSamplings = computed(() => {
      const samplings = stage.value?.samplings || [];
      return [...samplings].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
    const showAddSampling = ref(false);
    const newSampling = ref({
      date: /* @__PURE__ */ new Date(),
      abv: void 0,
      volume: void 0,
      volumeUnit: "gallon",
      notes: ""
    });
    const addSampling = async () => {
      const samplings = [...stage.value?.samplings || [], { ...newSampling.value }];
      await batchStore.updateStageData(props.batch._id, "Barrel Aging", { samplings });
      showAddSampling.value = false;
      newSampling.value = { date: /* @__PURE__ */ new Date(), abv: void 0, volume: void 0, volumeUnit: "gallon", notes: "" };
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8$1;
      const _component_SiteDatePicker = _sfc_main$r;
      const _component_UInput = _sfc_main$m;
      const _component_USelect = _sfc_main$o;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-5" }, _attrs))}><div class="flex items-center justify-between mb-2"><div class="text-xs text-parchment/60 uppercase tracking-wider">Sampling Records</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          variant: "outline",
          icon: "i-lucide-plus",
          onClick: ($event) => showAddSampling.value = !unref(showAddSampling)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add Sample `);
            } else {
              return [
                createTextVNode(" Add Sample ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(showAddSampling)) {
        _push(`<div class="mb-3 p-3 rounded-lg border border-amber/20 bg-amber-500/5"><div class="grid grid-cols-2 sm:grid-cols-5 gap-3"><div><div class="text-xs text-parchment/60 mb-1">Date</div>`);
        _push(ssrRenderComponent(_component_SiteDatePicker, {
          modelValue: unref(newSampling).date,
          "onUpdate:modelValue": ($event) => unref(newSampling).date = $event
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 mb-1">ABV %</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newSampling).abv,
          "onUpdate:modelValue": ($event) => unref(newSampling).abv = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "0"
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 mb-1">Volume</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newSampling).volume,
          "onUpdate:modelValue": ($event) => unref(newSampling).volume = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "0"
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 mb-1">Unit</div>`);
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(newSampling).volumeUnit,
          "onUpdate:modelValue": ($event) => unref(newSampling).volumeUnit = $event,
          items: ["gallon", "L", "mL", "fl oz"]
        }, null, _parent));
        _push(`</div><div class="flex items-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          size: "sm",
          onClick: addSampling
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Add`);
            } else {
              return [
                createTextVNode("Add")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="mt-2"><div class="text-xs text-parchment/60 mb-1">Notes</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newSampling).notes,
          "onUpdate:modelValue": ($event) => unref(newSampling).notes = $event,
          placeholder: "Sampling notes..."
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sortedSamplings).length > 0) {
        _push(`<div class="divide-y divide-brown/20"><!--[-->`);
        ssrRenderList(unref(sortedSamplings), (sample, i) => {
          _push(`<div class="flex items-center justify-between py-2 text-sm gap-2"><span class="text-parchment/60">${ssrInterpolate(new Date(sample.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}</span>`);
          if (sample.abv) {
            _push(`<span class="text-parchment">${ssrInterpolate(sample.abv)}% ABV</span>`);
          } else {
            _push(`<!---->`);
          }
          if (sample.volume) {
            _push(`<span class="text-parchment/60">${ssrInterpolate(sample.volume)} ${ssrInterpolate(sample.volumeUnit)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (sample.notes) {
            _push(`<span class="text-parchment/50 truncate max-w-32">${ssrInterpolate(sample.notes)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-center py-3"><p class="text-sm text-parchment/50">No samplings recorded</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchBarrelSampling.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const __nuxt_component_5$1 = Object.assign(_sfc_main$d, { __name: "BatchBarrelSampling" });
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "BatchBarrelTastingNotes",
  __ssrInlineRender: true,
  props: {
    batch: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const sortedTastingNotes = computed(() => {
      if (!props.batch.tastingNotes?.length) return [];
      return props.batch.tastingNotes.map((note, originalIndex) => ({ ...note, originalIndex })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    const newTastingNote = ref({
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      abv: void 0,
      notes: ""
    });
    const savingTastingNote = ref(false);
    const submitTastingNote = async () => {
      if (!newTastingNote.value.notes.trim()) return;
      savingTastingNote.value = true;
      try {
        await batchStore.addTastingNote(props.batch._id, {
          date: newTastingNote.value.date,
          abv: newTastingNote.value.abv || void 0,
          notes: newTastingNote.value.notes.trim()
        });
        newTastingNote.value = { date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), abv: void 0, notes: "" };
      } finally {
        savingTastingNote.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_UInput = _sfc_main$m;
      const _component_UTextarea = _sfc_main$n;
      const _component_UButton = _sfc_main$8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-5" }, _attrs))}><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-wine",
        class: "text-sm text-amber-400"
      }, null, _parent));
      _push(`<div class="text-xs text-parchment/60 uppercase tracking-wider">Tasting Notes</div></div>`);
      if (unref(sortedTastingNotes).length > 0) {
        _push(`<span class="text-xs text-parchment/60">${ssrInterpolate(unref(sortedTastingNotes).length)} ${ssrInterpolate(unref(sortedTastingNotes).length === 1 ? "note" : "notes")}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.batch.status === "active") {
        _push(`<div class="mb-3 p-3 rounded-lg border border-amber/20 bg-amber-500/5"><div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-2"><div><div class="text-xs text-parchment/60 mb-1">Date</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newTastingNote).date,
          "onUpdate:modelValue": ($event) => unref(newTastingNote).date = $event,
          type: "date",
          size: "sm"
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 mb-1">Sample ABV %</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(newTastingNote).abv,
          "onUpdate:modelValue": ($event) => unref(newTastingNote).abv = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "e.g. 62.5",
          step: "0.1",
          size: "sm"
        }, null, _parent));
        _push(`</div></div><div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(newTastingNote).notes,
          "onUpdate:modelValue": ($event) => unref(newTastingNote).notes = $event,
          placeholder: "Aroma, flavor, mouthfeel, finish...",
          rows: 2,
          autoresize: "",
          class: "flex-1"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          size: "sm",
          icon: "i-lucide-plus",
          loading: unref(savingTastingNote),
          disabled: !unref(newTastingNote).notes.trim(),
          class: "self-end",
          onClick: submitTastingNote
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add `);
            } else {
              return [
                createTextVNode(" Add ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sortedTastingNotes).length > 0) {
        _push(`<div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(sortedTastingNotes), (note) => {
          _push(`<div class="group relative rounded-lg border border-brown/15 bg-charcoal-light/20 p-3"><div class="flex items-center gap-2 mb-1"><span class="text-xs font-medium text-parchment/70">${ssrInterpolate(new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}</span>`);
          if (note.abv) {
            _push(`<span class="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">${ssrInterpolate(note.abv)}% ABV </span>`);
          } else {
            _push(`<!---->`);
          }
          if (__props.batch.status === "active") {
            _push(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-trash-2",
              size: "xs",
              variant: "ghost",
              color: "error",
              class: "ml-auto opacity-0 group-hover:opacity-100 transition-opacity",
              onClick: ($event) => unref(batchStore).deleteTastingNote(__props.batch._id, note.originalIndex)
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div><p class="text-sm text-parchment/60 whitespace-pre-line">${ssrInterpolate(note.notes)}</p></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-center py-3"><p class="text-sm text-parchment/50">No tasting notes yet</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchBarrelTastingNotes.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const __nuxt_component_6$1 = Object.assign(_sfc_main$c, { __name: "BatchBarrelTastingNotes" });
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "BatchBarrelAging",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const vesselStore = useVesselStore();
    const toast = useToast();
    const stage = computed(() => props.batch.stages?.barrelAging);
    const batchBarrels = computed(() => {
      if (!props.batch._id) return [];
      return vesselStore.vessels.filter(
        (v) => v.type === "Barrel" && v.contents?.some((c) => c.batch === props.batch._id)
      );
    });
    const getBarrelContent = (barrel) => {
      return barrel.contents?.find((c) => c.batch === props.batch._id);
    };
    const daysAged = computed(() => {
      const entryDate = stage.value?.entry?.date;
      if (!entryDate) return null;
      return Math.floor((Date.now() - new Date(entryDate).getTime()) / (1e3 * 60 * 60 * 24));
    });
    const monthsAged = computed(() => {
      if (daysAged.value === null) return null;
      return parseFloat((daysAged.value / 30.44).toFixed(1));
    });
    const getBarrelAgingProgress = (barrel) => {
      const target = barrel.targetAge || stage.value?.targetAge;
      if (!target || monthsAged.value === null) return null;
      const pct = Math.min(100, monthsAged.value / target * 100);
      return { percent: Math.round(pct), months: monthsAged.value, target };
    };
    const getAgingProgressColor = (progress) => {
      if (!progress) return "bg-amber-500/60";
      if (progress.percent >= 100) return "bg-green-500/60";
      if (progress.percent >= 75) return "bg-amber-500/60";
      return "bg-blue-500/60";
    };
    const getBarrelFillCost = (barrel) => {
      return getBarrelContent(barrel)?.value || 0;
    };
    const getBarrelCost = (barrel) => {
      return barrel.barrel?.cost || 0;
    };
    const getBarrelTotalCost = (barrel) => {
      return getBarrelFillCost(barrel) + getBarrelCost(barrel);
    };
    const totalVolume = computed(() => {
      return batchBarrels.value.reduce((sum, b) => {
        const content = getBarrelContent(b);
        return sum + (content?.volume || 0);
      }, 0);
    });
    const totalProofGallons = computed(() => {
      return batchBarrels.value.reduce((sum, b) => {
        const content = getBarrelContent(b);
        if (!content?.volume || !content?.abv) return sum;
        return sum + calculateProofGallons(content.volume, content.volumeUnit || "gallon", content.abv);
      }, 0);
    });
    const totalCost = computed(() => {
      return batchBarrels.value.reduce((sum, b) => sum + getBarrelTotalCost(b), 0);
    });
    const collapsedBarrels = ref(/* @__PURE__ */ new Set());
    const isCollapsed = (barrelId) => collapsedBarrels.value.has(barrelId);
    const shortUnit = (unit) => unit.replace(/gallon/i, "gal").replace(/liter/i, "L");
    const selectedBarrelIds = ref(/* @__PURE__ */ new Set());
    const isSelected = (barrelId) => selectedBarrelIds.value.has(barrelId);
    const selectAll = () => {
      batchBarrels.value.forEach((b) => selectedBarrelIds.value.add(b._id));
    };
    const deselectAll = () => {
      selectedBarrelIds.value.clear();
    };
    const selectedBarrels = computed(
      () => batchBarrels.value.filter((b) => selectedBarrelIds.value.has(b._id))
    );
    const selectedVolume = computed(() => {
      return selectedBarrels.value.reduce((sum, b) => {
        const content = getBarrelContent(b);
        return sum + (content?.volume || 0);
      }, 0);
    });
    const selectedCost = computed(() => {
      return selectedBarrels.value.reduce((sum, b) => sum + getBarrelTotalCost(b), 0);
    });
    const nextStageAfterBarrelAging = computed(
      () => getNextStage(props.batch.pipeline, "Barrel Aging")
    );
    const destinationVesselId = ref("");
    const tankOptions = computed(
      () => vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
    );
    const nextStageNeedsVessel = computed(() => {
      const next = nextStageAfterBarrelAging.value;
      if (!next || next === "Bottled") return false;
      return true;
    });
    const showExitModal = ref(false);
    const exitBarrelId = ref("");
    const exitForm = ref({
      volume: 0,
      volumeUnit: "gallon",
      abv: 0
    });
    const exitBarrel = computed(
      () => exitBarrelId.value ? vesselStore.getVesselById(exitBarrelId.value) : null
    );
    const exitBarrelContent = computed(() => {
      if (!exitBarrel.value) return null;
      return getBarrelContent(exitBarrel.value);
    });
    const exitProofGallons = computed(() => {
      if (!exitForm.value.volume || !exitForm.value.abv) return 0;
      return calculateProofGallons(exitForm.value.volume, exitForm.value.volumeUnit, exitForm.value.abv);
    });
    const openExitModal = (barrel) => {
      exitBarrelId.value = barrel._id;
      const content = getBarrelContent(barrel);
      exitForm.value = {
        volume: content?.volume || 0,
        volumeUnit: content?.volumeUnit || "gallon",
        abv: content?.abv || 0
      };
      destinationVesselId.value = "";
      showExitModal.value = true;
    };
    const advancing = ref(false);
    const sendBarrelsToNextStage = async (barrelIds, exitData) => {
      const target = nextStageAfterBarrelAging.value;
      if (!target) return;
      advancing.value = true;
      try {
        const batchUnit = props.batch.batchSizeUnit || "gallon";
        let totalTransferVolume = 0;
        let totalTransferValue = 0;
        let weightedAbvSum = 0;
        const barrelNames = [];
        for (const barrelId of barrelIds) {
          const barrel = vesselStore.getVesselById(barrelId);
          if (!barrel) continue;
          const content = getBarrelContent(barrel);
          if (!content) continue;
          const useExitData = exitData && barrelIds.length === 1;
          const exitVol = useExitData ? exitData.volume : content.volume;
          const exitVolUnit = useExitData ? exitData.volumeUnit : content.volumeUnit;
          const exitAbv = useExitData ? exitData.abv : content.abv;
          const volInBatchUnit = exitVol * convertUnitRatio(exitVolUnit, batchUnit);
          totalTransferVolume += volInBatchUnit;
          totalTransferValue += content.value + (barrel.barrel?.cost || 0);
          weightedAbvSum += exitAbv * volInBatchUnit;
          barrelNames.push(barrel.name);
          barrel.contents = (barrel.contents || []).filter((c) => c.batch !== props.batch._id);
          barrel.isUsed = true;
          const recipeStore = useRecipeStore();
          const recipe = recipeStore.getRecipeById(props.batch.recipe);
          if (recipe) {
            barrel.previousContents = recipe.type || recipe.name;
          }
          vesselStore.vessel = barrel;
          await vesselStore.updateVessel();
        }
        const destVessel = destinationVesselId.value;
        if (destVessel) {
          const avgAbv = totalTransferVolume > 0 ? weightedAbvSum / totalTransferVolume : 0;
          await vesselStore.addContents(destVessel, {
            batch: props.batch._id,
            volume: totalTransferVolume,
            volumeUnit: batchUnit,
            abv: avgAbv,
            value: totalTransferValue
          });
        }
        await batchStore.advanceToStage(
          props.batch._id,
          target,
          { vessel: destVessel || void 0 },
          totalTransferVolume,
          "Barrel Aging",
          totalTransferVolume
        );
        if (exitData && barrelIds.length === 1) {
          await batchStore.updateStageData(props.batch._id, "Barrel Aging", {
            exit: {
              date: /* @__PURE__ */ new Date(),
              volume: exitData.volume,
              volumeUnit: exitData.volumeUnit,
              abv: exitData.abv,
              proofGallons: calculateProofGallons(exitData.volume, exitData.volumeUnit, exitData.abv)
            }
          }, `Emptied barrel ${barrelNames[0]}: ${exitData.volume} ${shortUnit(exitData.volumeUnit)} @ ${exitData.abv}% ABV → ${target}`);
        } else {
          await batchStore.updateStageData(
            props.batch._id,
            target,
            {},
            `Transferred from ${barrelIds.length} barrel${barrelIds.length > 1 ? "s" : ""}: ${barrelNames.join(", ")}`
          );
        }
        toast.add({
          title: `Sent ${barrelIds.length} barrel${barrelIds.length > 1 ? "s" : ""} to ${target}`,
          description: `${totalTransferVolume.toFixed(1)} ${batchUnit}`,
          color: "success",
          icon: "i-lucide-arrow-right"
        });
        selectedBarrelIds.value.clear();
        showExitModal.value = false;
        showAdvanceConfirm.value = false;
      } catch (error) {
        toast.add({
          title: "Failed to advance barrels",
          description: String(error),
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        advancing.value = false;
      }
    };
    const showAdvanceConfirm = ref(false);
    const initiateMultiAdvance = () => {
      if (selectedBarrelIds.value.size === 0) return;
      destinationVesselId.value = "";
      showAdvanceConfirm.value = true;
    };
    const local = ref({
      vessel: stage.value?.vessel || "",
      barrelType: stage.value?.barrelType || "",
      barrelSize: stage.value?.barrelSize || "",
      charLevel: stage.value?.charLevel || "",
      previousUse: stage.value?.previousUse || "",
      warehouseLocation: stage.value?.warehouseLocation || "",
      entry: {
        date: stage.value?.entry?.date ? new Date(stage.value.entry.date) : /* @__PURE__ */ new Date(),
        volume: stage.value?.entry?.volume,
        volumeUnit: stage.value?.entry?.volumeUnit || "gallon",
        abv: stage.value?.entry?.abv,
        proofGallons: stage.value?.entry?.proofGallons
      },
      exit: {
        date: stage.value?.exit?.date ? new Date(stage.value.exit.date) : void 0,
        volume: stage.value?.exit?.volume,
        volumeUnit: stage.value?.exit?.volumeUnit || "gallon",
        abv: stage.value?.exit?.abv,
        proofGallons: stage.value?.exit?.proofGallons
      },
      targetAge: stage.value?.targetAge,
      notes: stage.value?.notes || "",
      barrelCost: props.batch.barrelCost
    });
    const saving = ref(false);
    const save = async () => {
      saving.value = true;
      try {
        const target = batchStore.getBatchById(props.batch._id);
        if (target) target.barrelCost = local.value.barrelCost;
        await batchStore.updateStageData(props.batch._id, "Barrel Aging", {
          vessel: local.value.vessel || void 0,
          barrelType: local.value.barrelType,
          barrelSize: local.value.barrelSize,
          charLevel: local.value.charLevel || void 0,
          previousUse: local.value.previousUse,
          warehouseLocation: local.value.warehouseLocation,
          entry: {
            date: local.value.entry.date,
            volume: local.value.entry.volume,
            volumeUnit: local.value.entry.volumeUnit,
            abv: local.value.entry.abv,
            proofGallons: local.value.entry.proofGallons
          },
          exit: {
            date: local.value.exit.date,
            volume: local.value.exit.volume,
            volumeUnit: local.value.exit.volumeUnit,
            abv: local.value.exit.abv,
            proofGallons: local.value.exit.proofGallons
          },
          targetAge: local.value.targetAge,
          notes: local.value.notes
        });
      } finally {
        saving.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_UButton = _sfc_main$8$1;
      const _component_UBadge = _sfc_main$q;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_BatchBarrelEntryExit = __nuxt_component_4;
      const _component_BatchBarrelSampling = __nuxt_component_5$1;
      const _component_BatchBarrelTastingNotes = __nuxt_component_6$1;
      const _component_UTextarea = _sfc_main$n;
      const _component_UModal = _sfc_main$l;
      const _component_UFormField = _sfc_main$p;
      const _component_UInput = _sfc_main$m;
      const _component_USelect = _sfc_main$o;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-amber/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-cylinder",
        class: "text-lg text-amber"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Barrel Aging</h3></div><div class="flex items-center gap-3 text-sm">`);
      if (unref(batchBarrels).length > 1) {
        _push(`<span class="text-parchment/60">${ssrInterpolate(unref(batchBarrels).length)} barrels </span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(totalVolume) > 0) {
        _push(`<span class="text-parchment/60">${ssrInterpolate(unref(totalVolume).toFixed(1))} gal </span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(totalProofGallons) > 0) {
        _push(`<span class="text-amber-400 font-semibold">${ssrInterpolate(unref(totalProofGallons).toFixed(2))} PG </span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(totalCost) > 0) {
        _push(`<span class="text-green-400 font-semibold">${ssrInterpolate(unref(Dollar).format(unref(totalCost)))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(batchBarrels).length > 1 && unref(nextStageAfterBarrelAging) && __props.batch.status === "active") {
        _push(`<div class="flex items-center justify-between mb-3 px-2 py-2 rounded-lg bg-brown/5 border border-brown/15"><div class="flex items-center gap-2">`);
        if (unref(selectedBarrelIds).size < unref(batchBarrels).length) {
          _push(ssrRenderComponent(_component_UButton, {
            size: "xs",
            variant: "ghost",
            color: "neutral",
            onClick: selectAll
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Select All `);
              } else {
                return [
                  createTextVNode(" Select All ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UButton, {
            size: "xs",
            variant: "ghost",
            color: "neutral",
            onClick: deselectAll
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Deselect All `);
              } else {
                return [
                  createTextVNode(" Deselect All ")
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        if (unref(selectedBarrelIds).size > 0) {
          _push(`<span class="text-xs text-parchment/50">${ssrInterpolate(unref(selectedBarrelIds).size)} selected `);
          if (unref(selectedVolume) > 0) {
            _push(`<!--[--> · ${ssrInterpolate(unref(selectedVolume).toFixed(1))} gal <!--]-->`);
          } else {
            _push(`<!---->`);
          }
          if (unref(selectedCost) > 0) {
            _push(`<!--[--> · ${ssrInterpolate(unref(Dollar).format(unref(selectedCost)))}<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(selectedBarrelIds).size > 0) {
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-arrow-right",
            size: "sm",
            color: "primary",
            loading: unref(advancing),
            onClick: initiateMultiAdvance
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Send ${ssrInterpolate(unref(selectedBarrelIds).size)} to ${ssrInterpolate(unref(nextStageAfterBarrelAging))}`);
              } else {
                return [
                  createTextVNode(" Send " + toDisplayString(unref(selectedBarrelIds).size) + " to " + toDisplayString(unref(nextStageAfterBarrelAging)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(batchBarrels).length > 0) {
        _push(`<div class="space-y-2 mb-5"><!--[-->`);
        ssrRenderList(unref(batchBarrels), (barrel) => {
          _push(`<div class="${ssrRenderClass([isSelected(barrel._id) ? "border-amber/40 bg-amber/5" : "border-brown/20", "bg-brown/5 rounded-lg border overflow-hidden transition-colors"])}"><div class="flex items-center gap-2 px-4 py-3 cursor-pointer select-none transition-colors hover:bg-brown/10">`);
          if (unref(batchBarrels).length > 1 && unref(nextStageAfterBarrelAging) && __props.batch.status === "active") {
            _push(`<input type="checkbox"${ssrIncludeBooleanAttr(isSelected(barrel._id)) ? " checked" : ""} class="rounded border-brown/30 bg-charcoal text-amber-500 focus:ring-amber-500/50 shrink-0">`);
          } else {
            _push(`<!---->`);
          }
          _push(ssrRenderComponent(_component_UIcon, {
            name: isCollapsed(barrel._id) ? "i-lucide-chevron-right" : "i-lucide-chevron-down",
            class: "text-parchment/60 shrink-0 transition-transform duration-200"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-cylinder",
            class: "text-amber/70 shrink-0"
          }, null, _parent));
          _push(`<span class="text-sm font-bold text-parchment font-[Cormorant_Garamond]">${ssrInterpolate(barrel.name)}</span>`);
          if (barrel.barrel?.size) {
            _push(ssrRenderComponent(_component_UBadge, {
              variant: "subtle",
              color: "neutral",
              size: "xs"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(barrel.barrel.size)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(barrel.barrel.size), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (isCollapsed(barrel._id)) {
            _push(`<!--[-->`);
            if (getBarrelContent(barrel)) {
              _push(`<span class="text-xs text-parchment/50 hidden sm:inline">${ssrInterpolate(getBarrelContent(barrel).volume.toFixed(1))} ${ssrInterpolate(shortUnit(getBarrelContent(barrel).volumeUnit || "gallon"))} @ ${ssrInterpolate(getBarrelContent(barrel).abv.toFixed(1))}% ABV </span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<span class="ml-auto"></span>`);
            if (getBarrelTotalCost(barrel) > 0) {
              _push(`<span class="text-xs text-green-400 font-semibold shrink-0 hidden sm:inline">${ssrInterpolate(unref(Dollar).format(getBarrelTotalCost(barrel)))}</span>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(daysAged) !== null) {
              _push(`<span class="text-xs text-amber-400 font-semibold shrink-0">${ssrInterpolate(unref(daysAged))}d </span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<!--[--><span class="ml-auto"></span>`);
            if (unref(daysAged) !== null) {
              _push(`<span class="text-xs text-amber-400 font-semibold">${ssrInterpolate(unref(daysAged))} days </span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          }
          _push(`</div><div class="${ssrRenderClass([isCollapsed(barrel._id) ? "grid-rows-[0fr]" : "grid-rows-[1fr]", "grid transition-[grid-template-rows] duration-200 ease-in-out"])}"><div class="overflow-hidden"><div class="px-4 pb-4 space-y-4"><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Size</div><div class="text-sm text-parchment">${ssrInterpolate(barrel.barrel?.size || "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Char Level</div><div class="text-sm text-parchment">${ssrInterpolate(barrel.barrel?.char || unref(stage)?.charLevel || "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Previous Use</div><div class="text-sm text-parchment">${ssrInterpolate(barrel.previousContents || unref(stage)?.previousUse || "None")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Location</div><div class="text-sm text-parchment">${ssrInterpolate(barrel.location || unref(stage)?.warehouseLocation || "N/A")}</div></div></div>`);
          if (getBarrelContent(barrel)) {
            _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Volume</div><div class="text-sm text-parchment">${ssrInterpolate(getBarrelContent(barrel).volume.toFixed(1))} ${ssrInterpolate(shortUnit(getBarrelContent(barrel).volumeUnit || "gallon"))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">ABV</div><div class="text-sm text-parchment">${ssrInterpolate(getBarrelContent(barrel).abv.toFixed(1))}%</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Proof Gallons</div><div class="text-sm text-amber-400 font-semibold">${ssrInterpolate(unref(calculateProofGallons)(getBarrelContent(barrel).volume, getBarrelContent(barrel).volumeUnit || "gallon", getBarrelContent(barrel).abv).toFixed(2))} PG </div></div>`);
            if (barrel.stats?.volume) {
              _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Fill Level</div><div class="text-sm text-parchment">${ssrInterpolate((getBarrelContent(barrel).volume / barrel.stats.volume * 100).toFixed(0))}% </div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="grid grid-cols-3 gap-3 p-3 rounded-lg bg-brown/5 border border-brown/10"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Fill Cost</div><div class="text-sm text-parchment">${ssrInterpolate(getBarrelFillCost(barrel) > 0 ? unref(Dollar).format(getBarrelFillCost(barrel)) : "N/A")}</div><div class="text-[10px] text-parchment/60">Recipe ingredient cost</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Barrel Cost</div><div class="text-sm text-parchment">${ssrInterpolate(getBarrelCost(barrel) > 0 ? unref(Dollar).format(getBarrelCost(barrel)) : "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Total Cost</div><div class="text-sm text-green-400 font-semibold">${ssrInterpolate(getBarrelTotalCost(barrel) > 0 ? unref(Dollar).format(getBarrelTotalCost(barrel)) : "N/A")}</div></div></div>`);
          if (getBarrelAgingProgress(barrel)) {
            _push(`<div><div class="flex items-center justify-between mb-1"><div class="text-xs text-parchment/60 uppercase tracking-wider">Aging Progress</div><span class="${ssrRenderClass([getBarrelAgingProgress(barrel).percent >= 100 ? "text-green-400" : "text-amber-400", "text-xs font-semibold"])}">${ssrInterpolate(getBarrelAgingProgress(barrel).months)} / ${ssrInterpolate(getBarrelAgingProgress(barrel).target)} months — ${ssrInterpolate(getBarrelAgingProgress(barrel).percent)}% </span></div><div class="w-full h-2 rounded-full bg-brown/20 overflow-hidden"><div class="${ssrRenderClass([getAgingProgressColor(getBarrelAgingProgress(barrel)), "h-full rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${getBarrelAgingProgress(barrel).percent}%` })}"></div></div>`);
            if (getBarrelAgingProgress(barrel).percent >= 100) {
              _push(`<div class="mt-1 text-xs text-green-400 font-medium"> Target age reached </div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-center justify-between">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/vessels/${barrel._id}`,
            class: "text-xs text-gold hover:text-copper transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` View Barrel Details → `);
              } else {
                return [
                  createTextVNode(" View Barrel Details → ")
                ];
              }
            }),
            _: 2
          }, _parent));
          if (unref(nextStageAfterBarrelAging) && __props.batch.status === "active") {
            _push(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-arrow-right",
              size: "xs",
              variant: "outline",
              color: "primary",
              onClick: ($event) => openExitModal(barrel)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Send to ${ssrInterpolate(unref(nextStageAfterBarrelAging))}`);
                } else {
                  return [
                    createTextVNode(" Send to " + toDisplayString(unref(nextStageAfterBarrelAging)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(stage)?.vessel) {
        _push(`<div class="mb-5"><div class="text-sm text-parchment/60 mb-2"> Barrel: ${ssrInterpolate(unref(vesselStore).getVesselById(unref(stage).vessel)?.name || "Unknown")}</div></div>`);
      } else {
        _push(`<div class="mb-5 text-sm text-parchment/60 italic">No barrels assigned</div>`);
      }
      _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">`);
      _push(ssrRenderComponent(_component_BatchBarrelEntryExit, {
        batch: __props.batch,
        editing: __props.editing,
        type: "entry",
        "local-entry-exit": unref(local).entry
      }, null, _parent));
      _push(ssrRenderComponent(_component_BatchBarrelEntryExit, {
        batch: __props.batch,
        editing: __props.editing,
        type: "exit",
        "local-entry-exit": unref(local).exit
      }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_BatchBarrelSampling, {
        batch: __props.batch,
        editing: __props.editing
      }, null, _parent));
      _push(ssrRenderComponent(_component_BatchBarrelTastingNotes, { batch: __props.batch }, null, _parent));
      _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(local).notes,
          "onUpdate:modelValue": ($event) => unref(local).notes = $event,
          placeholder: "Barrel aging notes...",
          rows: 2
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.notes || "None")}</div>`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<div class="mt-4 flex justify-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: save,
          loading: unref(saving),
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Barrel Aging`);
            } else {
              return [
                createTextVNode("Save Barrel Aging")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UModal, {
        open: unref(showExitModal),
        "onUpdate:open": ($event) => isRef(showExitModal) ? showExitModal.value = $event : null
      }, {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-5"${_scopeId}><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-cylinder",
              class: "text-amber inline mr-1"
            }, null, _parent2, _scopeId));
            _push2(` ${ssrInterpolate(unref(exitBarrel)?.name)} → ${ssrInterpolate(unref(nextStageAfterBarrelAging))}</h3>`);
            if (unref(exitBarrelContent)) {
              _push2(`<div class="rounded-lg border border-brown/20 bg-brown/5 p-3 mb-4"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Current Contents</div><div class="flex flex-wrap gap-4 text-sm text-parchment"${_scopeId}><span${_scopeId}>${ssrInterpolate(unref(exitBarrelContent).volume.toFixed(1))} ${ssrInterpolate(shortUnit(unref(exitBarrelContent).volumeUnit || "gallon"))}</span><span${_scopeId}>${ssrInterpolate(unref(exitBarrelContent).abv.toFixed(1))}% ABV</span><span class="text-amber-400 font-semibold"${_scopeId}>${ssrInterpolate(unref(calculateProofGallons)(unref(exitBarrelContent).volume, unref(exitBarrelContent).volumeUnit || "gallon", unref(exitBarrelContent).abv).toFixed(2))} PG </span></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Exit Measurements</div><div class="grid grid-cols-3 gap-3 mb-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UFormField, { label: "Exit Volume" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(exitForm).volume,
                    "onUpdate:modelValue": ($event) => unref(exitForm).volume = $event,
                    modelModifiers: { number: true },
                    type: "number",
                    min: 0,
                    step: "0.1",
                    placeholder: "0"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(exitForm).volume,
                      "onUpdate:modelValue": ($event) => unref(exitForm).volume = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      min: 0,
                      step: "0.1",
                      placeholder: "0"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: unref(exitForm).volumeUnit,
                    "onUpdate:modelValue": ($event) => unref(exitForm).volumeUnit = $event,
                    items: ["gallon", "L"]
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_USelect, {
                      modelValue: unref(exitForm).volumeUnit,
                      "onUpdate:modelValue": ($event) => unref(exitForm).volumeUnit = $event,
                      items: ["gallon", "L"]
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, { label: "Exit ABV %" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(exitForm).abv,
                    "onUpdate:modelValue": ($event) => unref(exitForm).abv = $event,
                    modelModifiers: { number: true },
                    type: "number",
                    min: 0,
                    max: 100,
                    step: "0.1",
                    placeholder: "0"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(exitForm).abv,
                      "onUpdate:modelValue": ($event) => unref(exitForm).abv = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      min: 0,
                      max: 100,
                      step: "0.1",
                      placeholder: "0"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (unref(nextStageNeedsVessel)) {
              _push2(`<div class="mb-4"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Destination Vessel</div>`);
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(destinationVesselId),
                "onUpdate:modelValue": ($event) => isRef(destinationVesselId) ? destinationVesselId.value = $event : null,
                items: unref(tankOptions),
                "value-key": "value",
                "label-key": "label",
                placeholder: "Select destination tank..."
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(exitForm).volume > 0 && unref(exitForm).abv > 0) {
              _push2(`<div class="rounded-lg bg-brown/10 border border-brown/20 p-3 mb-4"${_scopeId}><div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center"${_scopeId}><div${_scopeId}><div class="text-xs text-parchment/50 uppercase"${_scopeId}>Proof Gallons</div><div class="text-sm text-amber-400 font-semibold"${_scopeId}>${ssrInterpolate(unref(exitProofGallons).toFixed(2))} PG</div></div>`);
              if (unref(exitBarrelContent)) {
                _push2(`<div${_scopeId}><div class="text-xs text-parchment/50 uppercase"${_scopeId}>Angel&#39;s Share</div><div class="text-sm text-parchment"${_scopeId}>${ssrInterpolate(((1 - unref(exitForm).volume / unref(exitBarrelContent).volume) * 100).toFixed(1))}% </div></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(exitBarrel)) {
                _push2(`<div${_scopeId}><div class="text-xs text-parchment/50 uppercase"${_scopeId}>Total Cost</div><div class="text-sm text-green-400 font-semibold"${_scopeId}>${ssrInterpolate(unref(Dollar).format(getBarrelTotalCost(unref(exitBarrel))))}</div></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="flex justify-end gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "outline",
              color: "neutral",
              onClick: ($event) => showExitModal.value = false
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Cancel`);
                } else {
                  return [
                    createTextVNode("Cancel")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              disabled: unref(exitForm).volume <= 0 || unref(exitForm).abv <= 0 || unref(nextStageNeedsVessel) && !unref(destinationVesselId),
              loading: unref(advancing),
              onClick: ($event) => sendBarrelsToNextStage([unref(exitBarrelId)], unref(exitForm))
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Send to ${ssrInterpolate(unref(nextStageAfterBarrelAging))}`);
                } else {
                  return [
                    createTextVNode(" Send to " + toDisplayString(unref(nextStageAfterBarrelAging)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-5" }, [
                createVNode("h3", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4" }, [
                  createVNode(_component_UIcon, {
                    name: "i-lucide-cylinder",
                    class: "text-amber inline mr-1"
                  }),
                  createTextVNode(" " + toDisplayString(unref(exitBarrel)?.name) + " → " + toDisplayString(unref(nextStageAfterBarrelAging)), 1)
                ]),
                unref(exitBarrelContent) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "rounded-lg border border-brown/20 bg-brown/5 p-3 mb-4"
                }, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Current Contents"),
                  createVNode("div", { class: "flex flex-wrap gap-4 text-sm text-parchment" }, [
                    createVNode("span", null, toDisplayString(unref(exitBarrelContent).volume.toFixed(1)) + " " + toDisplayString(shortUnit(unref(exitBarrelContent).volumeUnit || "gallon")), 1),
                    createVNode("span", null, toDisplayString(unref(exitBarrelContent).abv.toFixed(1)) + "% ABV", 1),
                    createVNode("span", { class: "text-amber-400 font-semibold" }, toDisplayString(unref(calculateProofGallons)(unref(exitBarrelContent).volume, unref(exitBarrelContent).volumeUnit || "gallon", unref(exitBarrelContent).abv).toFixed(2)) + " PG ", 1)
                  ])
                ])) : createCommentVNode("", true),
                createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Exit Measurements"),
                createVNode("div", { class: "grid grid-cols-3 gap-3 mb-4" }, [
                  createVNode(_component_UFormField, { label: "Exit Volume" }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: unref(exitForm).volume,
                        "onUpdate:modelValue": ($event) => unref(exitForm).volume = $event,
                        modelModifiers: { number: true },
                        type: "number",
                        min: 0,
                        step: "0.1",
                        placeholder: "0"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UFormField, { label: "Unit" }, {
                    default: withCtx(() => [
                      createVNode(_component_USelect, {
                        modelValue: unref(exitForm).volumeUnit,
                        "onUpdate:modelValue": ($event) => unref(exitForm).volumeUnit = $event,
                        items: ["gallon", "L"]
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UFormField, { label: "Exit ABV %" }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: unref(exitForm).abv,
                        "onUpdate:modelValue": ($event) => unref(exitForm).abv = $event,
                        modelModifiers: { number: true },
                        type: "number",
                        min: 0,
                        max: 100,
                        step: "0.1",
                        placeholder: "0"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  })
                ]),
                unref(nextStageNeedsVessel) ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "mb-4"
                }, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Destination Vessel"),
                  createVNode(_component_USelect, {
                    modelValue: unref(destinationVesselId),
                    "onUpdate:modelValue": ($event) => isRef(destinationVesselId) ? destinationVesselId.value = $event : null,
                    items: unref(tankOptions),
                    "value-key": "value",
                    "label-key": "label",
                    placeholder: "Select destination tank..."
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                ])) : createCommentVNode("", true),
                unref(exitForm).volume > 0 && unref(exitForm).abv > 0 ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "rounded-lg bg-brown/10 border border-brown/20 p-3 mb-4"
                }, [
                  createVNode("div", { class: "grid grid-cols-2 sm:grid-cols-3 gap-3 text-center" }, [
                    createVNode("div", null, [
                      createVNode("div", { class: "text-xs text-parchment/50 uppercase" }, "Proof Gallons"),
                      createVNode("div", { class: "text-sm text-amber-400 font-semibold" }, toDisplayString(unref(exitProofGallons).toFixed(2)) + " PG", 1)
                    ]),
                    unref(exitBarrelContent) ? (openBlock(), createBlock("div", { key: 0 }, [
                      createVNode("div", { class: "text-xs text-parchment/50 uppercase" }, "Angel's Share"),
                      createVNode("div", { class: "text-sm text-parchment" }, toDisplayString(((1 - unref(exitForm).volume / unref(exitBarrelContent).volume) * 100).toFixed(1)) + "% ", 1)
                    ])) : createCommentVNode("", true),
                    unref(exitBarrel) ? (openBlock(), createBlock("div", { key: 1 }, [
                      createVNode("div", { class: "text-xs text-parchment/50 uppercase" }, "Total Cost"),
                      createVNode("div", { class: "text-sm text-green-400 font-semibold" }, toDisplayString(unref(Dollar).format(getBarrelTotalCost(unref(exitBarrel)))), 1)
                    ])) : createCommentVNode("", true)
                  ])
                ])) : createCommentVNode("", true),
                createVNode("div", { class: "flex justify-end gap-2" }, [
                  createVNode(_component_UButton, {
                    variant: "outline",
                    color: "neutral",
                    onClick: ($event) => showExitModal.value = false
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Cancel")
                    ]),
                    _: 1
                  }, 8, ["onClick"]),
                  createVNode(_component_UButton, {
                    disabled: unref(exitForm).volume <= 0 || unref(exitForm).abv <= 0 || unref(nextStageNeedsVessel) && !unref(destinationVesselId),
                    loading: unref(advancing),
                    onClick: ($event) => sendBarrelsToNextStage([unref(exitBarrelId)], unref(exitForm))
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Send to " + toDisplayString(unref(nextStageAfterBarrelAging)), 1)
                    ]),
                    _: 1
                  }, 8, ["disabled", "loading", "onClick"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UModal, {
        open: unref(showAdvanceConfirm),
        "onUpdate:open": ($event) => isRef(showAdvanceConfirm) ? showAdvanceConfirm.value = $event : null
      }, {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-5"${_scopeId}><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"${_scopeId}> Send ${ssrInterpolate(unref(selectedBarrels).length)} Barrel${ssrInterpolate(unref(selectedBarrels).length > 1 ? "s" : "")} to ${ssrInterpolate(unref(nextStageAfterBarrelAging))}</h3><div class="space-y-2 mb-4"${_scopeId}><!--[-->`);
            ssrRenderList(unref(selectedBarrels), (barrel) => {
              _push2(`<div class="flex items-center justify-between text-sm p-2 rounded bg-brown/5 border border-brown/10"${_scopeId}><div class="flex items-center gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-cylinder",
                class: "text-amber/70"
              }, null, _parent2, _scopeId));
              _push2(`<span class="text-parchment"${_scopeId}>${ssrInterpolate(barrel.name)}</span>`);
              if (barrel.barrel?.size) {
                _push2(ssrRenderComponent(_component_UBadge, {
                  variant: "subtle",
                  color: "neutral",
                  size: "xs"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(barrel.barrel.size)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(barrel.barrel.size), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="flex items-center gap-3 text-xs"${_scopeId}>`);
              if (getBarrelContent(barrel)) {
                _push2(`<span class="text-parchment/50"${_scopeId}>${ssrInterpolate(getBarrelContent(barrel).volume.toFixed(1))} ${ssrInterpolate(shortUnit(getBarrelContent(barrel).volumeUnit || "gallon"))}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<span class="text-green-400 font-semibold"${_scopeId}>${ssrInterpolate(unref(Dollar).format(getBarrelTotalCost(barrel)))}</span></div></div>`);
            });
            _push2(`<!--]--></div><div class="rounded-lg bg-brown/10 border border-brown/20 p-3 mb-4"${_scopeId}><div class="grid grid-cols-3 gap-3 text-center"${_scopeId}><div${_scopeId}><div class="text-xs text-parchment/50 uppercase"${_scopeId}>Total Volume</div><div class="text-sm text-parchment font-semibold"${_scopeId}>${ssrInterpolate(unref(selectedVolume).toFixed(1))} gal</div></div><div${_scopeId}><div class="text-xs text-parchment/50 uppercase"${_scopeId}>Total Cost</div><div class="text-sm text-green-400 font-semibold"${_scopeId}>${ssrInterpolate(unref(Dollar).format(unref(selectedCost)))}</div></div><div${_scopeId}><div class="text-xs text-parchment/50 uppercase"${_scopeId}>Remaining</div><div class="text-sm text-parchment/60"${_scopeId}>${ssrInterpolate(unref(batchBarrels).length - unref(selectedBarrels).length)} barrel${ssrInterpolate(unref(batchBarrels).length - unref(selectedBarrels).length !== 1 ? "s" : "")}</div></div></div></div>`);
            if (unref(nextStageNeedsVessel)) {
              _push2(`<div class="mb-4"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Destination Vessel</div>`);
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(destinationVesselId),
                "onUpdate:modelValue": ($event) => isRef(destinationVesselId) ? destinationVesselId.value = $event : null,
                items: unref(tankOptions),
                "value-key": "value",
                "label-key": "label",
                placeholder: "Select destination tank..."
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(batchBarrels).length > unref(selectedBarrels).length) {
              _push2(`<div class="flex items-center gap-2 rounded-lg border border-amber/20 bg-amber/5 px-3 py-2 mb-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-info",
                class: "text-amber shrink-0"
              }, null, _parent2, _scopeId));
              _push2(`<span class="text-xs text-parchment/70"${_scopeId}>${ssrInterpolate(unref(batchBarrels).length - unref(selectedBarrels).length)} barrel${ssrInterpolate(unref(batchBarrels).length - unref(selectedBarrels).length !== 1 ? "s" : "")} will remain aging. The batch will stay active in both Barrel Aging and ${ssrInterpolate(unref(nextStageAfterBarrelAging))}. </span></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="flex justify-end gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "outline",
              color: "neutral",
              onClick: ($event) => showAdvanceConfirm.value = false
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Cancel`);
                } else {
                  return [
                    createTextVNode("Cancel")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              loading: unref(advancing),
              disabled: unref(nextStageNeedsVessel) && !unref(destinationVesselId),
              onClick: ($event) => sendBarrelsToNextStage([...unref(selectedBarrelIds)])
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Send to ${ssrInterpolate(unref(nextStageAfterBarrelAging))}`);
                } else {
                  return [
                    createTextVNode(" Send to " + toDisplayString(unref(nextStageAfterBarrelAging)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-5" }, [
                createVNode("h3", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4" }, " Send " + toDisplayString(unref(selectedBarrels).length) + " Barrel" + toDisplayString(unref(selectedBarrels).length > 1 ? "s" : "") + " to " + toDisplayString(unref(nextStageAfterBarrelAging)), 1),
                createVNode("div", { class: "space-y-2 mb-4" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedBarrels), (barrel) => {
                    return openBlock(), createBlock("div", {
                      key: barrel._id,
                      class: "flex items-center justify-between text-sm p-2 rounded bg-brown/5 border border-brown/10"
                    }, [
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-cylinder",
                          class: "text-amber/70"
                        }),
                        createVNode("span", { class: "text-parchment" }, toDisplayString(barrel.name), 1),
                        barrel.barrel?.size ? (openBlock(), createBlock(_component_UBadge, {
                          key: 0,
                          variant: "subtle",
                          color: "neutral",
                          size: "xs"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(barrel.barrel.size), 1)
                          ]),
                          _: 2
                        }, 1024)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "flex items-center gap-3 text-xs" }, [
                        getBarrelContent(barrel) ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "text-parchment/50"
                        }, toDisplayString(getBarrelContent(barrel).volume.toFixed(1)) + " " + toDisplayString(shortUnit(getBarrelContent(barrel).volumeUnit || "gallon")), 1)) : createCommentVNode("", true),
                        createVNode("span", { class: "text-green-400 font-semibold" }, toDisplayString(unref(Dollar).format(getBarrelTotalCost(barrel))), 1)
                      ])
                    ]);
                  }), 128))
                ]),
                createVNode("div", { class: "rounded-lg bg-brown/10 border border-brown/20 p-3 mb-4" }, [
                  createVNode("div", { class: "grid grid-cols-3 gap-3 text-center" }, [
                    createVNode("div", null, [
                      createVNode("div", { class: "text-xs text-parchment/50 uppercase" }, "Total Volume"),
                      createVNode("div", { class: "text-sm text-parchment font-semibold" }, toDisplayString(unref(selectedVolume).toFixed(1)) + " gal", 1)
                    ]),
                    createVNode("div", null, [
                      createVNode("div", { class: "text-xs text-parchment/50 uppercase" }, "Total Cost"),
                      createVNode("div", { class: "text-sm text-green-400 font-semibold" }, toDisplayString(unref(Dollar).format(unref(selectedCost))), 1)
                    ]),
                    createVNode("div", null, [
                      createVNode("div", { class: "text-xs text-parchment/50 uppercase" }, "Remaining"),
                      createVNode("div", { class: "text-sm text-parchment/60" }, toDisplayString(unref(batchBarrels).length - unref(selectedBarrels).length) + " barrel" + toDisplayString(unref(batchBarrels).length - unref(selectedBarrels).length !== 1 ? "s" : ""), 1)
                    ])
                  ])
                ]),
                unref(nextStageNeedsVessel) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "mb-4"
                }, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Destination Vessel"),
                  createVNode(_component_USelect, {
                    modelValue: unref(destinationVesselId),
                    "onUpdate:modelValue": ($event) => isRef(destinationVesselId) ? destinationVesselId.value = $event : null,
                    items: unref(tankOptions),
                    "value-key": "value",
                    "label-key": "label",
                    placeholder: "Select destination tank..."
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                ])) : createCommentVNode("", true),
                unref(batchBarrels).length > unref(selectedBarrels).length ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "flex items-center gap-2 rounded-lg border border-amber/20 bg-amber/5 px-3 py-2 mb-4"
                }, [
                  createVNode(_component_UIcon, {
                    name: "i-lucide-info",
                    class: "text-amber shrink-0"
                  }),
                  createVNode("span", { class: "text-xs text-parchment/70" }, toDisplayString(unref(batchBarrels).length - unref(selectedBarrels).length) + " barrel" + toDisplayString(unref(batchBarrels).length - unref(selectedBarrels).length !== 1 ? "s" : "") + " will remain aging. The batch will stay active in both Barrel Aging and " + toDisplayString(unref(nextStageAfterBarrelAging)) + ". ", 1)
                ])) : createCommentVNode("", true),
                createVNode("div", { class: "flex justify-end gap-2" }, [
                  createVNode(_component_UButton, {
                    variant: "outline",
                    color: "neutral",
                    onClick: ($event) => showAdvanceConfirm.value = false
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Cancel")
                    ]),
                    _: 1
                  }, 8, ["onClick"]),
                  createVNode(_component_UButton, {
                    loading: unref(advancing),
                    disabled: unref(nextStageNeedsVessel) && !unref(destinationVesselId),
                    onClick: ($event) => sendBarrelsToNextStage([...unref(selectedBarrelIds)])
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Send to " + toDisplayString(unref(nextStageAfterBarrelAging)), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled", "onClick"])
                ])
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
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchBarrelAging.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$b, { __name: "BatchBarrelAging" });
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "BatchStorage",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    useToast();
    const stage = computed(() => props.batch.stages?.storage);
    const containingVessels = computed(() => {
      if (!props.batch?._id) return [];
      return vesselStore.vessels.filter(
        (v) => v.contents?.some((c) => c.batch === props.batch._id)
      );
    });
    const vesselName = computed(() => {
      if (!stage.value?.vessel) return "Not assigned";
      return vesselStore.getVesselById(stage.value.vessel)?.name || "Unknown";
    });
    const startDate = computed(() => {
      if (!stage.value?.startedAt) return "Not set";
      return new Date(stage.value.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    });
    const local = ref({
      vessel: stage.value?.vessel || "",
      volume: stage.value?.volume,
      volumeUnit: stage.value?.volumeUnit || "gallon",
      abv: stage.value?.abv,
      proofGallons: stage.value?.proofGallons,
      notes: stage.value?.notes || ""
    });
    const tankOptions = computed(
      () => vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
    );
    const calculatedProofGallons = computed(() => {
      if (local.value.volume && local.value.abv) {
        return calculateProofGallons(local.value.volume, local.value.volumeUnit, local.value.abv);
      }
      return null;
    });
    const displayProofGallons = computed(() => {
      if (stage.value?.proofGallons) return stage.value.proofGallons;
      if (stage.value?.volume && stage.value?.abv) {
        return calculateProofGallons(stage.value.volume, stage.value.volumeUnit || "gallon", stage.value.abv);
      }
      return null;
    });
    watch([() => local.value.volume, () => local.value.abv], () => {
      if (calculatedProofGallons.value !== null) {
        local.value.proofGallons = calculatedProofGallons.value;
      }
    });
    const saving = ref(false);
    const save = async () => {
      saving.value = true;
      try {
        await batchStore.updateStageData(props.batch._id, "Storage", {
          vessel: local.value.vessel || void 0,
          volume: local.value.volume,
          volumeUnit: local.value.volumeUnit,
          abv: local.value.abv,
          proofGallons: local.value.proofGallons,
          notes: local.value.notes
        });
      } finally {
        saving.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_VesselCard = __nuxt_component_2$1;
      const _component_USelect = _sfc_main$o;
      const _component_UFormField = _sfc_main$p;
      const _component_UInput = _sfc_main$m;
      const _component_UTextarea = _sfc_main$n;
      const _component_UButton = _sfc_main$8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-purple-500/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-warehouse",
        class: "text-lg text-purple-400"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Storage</h3></div><div class="flex items-center gap-3">`);
      if (unref(stage)?.abv) {
        _push(`<span class="px-2 py-0.5 rounded-full text-xs font-semibold border bg-purple-500/15 text-purple-400 border-purple-500/25">${ssrInterpolate(unref(stage).abv)}% ABV </span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(displayProofGallons)) {
        _push(`<span class="text-sm text-purple-400 font-semibold">${ssrInterpolate(unref(displayProofGallons))} PG </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(containingVessels).length > 0 && !__props.editing) {
        _push(`<div class="mb-5"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-3">Current Vessels</div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"><!--[-->`);
        ssrRenderList(unref(containingVessels), (vessel) => {
          _push(ssrRenderComponent(_component_VesselCard, {
            key: vessel._id,
            vessel
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.editing) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>`);
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).vessel,
          "onUpdate:modelValue": ($event) => unref(local).vessel = $event,
          items: unref(tankOptions),
          "value-key": "value",
          "label-key": "label",
          placeholder: "Select tank"
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(startDate))}</div></div></div>`);
      } else if (unref(containingVessels).length === 0) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vesselName))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(startDate))}</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.editing) {
        _push(`<div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Contents</div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).volume,
                "onUpdate:modelValue": ($event) => unref(local).volume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).volume,
                  "onUpdate:modelValue": ($event) => unref(local).volume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).volumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).volumeUnit = $event,
                items: ["gallon", "L", "mL"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).volumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).volumeUnit = $event,
                  items: ["gallon", "L", "mL"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).abv,
                "onUpdate:modelValue": ($event) => unref(local).abv = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.1",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).abv,
                  "onUpdate:modelValue": ($event) => unref(local).abv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Proof Gallons" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).proofGallons,
                "onUpdate:modelValue": ($event) => unref(local).proofGallons = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.01",
                placeholder: unref(calculatedProofGallons)?.toString() || "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).proofGallons,
                  "onUpdate:modelValue": ($event) => unref(local).proofGallons = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.01",
                  placeholder: unref(calculatedProofGallons)?.toString() || "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else if (unref(containingVessels).length === 0) {
        _push(`<div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Contents</div><div class="flex flex-wrap gap-6 text-sm text-parchment/60">`);
        if (unref(stage)?.volume) {
          _push(`<span>Volume: ${ssrInterpolate(unref(stage).volume)} ${ssrInterpolate(unref(stage).volumeUnit)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.abv) {
          _push(`<span>ABV: ${ssrInterpolate(unref(stage).abv)}%</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(displayProofGallons)) {
          _push(`<span class="text-purple-400 font-semibold">PG: ${ssrInterpolate(unref(displayProofGallons))}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(stage)?.volume && !unref(stage)?.abv) {
          _push(`<span>Not recorded</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.editing && unref(containingVessels).length > 0) {
        _push(`<div class="mb-4"><div class="flex flex-wrap gap-6 text-sm"><div><span class="text-parchment/50">Total Volume: </span><span class="text-parchment">${ssrInterpolate(unref(stage)?.volume || 0)} ${ssrInterpolate(unref(stage)?.volumeUnit || "gallon")}</span></div><div><span class="text-parchment/50">Start Date: </span><span class="text-parchment">${ssrInterpolate(unref(startDate))}</span></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(local).notes,
          "onUpdate:modelValue": ($event) => unref(local).notes = $event,
          placeholder: "Storage notes...",
          rows: 2
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.notes || "None")}</div>`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<div class="mt-4 flex justify-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: save,
          loading: unref(saving),
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Storage`);
            } else {
              return [
                createTextVNode("Save Storage")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchStorage.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$a, { __name: "BatchStorage" });
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "BatchBlending",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const router = useRouter();
    const toast = useToast();
    const stage = computed(() => props.batch.stages?.blending);
    const vesselName = computed(() => {
      if (!stage.value?.vessel) return "Not assigned";
      return vesselStore.getVesselById(stage.value.vessel)?.name || "Unknown";
    });
    const startDate = computed(() => {
      if (!stage.value?.startedAt) return "Not set";
      return new Date(stage.value.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    });
    const local = ref({
      vessel: stage.value?.vessel || "",
      components: stage.value?.components?.length ? stage.value.components.map((c) => ({
        source: c.source || "",
        volume: c.volume,
        volumeUnit: c.volumeUnit || "gallon",
        abv: c.abv
      })) : [{ source: "", volume: void 0, volumeUnit: "gallon", abv: void 0 }],
      resultVolume: stage.value?.resultVolume,
      resultVolumeUnit: stage.value?.resultVolumeUnit || "gallon",
      resultAbv: stage.value?.resultAbv,
      notes: stage.value?.notes || ""
    });
    const tankOptions = computed(
      () => vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
    );
    const addComponent = () => {
      local.value.components.push({
        source: "",
        volume: void 0,
        volumeUnit: "gallon",
        abv: void 0
      });
    };
    const removeComponent = (index) => {
      if (local.value.components.length > 1) {
        local.value.components.splice(index, 1);
      }
    };
    const blendTargetUnit = computed(() => local.value.resultVolumeUnit || local.value.components[0]?.volumeUnit || "gallon");
    const calculatedTotalVolume = computed(() => {
      const target = blendTargetUnit.value;
      const total = local.value.components.reduce((sum, c) => {
        return sum + (c.volume || 0) * convertUnitRatio(c.volumeUnit || target, target);
      }, 0);
      return total > 0 ? +total.toFixed(2) : null;
    });
    const calculatedBlendedAbv = computed(() => {
      const target = blendTargetUnit.value;
      const totalVolume = local.value.components.reduce((sum, c) => {
        return sum + (c.volume || 0) * convertUnitRatio(c.volumeUnit || target, target);
      }, 0);
      if (totalVolume <= 0) return null;
      const weightedAbv = local.value.components.reduce((sum, c) => {
        const converted = (c.volume || 0) * convertUnitRatio(c.volumeUnit || target, target);
        return sum + converted * (c.abv || 0);
      }, 0);
      return +(weightedAbv / totalVolume).toFixed(2);
    });
    const recipe = computed(() => props.batch?.recipe ? recipeStore.getRecipeById(props.batch.recipe) : void 0);
    computed(() => {
      const idx = props.batch.pipeline.indexOf("Blending");
      if (idx === -1 || idx >= props.batch.pipeline.length - 1) return null;
      return props.batch.pipeline[idx + 1];
    });
    const creatingBlend = ref(false);
    const createBlendedBatch = async () => {
      const resultVol = stage.value?.resultVolume || calculatedTotalVolume.value;
      stage.value?.resultAbv || calculatedBlendedAbv.value;
      if (!resultVol || !recipe.value) return;
      creatingBlend.value = true;
      try {
        const blendIdx = props.batch.pipeline.indexOf("Blending");
        const remainingPipeline = blendIdx >= 0 ? props.batch.pipeline.slice(blendIdx + 1) : ["Storage", "Proofing", "Bottled"];
        batchStore.resetBatch();
        const blendedBatch = batchStore.batch;
        blendedBatch.recipe = props.batch.recipe;
        blendedBatch.pipeline = remainingPipeline;
        blendedBatch.currentStage = remainingPipeline[0] || "Storage";
        blendedBatch.status = "active";
        blendedBatch.batchSize = resultVol;
        blendedBatch.batchSizeUnit = stage.value?.resultVolumeUnit || props.batch.batchSizeUnit || "gallon";
        blendedBatch.recipeCost = props.batch.recipeCost || 0;
        blendedBatch.stageVolumes = { [remainingPipeline[0] || "Storage"]: resultVol };
        blendedBatch.notes = `Mixed blend from batch ${props.batch.batchNumber || props.batch._id}. Class: Mixed ${recipe.value.class || ""}`.trim();
        await batchStore.updateBatch();
        toast.add({
          title: "Blended batch created",
          description: `Mixed ${recipe.value.class || "Spirit"} — ${resultVol} ${blendedBatch.batchSizeUnit}`,
          color: "success",
          icon: "i-lucide-git-merge"
        });
        const newBatch = batchStore.batches[batchStore.batches.length - 1];
        if (newBatch?._id) {
          router.push(`/admin/batch/${newBatch._id}`);
        }
      } catch (error) {
        toast.add({
          title: "Failed to create blended batch",
          description: getErrorMessage(error),
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        creatingBlend.value = false;
      }
    };
    const saving = ref(false);
    const save = async () => {
      saving.value = true;
      try {
        await batchStore.updateStageData(props.batch._id, "Blending", {
          vessel: local.value.vessel || void 0,
          components: local.value.components.filter((c) => c.source || c.volume || c.abv).map((c) => ({
            source: c.source,
            volume: c.volume,
            volumeUnit: c.volumeUnit,
            abv: c.abv
          })),
          resultVolume: local.value.resultVolume,
          resultVolumeUnit: local.value.resultVolumeUnit,
          resultAbv: local.value.resultAbv,
          notes: local.value.notes
        });
      } finally {
        saving.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_USelect = _sfc_main$o;
      const _component_UButton = _sfc_main$8$1;
      const _component_UFormField = _sfc_main$p;
      const _component_UInput = _sfc_main$m;
      const _component_UTextarea = _sfc_main$n;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-pink-500/30 p-5" }, _attrs))}><div class="flex items-center gap-2 mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-git-merge",
        class: "text-lg text-pink-400"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Blending</h3></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).vessel,
          "onUpdate:modelValue": ($event) => unref(local).vessel = $event,
          items: unref(tankOptions),
          "value-key": "value",
          "label-key": "label",
          placeholder: "Select tank"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(vesselName))}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(startDate))}</div></div></div><div class="mb-4"><div class="flex items-center justify-between mb-2"><div class="text-xs text-parchment/60 uppercase tracking-wider">Components</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          variant: "outline",
          icon: "i-lucide-plus",
          onClick: addComponent
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add Component `);
            } else {
              return [
                createTextVNode(" Add Component ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<!--[--><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(local).components, (comp, index) => {
          _push(`<div class="p-3 rounded-lg border border-pink-500/15 bg-pink-500/5"><div class="flex items-start gap-2"><div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">`);
          _push(ssrRenderComponent(_component_UFormField, { label: "Source" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: comp.source,
                  "onUpdate:modelValue": ($event) => comp.source = $event,
                  placeholder: "e.g. Batch #42, Tank 3"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UInput, {
                    modelValue: comp.source,
                    "onUpdate:modelValue": ($event) => comp.source = $event,
                    placeholder: "e.g. Batch #42, Tank 3"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: comp.volume,
                  "onUpdate:modelValue": ($event) => comp.volume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UInput, {
                    modelValue: comp.volume,
                    "onUpdate:modelValue": ($event) => comp.volume = $event,
                    modelModifiers: { number: true },
                    type: "number",
                    placeholder: "0"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_USelect, {
                  modelValue: comp.volumeUnit,
                  "onUpdate:modelValue": ($event) => comp.volumeUnit = $event,
                  items: ["gallon", "L", "mL"]
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_USelect, {
                    modelValue: comp.volumeUnit,
                    "onUpdate:modelValue": ($event) => comp.volumeUnit = $event,
                    items: ["gallon", "L", "mL"]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: comp.abv,
                  "onUpdate:modelValue": ($event) => comp.abv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "0"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UInput, {
                    modelValue: comp.abv,
                    "onUpdate:modelValue": ($event) => comp.abv = $event,
                    modelModifiers: { number: true },
                    type: "number",
                    step: "0.1",
                    placeholder: "0"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
          if (unref(local).components.length > 1) {
            _push(ssrRenderComponent(_component_UButton, {
              size: "xs",
              color: "error",
              variant: "ghost",
              icon: "i-lucide-trash-2",
              class: "mt-6",
              onClick: ($event) => removeComponent(index)
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
        if (unref(calculatedTotalVolume)) {
          _push(`<div class="mt-2 px-3 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20"><span class="text-xs text-pink-400"> Calculated: ${ssrInterpolate(unref(calculatedTotalVolume))} ${ssrInterpolate(unref(blendTargetUnit))} `);
          if (unref(calculatedBlendedAbv)) {
            _push(`<!--[--> @ ${ssrInterpolate(unref(calculatedBlendedAbv))}% ABV<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!--[-->`);
        if (unref(stage)?.components?.length) {
          _push(`<div class="divide-y divide-pink-500/10"><!--[-->`);
          ssrRenderList(unref(stage).components, (comp, index) => {
            _push(`<div class="flex items-center justify-between py-2 text-sm"><span class="text-parchment">${ssrInterpolate(comp.source || "Unknown source")}</span><span class="text-parchment/60">${ssrInterpolate(comp.volume || 0)} ${ssrInterpolate(comp.volumeUnit || "gallon")}</span><span class="text-parchment/60">${ssrInterpolate(comp.abv || 0)}% ABV</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-sm text-parchment/50">No components recorded</div>`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div><div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Result</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).resultVolume,
                "onUpdate:modelValue": ($event) => unref(local).resultVolume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: unref(calculatedTotalVolume)?.toString() || "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).resultVolume,
                  "onUpdate:modelValue": ($event) => unref(local).resultVolume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: unref(calculatedTotalVolume)?.toString() || "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).resultVolumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).resultVolumeUnit = $event,
                items: ["gallon", "L", "mL"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).resultVolumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).resultVolumeUnit = $event,
                  items: ["gallon", "L", "mL"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).resultAbv,
                "onUpdate:modelValue": ($event) => unref(local).resultAbv = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.1",
                placeholder: unref(calculatedBlendedAbv)?.toString() || "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).resultAbv,
                  "onUpdate:modelValue": ($event) => unref(local).resultAbv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: unref(calculatedBlendedAbv)?.toString() || "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex flex-wrap gap-6 text-sm text-parchment/60">`);
        if (unref(stage)?.resultVolume) {
          _push(`<span>Volume: ${ssrInterpolate(unref(stage).resultVolume)} ${ssrInterpolate(unref(stage).resultVolumeUnit)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.resultAbv) {
          _push(`<span>ABV: ${ssrInterpolate(unref(stage).resultAbv)}%</span>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(stage)?.resultVolume && !unref(stage)?.resultAbv) {
          _push(`<span>Not recorded</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(local).notes,
          "onUpdate:modelValue": ($event) => unref(local).notes = $event,
          placeholder: "Blending notes...",
          rows: 2
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.notes || "None")}</div>`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<div class="mt-4 flex items-center justify-between">`);
        if ((unref(stage)?.resultVolume || unref(calculatedTotalVolume)) && unref(recipe)) {
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-git-merge",
            variant: "soft",
            color: "success",
            size: "sm",
            loading: unref(creatingBlend),
            onClick: createBlendedBatch
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Create Mixed ${ssrInterpolate(unref(recipe)?.class || "Spirit")} Batch `);
              } else {
                return [
                  createTextVNode(" Create Mixed " + toDisplayString(unref(recipe)?.class || "Spirit") + " Batch ", 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<div></div>`);
        }
        _push(ssrRenderComponent(_component_UButton, {
          onClick: save,
          loading: unref(saving),
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Blending`);
            } else {
              return [
                createTextVNode("Save Blending")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchBlending.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_7 = Object.assign(_sfc_main$9, { __name: "BatchBlending" });
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "BatchProofing",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const stage = computed(() => props.batch.stages?.proofing);
    const recipe = computed(() => props.batch?.recipe ? recipeStore.getRecipeById(props.batch.recipe) : void 0);
    const vesselName = computed(() => {
      if (!stage.value?.vessel) return "Not assigned";
      return vesselStore.getVesselById(stage.value.vessel)?.name || "Unknown";
    });
    const startDate = computed(() => {
      if (!stage.value?.startedAt) return "Not set";
      return new Date(stage.value.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    });
    const vesselDefaults = computed(() => {
      const vessels = vesselStore.vessels.filter(
        (v2) => v2.contents?.some((c) => c.batch === props.batch._id)
      );
      if (vessels.length === 0) return null;
      const v = vessels[0];
      const batchContent = v.contents?.find((c) => c.batch === props.batch._id);
      return {
        volume: batchContent?.volume || v.current?.volume,
        volumeUnit: batchContent?.volumeUnit || v.current?.volumeUnit || "gallon",
        abv: batchContent?.abv || v.current?.abv
      };
    });
    const local = ref({
      vessel: stage.value?.vessel || "",
      startAbv: stage.value?.startAbv ?? vesselDefaults.value?.abv,
      startVolume: stage.value?.startVolume ?? vesselDefaults.value?.volume,
      startVolumeUnit: stage.value?.startVolumeUnit || vesselDefaults.value?.volumeUnit || "gallon",
      targetAbv: stage.value?.targetAbv ?? recipe.value?.targetAbv,
      waterAdded: stage.value?.waterAdded,
      waterAddedUnit: stage.value?.waterAddedUnit || "gallon",
      waterSource: stage.value?.waterSource || "",
      finalAbv: stage.value?.finalAbv,
      finalVolume: stage.value?.finalVolume,
      finalVolumeUnit: stage.value?.finalVolumeUnit || "gallon",
      finalProofGallons: stage.value?.finalProofGallons,
      notes: stage.value?.notes || ""
    });
    const tankOptions = computed(
      () => vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
    );
    watch(() => local.value.vessel, (newVesselId) => {
      if (!newVesselId || !props.editing) return;
      const vessel = vesselStore.getVesselById(newVesselId);
      if (!vessel) return;
      const batchContent = vessel.contents?.find((c) => c.batch === props.batch._id);
      if (!local.value.startVolume) {
        local.value.startVolume = batchContent?.volume || vessel.current?.volume;
        local.value.startVolumeUnit = batchContent?.volumeUnit || vessel.current?.volumeUnit || "gallon";
      }
      if (!local.value.startAbv) {
        local.value.startAbv = batchContent?.abv || vessel.current?.abv;
      }
    });
    const calculatedWaterNeeded = computed(() => {
      const { startAbv, targetAbv, startVolume } = local.value;
      if (startAbv && targetAbv && startVolume && targetAbv > 0 && startAbv > targetAbv) {
        const result = startAbv / targetAbv * startVolume - startVolume;
        return +result.toFixed(2);
      }
      return null;
    });
    const calculatedProofGallons = computed(() => {
      if (local.value.finalVolume && local.value.finalAbv) {
        return calculateProofGallons(local.value.finalVolume, local.value.finalVolumeUnit, local.value.finalAbv);
      }
      return null;
    });
    const displayProofGallons = computed(() => {
      if (stage.value?.finalProofGallons) return stage.value.finalProofGallons;
      if (stage.value?.finalVolume && stage.value?.finalAbv) {
        return calculateProofGallons(stage.value.finalVolume, stage.value.finalVolumeUnit || "gallon", stage.value.finalAbv);
      }
      return null;
    });
    watch([() => local.value.finalVolume, () => local.value.finalAbv], () => {
      if (calculatedProofGallons.value !== null) {
        local.value.finalProofGallons = calculatedProofGallons.value;
      }
    });
    const saving = ref(false);
    const save = async () => {
      saving.value = true;
      try {
        await batchStore.updateStageData(props.batch._id, "Proofing", {
          vessel: local.value.vessel || void 0,
          startAbv: local.value.startAbv,
          startVolume: local.value.startVolume,
          startVolumeUnit: local.value.startVolumeUnit,
          targetAbv: local.value.targetAbv,
          waterAdded: local.value.waterAdded,
          waterAddedUnit: local.value.waterAddedUnit,
          waterSource: local.value.waterSource,
          finalAbv: local.value.finalAbv,
          finalVolume: local.value.finalVolume,
          finalVolumeUnit: local.value.finalVolumeUnit,
          finalProofGallons: local.value.finalProofGallons,
          notes: local.value.notes
        });
      } finally {
        saving.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_USelect = _sfc_main$o;
      const _component_UFormField = _sfc_main$p;
      const _component_UInput = _sfc_main$m;
      const _component_UTextarea = _sfc_main$n;
      const _component_UButton = _sfc_main$8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-cyan-500/30 p-5" }, _attrs))}><div class="flex items-center gap-2 mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-droplets",
        class: "text-lg text-cyan-400"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Proofing</h3></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_USelect, {
          modelValue: unref(local).vessel,
          "onUpdate:modelValue": ($event) => unref(local).vessel = $event,
          items: unref(tankOptions),
          "value-key": "value",
          "label-key": "label",
          placeholder: "Select tank"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(vesselName))}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(startDate))}</div></div></div><div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Starting Spirit</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).startAbv,
                "onUpdate:modelValue": ($event) => unref(local).startAbv = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.1",
                placeholder: "e.g. 65"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).startAbv,
                  "onUpdate:modelValue": ($event) => unref(local).startAbv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "e.g. 65"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).startVolume,
                "onUpdate:modelValue": ($event) => unref(local).startVolume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).startVolume,
                  "onUpdate:modelValue": ($event) => unref(local).startVolume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).startVolumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).startVolumeUnit = $event,
                items: ["gallon", "L", "mL"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).startVolumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).startVolumeUnit = $event,
                  items: ["gallon", "L", "mL"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Target ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).targetAbv,
                "onUpdate:modelValue": ($event) => unref(local).targetAbv = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.1",
                placeholder: "e.g. 40"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).targetAbv,
                  "onUpdate:modelValue": ($event) => unref(local).targetAbv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "e.g. 40"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex flex-wrap gap-6 text-sm text-parchment/60">`);
        if (unref(stage)?.startAbv) {
          _push(`<span>Start ABV: ${ssrInterpolate(unref(stage).startAbv)}%</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.startVolume) {
          _push(`<span>Volume: ${ssrInterpolate(unref(stage).startVolume)} ${ssrInterpolate(unref(stage).startVolumeUnit)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.targetAbv) {
          _push(`<span class="text-cyan-400 font-semibold">Target: ${ssrInterpolate(unref(stage).targetAbv)}%</span>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(stage)?.startAbv && !unref(stage)?.startVolume) {
          _push(`<span>Not recorded</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
      if (__props.editing && unref(vesselDefaults) && !unref(stage)?.startAbv) {
        _push(`<div class="mb-4 px-3 py-2 rounded-lg bg-cyan-500/5 border border-cyan-500/15"><span class="text-xs text-cyan-400/70">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-info",
          class: "inline-block mr-1"
        }, null, _parent));
        _push(` Defaults pulled from vessel: ${ssrInterpolate(unref(vesselDefaults).volume)} ${ssrInterpolate(unref(vesselDefaults).volumeUnit)} @ ${ssrInterpolate(unref(vesselDefaults).abv)}% ABV </span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.editing && unref(calculatedWaterNeeded)) {
        _push(`<div class="mb-4 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20"><span class="text-xs text-cyan-400"> Estimated water needed: ${ssrInterpolate(unref(calculatedWaterNeeded))} ${ssrInterpolate(unref(local).startVolumeUnit)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Water Addition</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Water Added" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).waterAdded,
                "onUpdate:modelValue": ($event) => unref(local).waterAdded = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: unref(calculatedWaterNeeded)?.toString() || "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).waterAdded,
                  "onUpdate:modelValue": ($event) => unref(local).waterAdded = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: unref(calculatedWaterNeeded)?.toString() || "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).waterAddedUnit,
                "onUpdate:modelValue": ($event) => unref(local).waterAddedUnit = $event,
                items: ["gallon", "L", "mL"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).waterAddedUnit,
                  "onUpdate:modelValue": ($event) => unref(local).waterAddedUnit = $event,
                  items: ["gallon", "L", "mL"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Water Source" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).waterSource,
                "onUpdate:modelValue": ($event) => unref(local).waterSource = $event,
                placeholder: "e.g. RO, distilled, municipal"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).waterSource,
                  "onUpdate:modelValue": ($event) => unref(local).waterSource = $event,
                  placeholder: "e.g. RO, distilled, municipal"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex flex-wrap gap-6 text-sm text-parchment/60">`);
        if (unref(stage)?.waterAdded) {
          _push(`<span>Added: ${ssrInterpolate(unref(stage).waterAdded)} ${ssrInterpolate(unref(stage).waterAddedUnit)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.waterSource) {
          _push(`<span>Source: ${ssrInterpolate(unref(stage).waterSource)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(stage)?.waterAdded && !unref(stage)?.waterSource) {
          _push(`<span>Not recorded</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div class="mb-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Final Result</div>`);
      if (__props.editing) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Final ABV %" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).finalAbv,
                "onUpdate:modelValue": ($event) => unref(local).finalAbv = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.1",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).finalAbv,
                  "onUpdate:modelValue": ($event) => unref(local).finalAbv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.1",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Final Volume" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).finalVolume,
                "onUpdate:modelValue": ($event) => unref(local).finalVolume = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).finalVolume,
                  "onUpdate:modelValue": ($event) => unref(local).finalVolume = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelect, {
                modelValue: unref(local).finalVolumeUnit,
                "onUpdate:modelValue": ($event) => unref(local).finalVolumeUnit = $event,
                items: ["gallon", "L", "mL"]
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelect, {
                  modelValue: unref(local).finalVolumeUnit,
                  "onUpdate:modelValue": ($event) => unref(local).finalVolumeUnit = $event,
                  items: ["gallon", "L", "mL"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Proof Gallons" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(local).finalProofGallons,
                "onUpdate:modelValue": ($event) => unref(local).finalProofGallons = $event,
                modelModifiers: { number: true },
                type: "number",
                step: "0.01",
                placeholder: unref(calculatedProofGallons)?.toString() || "0"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(local).finalProofGallons,
                  "onUpdate:modelValue": ($event) => unref(local).finalProofGallons = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  step: "0.01",
                  placeholder: unref(calculatedProofGallons)?.toString() || "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex flex-wrap gap-6 text-sm text-parchment/60">`);
        if (unref(stage)?.finalAbv) {
          _push(`<span>Final ABV: ${ssrInterpolate(unref(stage).finalAbv)}%</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage)?.finalVolume) {
          _push(`<span>Volume: ${ssrInterpolate(unref(stage).finalVolume)} ${ssrInterpolate(unref(stage).finalVolumeUnit)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(displayProofGallons)) {
          _push(`<span class="text-cyan-400 font-semibold">PG: ${ssrInterpolate(unref(displayProofGallons))}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(stage)?.finalAbv && !unref(stage)?.finalVolume) {
          _push(`<span>Not recorded</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(local).notes,
          "onUpdate:modelValue": ($event) => unref(local).notes = $event,
          placeholder: "Proofing notes...",
          rows: 2
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.notes || "None")}</div>`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<div class="mt-4 flex justify-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: save,
          loading: unref(saving),
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Proofing`);
            } else {
              return [
                createTextVNode("Save Proofing")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchProofing.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_8 = Object.assign(_sfc_main$8, { __name: "BatchProofing" });
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "BatchBottled",
  __ssrInlineRender: true,
  props: {
    batch: {},
    editing: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const productionStore = useProductionStore();
    const bottleStore = useBottleStore();
    const vesselStore = useVesselStore();
    const overlay = useOverlay();
    const toast = useToast();
    const stage = computed(() => props.batch.stages?.bottled);
    const production = computed(() => {
      if (!stage.value?.productionRecord) return null;
      return productionStore.productions.find((p) => p._id === stage.value?.productionRecord);
    });
    const bottleName = computed(() => {
      if (!production.value?.bottle) return "Unknown";
      return bottleStore.getBottleById(production.value.bottle)?.name || "Unknown";
    });
    const prodDate = computed(() => {
      if (!production.value?.date) return "";
      return new Date(production.value.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    });
    const totalCost = computed(() => {
      if (!production.value) return 0;
      return production.value.productionCost || 0;
    });
    const costPerBottle = computed(() => {
      if (!production.value) return 0;
      return production.value.bottleCost || 0;
    });
    const bottleProduct = computed(() => {
      if (!production.value?.bottle) return null;
      return bottleStore.getBottleById(production.value.bottle);
    });
    const bottleCount = computed(() => {
      return stage.value?.bottleCount || production.value?.quantity || 0;
    });
    const totalSalesValue = computed(() => {
      if (!bottleProduct.value?.price || !bottleCount.value) return null;
      return bottleCount.value * bottleProduct.value.price;
    });
    const profitMargin = computed(() => {
      if (totalSalesValue.value == null || !totalCost.value) return null;
      return totalSalesValue.value - totalCost.value;
    });
    const local = ref({
      bottleCount: stage.value?.bottleCount,
      bottleSize: stage.value?.bottleSize || "",
      lotNumber: stage.value?.lotNumber || "",
      labeledAbv: stage.value?.labeledAbv,
      notes: stage.value?.notes || ""
    });
    const saving = ref(false);
    const save = async () => {
      saving.value = true;
      try {
        await batchStore.updateStageData(props.batch._id, "Bottled", {
          bottleCount: local.value.bottleCount,
          bottleSize: local.value.bottleSize,
          lotNumber: local.value.lotNumber,
          labeledAbv: local.value.labeledAbv,
          notes: local.value.notes
        });
      } finally {
        saving.value = false;
      }
    };
    const creatingProduction = ref(false);
    const createProductionRecord = async () => {
      creatingProduction.value = true;
      try {
        const batchVesselIds = vesselStore.vessels.filter(
          (v) => (v.type.toLowerCase() === "barrel" || v.type.toLowerCase() === "tank") && v.contents?.some((c) => c.batch === props.batch._id)
        ).map((v) => v._id);
        productionStore.resetProduction();
        productionStore.production.date = /* @__PURE__ */ new Date();
        productionStore.production.vessel = batchVesselIds;
        const panel = overlay.create(LazyPanelProduction);
        const result = await panel.open({
          prefill: {
            batchId: props.batch._id,
            vessels: batchVesselIds,
            date: /* @__PURE__ */ new Date()
          }
        });
        if (result && typeof result === "string") {
          toast.add({
            title: "Production linked",
            description: "The bottling run has been recorded and linked to this batch.",
            color: "success",
            icon: "i-lucide-link"
          });
        }
      } finally {
        creatingProduction.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_UButton = _sfc_main$8$1;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UInput = _sfc_main$m;
      const _component_UTextarea = _sfc_main$n;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-green-500/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-wine",
        class: "text-lg text-green-400"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Bottled</h3></div>`);
      if (!unref(production) && __props.editing) {
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-plus",
          size: "sm",
          variant: "soft",
          color: "success",
          loading: unref(creatingProduction),
          onClick: createProductionRecord
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Record Bottling Run `);
            } else {
              return [
                createTextVNode(" Record Bottling Run ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(production)) {
        _push(`<div class="mb-5 p-4 rounded-lg border border-green-500/20 bg-green-500/5"><div class="flex items-center justify-between mb-3"><div class="text-xs font-semibold text-parchment/60 uppercase">Linked Production Record</div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/admin/production/${unref(production)._id}`,
          class: "text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span${_scopeId}>View Details</span>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-external-link",
                class: "w-3 h-3"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode("span", null, "View Details"),
                createVNode(_component_UIcon, {
                  name: "i-lucide-external-link",
                  class: "w-3 h-3"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="grid grid-cols-2 sm:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(prodDate))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle</div>`);
        if (unref(production).bottle) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/bottles/${unref(production).bottle}`,
            class: "text-sm text-gold hover:text-copper transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(bottleName))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(bottleName)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(bottleName))}</div>`);
        }
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Quantity</div><div class="text-sm text-parchment">${ssrInterpolate(unref(production).quantity)} bottles</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Total Cost</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalCost)))}</div></div></div><div class="mt-3 pt-3 border-t border-green-500/10 grid grid-cols-2 sm:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/50">Cost / Bottle</div><div class="text-sm text-copper font-medium">${ssrInterpolate(unref(costPerBottle) ? ("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(costPerBottle)) : "N/A")}</div></div><div><div class="text-xs text-parchment/50">Total Cost</div><div class="text-sm text-parchment font-medium">${ssrInterpolate(unref(totalCost) ? ("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalCost)) : "N/A")}</div></div><div><div class="text-xs text-parchment/50">Potential Sales</div><div class="${ssrRenderClass([unref(totalSalesValue) ? "text-green-400" : "text-parchment/60", "text-sm font-medium"])}">${ssrInterpolate(unref(totalSalesValue) ? ("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalSalesValue)) : "N/A")}</div>`);
        if (unref(bottleProduct)?.price) {
          _push(`<div class="text-[10px] text-parchment/60">${ssrInterpolate(unref(bottleCount))} x ${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(bottleProduct).price))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div><div class="text-xs text-parchment/50">Profit Margin</div>`);
        if (unref(profitMargin) != null) {
          _push(`<div class="${ssrRenderClass([unref(profitMargin) >= 0 ? "text-green-400" : "text-error-400", "text-sm font-semibold"])}">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(profitMargin)))}</div>`);
        } else {
          _push(`<div class="text-sm text-parchment/60">N/A</div>`);
        }
        _push(`</div></div></div>`);
      } else if (!__props.editing) {
        _push(`<div class="mb-5 p-4 rounded-lg border border-brown/20 bg-brown/5"><div class="text-center py-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-wine-off",
          class: "text-2xl text-parchment/20 mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50 mb-3">No production record linked</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-plus",
          size: "sm",
          variant: "soft",
          color: "success",
          loading: unref(creatingProduction),
          onClick: createProductionRecord
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Record Bottling Run `);
            } else {
              return [
                createTextVNode(" Record Bottling Run ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle Count</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).bottleCount,
          "onUpdate:modelValue": ($event) => unref(local).bottleCount = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "0"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(stage)?.bottleCount || "N/A")}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle Size</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).bottleSize,
          "onUpdate:modelValue": ($event) => unref(local).bottleSize = $event,
          placeholder: "e.g. 750mL"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(stage)?.bottleSize || "N/A")}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Lot Number</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).lotNumber,
          "onUpdate:modelValue": ($event) => unref(local).lotNumber = $event,
          placeholder: "e.g. LOT-2026-001"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(stage)?.lotNumber || "N/A")}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Labeled ABV</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(local).labeledAbv,
          "onUpdate:modelValue": ($event) => unref(local).labeledAbv = $event,
          modelModifiers: { number: true },
          type: "number",
          step: "0.1",
          placeholder: "40"
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment">${ssrInterpolate(unref(stage)?.labeledAbv ? `${unref(stage).labeledAbv}%` : "N/A")}</div>`);
      }
      _push(`</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>`);
      if (__props.editing) {
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(local).notes,
          "onUpdate:modelValue": ($event) => unref(local).notes = $event,
          placeholder: "Bottling notes...",
          rows: 2
        }, null, _parent));
      } else {
        _push(`<div class="text-sm text-parchment/60">${ssrInterpolate(unref(stage)?.notes || "None")}</div>`);
      }
      _push(`</div>`);
      if (__props.editing) {
        _push(`<div class="mt-4 flex justify-end">`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: save,
          loading: unref(saving),
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save Bottled`);
            } else {
              return [
                createTextVNode("Save Bottled")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchBottled.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_9 = Object.assign(_sfc_main$7, { __name: "BatchBottled" });
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "BatchStepper",
  __ssrInlineRender: true,
  props: {
    pipeline: {},
    currentStage: {},
    stageVolumes: {},
    batchSizeUnit: {}
  },
  setup(__props) {
    const props = __props;
    const hasVolumes = computed(
      () => props.stageVolumes && Object.keys(props.stageVolumes).length > 0
    );
    computed(
      () => props.pipeline.indexOf(props.currentStage)
    );
    const displayStages = computed(() => {
      return [
        { name: "Upcoming", ...STAGE_DISPLAY["Upcoming"] },
        ...props.pipeline.map((name) => ({
          name,
          ...STAGE_DISPLAY[name] || { icon: "i-lucide-circle", color: "neutral" }
        }))
      ];
    });
    const activeIndex = computed(() => {
      if (props.currentStage === "Upcoming") return 0;
      const pipeIdx = props.pipeline.indexOf(props.currentStage);
      return pipeIdx >= 0 ? pipeIdx + 1 : -1;
    });
    const hasVolume = (stageName) => {
      if (!hasVolumes.value || !props.stageVolumes) return false;
      return (props.stageVolumes[stageName] || 0) > 0;
    };
    const volumeLabel = (stageName) => {
      if (!hasVolumes.value || !props.stageVolumes) return "";
      const vol = props.stageVolumes[stageName] || 0;
      if (vol <= 0) return "";
      const unit = (props.batchSizeUnit || "gallon").replace(/gallon/i, "gal").replace(/liter/i, "L");
      return `${vol}${unit}`;
    };
    const nodeState = (index, stageName) => {
      if (hasVolumes.value) {
        if (hasVolume(stageName)) return "active";
        if (index < activeIndex.value) return "completed";
        return "future";
      }
      if (index < activeIndex.value) return "completed";
      if (index === activeIndex.value) return "active";
      return "future";
    };
    const stageColorClasses = (color) => {
      const map = {
        blue: { bg: "bg-blue-500", ring: "ring-blue-500/40", text: "text-blue-400", line: "bg-blue-500/60" },
        orange: { bg: "bg-orange-500", ring: "ring-orange-500/40", text: "text-orange-400", line: "bg-orange-500/60" },
        yellow: { bg: "bg-yellow-500", ring: "ring-yellow-500/40", text: "text-yellow-400", line: "bg-yellow-500/60" },
        copper: { bg: "bg-copper", ring: "ring-copper/40", text: "text-copper", line: "bg-copper/60" },
        emerald: { bg: "bg-emerald-500", ring: "ring-emerald-500/40", text: "text-emerald-400", line: "bg-emerald-500/60" },
        sky: { bg: "bg-sky-500", ring: "ring-sky-500/40", text: "text-sky-400", line: "bg-sky-500/60" },
        amber: { bg: "bg-amber-500", ring: "ring-amber-500/40", text: "text-amber-400", line: "bg-amber-500/60" },
        purple: { bg: "bg-purple-500", ring: "ring-purple-500/40", text: "text-purple-400", line: "bg-purple-500/60" },
        pink: { bg: "bg-pink-500", ring: "ring-pink-500/40", text: "text-pink-400", line: "bg-pink-500/60" },
        cyan: { bg: "bg-cyan-500", ring: "ring-cyan-500/40", text: "text-cyan-400", line: "bg-cyan-500/60" },
        green: { bg: "bg-green-500", ring: "ring-green-500/40", text: "text-green-400", line: "bg-green-500/60" }
      };
      return map[color] || { bg: "bg-brown/40", ring: "ring-brown/20", text: "text-parchment/60", line: "bg-brown/30" };
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-4" }, _attrs))}><div class="flex items-center justify-between"><!--[-->`);
      ssrRenderList(unref(displayStages), (stage, index) => {
        _push(`<div class="${ssrRenderClass([index < unref(displayStages).length - 1 ? "flex-1" : "", "flex items-center"])}"><div class="flex flex-col items-center gap-1.5"><div class="${ssrRenderClass([
          "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
          nodeState(index, stage.name) === "completed" ? `${stageColorClasses(stage.color).bg} text-white` : nodeState(index, stage.name) === "active" ? `ring-2 ${stageColorClasses(stage.color).ring} ${stageColorClasses(stage.color).bg}/20 ${stageColorClasses(stage.color).text} animate-pulse` : "bg-brown/20 text-parchment/25"
        ])}">`);
        if (nodeState(index, stage.name) === "completed") {
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-check",
            class: "text-base"
          }, null, _parent));
        } else {
          _push(ssrRenderComponent(_component_UIcon, {
            name: stage.icon,
            class: "text-base"
          }, null, _parent));
        }
        _push(`</div><span class="${ssrRenderClass([
          "text-[10px] uppercase tracking-wider hidden sm:block whitespace-nowrap",
          nodeState(index, stage.name) === "completed" ? stageColorClasses(stage.color).text : nodeState(index, stage.name) === "active" ? `${stageColorClasses(stage.color).text} font-bold` : "text-parchment/25"
        ])}">${ssrInterpolate(stage.name)}</span>`);
        if (unref(hasVolumes) && hasVolume(stage.name)) {
          _push(`<span class="${ssrRenderClass([
            "text-[9px] font-semibold px-1.5 py-0.5 rounded-full hidden sm:block",
            `${stageColorClasses(stage.color).bg}/20 ${stageColorClasses(stage.color).text}`
          ])}">${ssrInterpolate(volumeLabel(stage.name))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (index < unref(displayStages).length - 1) {
          _push(`<div class="${ssrRenderClass([
            "flex-1 h-0.5 mx-2 rounded transition-all duration-300",
            index < unref(activeIndex) ? stageColorClasses(stage.color).line : "bg-brown/20 border-dashed"
          ])}"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchStepper.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_13 = Object.assign(_sfc_main$6, { __name: "BatchStepper" });
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "BatchPipelineEditor",
  __ssrInlineRender: true,
  props: {
    batch: {}
  },
  emits: ["saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const batchStore = useBatchStore();
    const toast = useToast();
    const editedPipeline = ref([...props.batch.pipeline]);
    const saving = ref(false);
    const insertAtIndex = ref(null);
    watch(() => props.batch.pipeline, (newPipeline) => {
      editedPipeline.value = [...newPipeline];
      insertAtIndex.value = null;
    });
    const insertableStages = computed(() => getAvailableStages(editedPipeline.value));
    function occurrences(stageName) {
      return editedPipeline.value.filter((s) => s === stageName).length;
    }
    function canRemove(index) {
      const stageName = editedPipeline.value[index];
      if (!stageName) return false;
      if (getStageVolume(props.batch, stageName) > 0) return false;
      const stageKey = STAGE_KEY_MAP[stageName];
      if (stageKey) {
        const stageData = props.batch.stages?.[stageKey];
        if (stageData?.startedAt && occurrences(stageName) <= 1) return false;
      }
      if (editedPipeline.value.length <= 1) return false;
      return true;
    }
    function removeTooltip(index) {
      const stageName = editedPipeline.value[index];
      if (!stageName) return void 0;
      if (getStageVolume(props.batch, stageName) > 0) return "Stage has volume — transfer first";
      const stageKey = STAGE_KEY_MAP[stageName];
      if (stageKey) {
        const stageData = props.batch.stages?.[stageKey];
        if (stageData?.startedAt && occurrences(stageName) <= 1) return "Stage has been started";
      }
      if (editedPipeline.value.length <= 1) return "Pipeline needs at least one stage";
      return void 0;
    }
    function insertStage(stageName) {
      if (insertAtIndex.value === null) return;
      editedPipeline.value.splice(insertAtIndex.value, 0, stageName);
      insertAtIndex.value = null;
    }
    function removeStage(index) {
      if (!canRemove(index)) return;
      editedPipeline.value.splice(index, 1);
    }
    const hasChanges = computed(() => {
      if (editedPipeline.value.length !== props.batch.pipeline.length) return true;
      return editedPipeline.value.some((s, i) => s !== props.batch.pipeline[i]);
    });
    const isValid = computed(() => {
      if (editedPipeline.value.length < 1) return false;
      const bottledIdx = editedPipeline.value.indexOf("Bottled");
      if (bottledIdx >= 0 && bottledIdx !== editedPipeline.value.length - 1) return false;
      return true;
    });
    async function save() {
      if (!hasChanges.value || !isValid.value) return;
      saving.value = true;
      try {
        const target = batchStore.batches.find((b) => b._id === props.batch._id);
        if (!target) throw new Error("Batch not found");
        target.pipeline = [...editedPipeline.value];
        batchStore.setBatch(target._id);
        await batchStore.updateBatch();
        toast.add({
          title: "Pipeline updated",
          description: `Pipeline now has ${editedPipeline.value.length} stages`,
          color: "success",
          icon: "i-lucide-check-circle"
        });
        emit("saved");
      } catch (error) {
        toast.add({
          title: "Failed to update pipeline",
          description: getErrorMessage(error),
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_UButton = _sfc_main$8$1;
      const _component_UTooltip = _sfc_main$s;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-5 max-h-[80vh] overflow-y-auto" }, _attrs))}><div class="flex items-center gap-2 mb-5">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-pencil-ruler",
        class: "text-lg text-gold"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Edit Pipeline</h3></div><div class="space-y-1"><div class="flex justify-center py-1">`);
      if (unref(insertAtIndex) !== 0) {
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-plus",
          variant: "ghost",
          size: "xs",
          square: "",
          class: "rounded-full border border-dashed border-brown/40 text-parchment/50 hover:border-gold/60 hover:text-gold hover:bg-gold/5 transition-all",
          onClick: ($event) => insertAtIndex.value = 0
        }, null, _parent));
      } else {
        _push(`<div class="flex flex-wrap gap-1.5 py-1"><!--[-->`);
        ssrRenderList(unref(insertableStages), (stage) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: stage,
            variant: "soft",
            size: "xs",
            label: stage,
            class: [
              unref(stageBgColor)(unref(STAGE_DISPLAY)[stage]?.color || "neutral"),
              unref(stageTextColor)(unref(STAGE_DISPLAY)[stage]?.color || "neutral"),
              "hover:opacity-80"
            ],
            onClick: ($event) => insertStage(stage)
          }, null, _parent));
        });
        _push(`<!--]-->`);
        _push(ssrRenderComponent(_component_UButton, {
          label: "Cancel",
          variant: "link",
          size: "xs",
          color: "neutral",
          onClick: ($event) => insertAtIndex.value = null
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div><!--[-->`);
      ssrRenderList(unref(editedPipeline), (stage, index) => {
        _push(`<!--[--><div class="${ssrRenderClass([
          "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all",
          unref(stageBgColor)(unref(STAGE_DISPLAY)[stage]?.color || "neutral")
        ])}">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: unref(STAGE_DISPLAY)[stage]?.icon || "i-lucide-circle",
          class: ["text-lg", unref(stageTextColor)(unref(STAGE_DISPLAY)[stage]?.color || "neutral")]
        }, null, _parent));
        _push(`<span class="text-sm font-semibold text-parchment flex-1">${ssrInterpolate(stage)} `);
        if (occurrences(stage) > 1) {
          _push(`<span class="text-xs text-parchment/60 ml-1"> (#${ssrInterpolate(unref(editedPipeline).slice(0, index + 1).filter((s) => s === stage).length)}) </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</span>`);
        if (unref(getStageVolume)(__props.batch, stage) > 0) {
          _push(`<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-brown/20 text-parchment/50"> has volume </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UTooltip, {
          text: removeTooltip(index) || "Remove stage"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-x",
                variant: "ghost",
                size: "xs",
                color: "error",
                square: "",
                disabled: !canRemove(index),
                onClick: ($event) => removeStage(index)
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  icon: "i-lucide-x",
                  variant: "ghost",
                  size: "xs",
                  color: "error",
                  square: "",
                  disabled: !canRemove(index),
                  onClick: ($event) => removeStage(index)
                }, null, 8, ["disabled", "onClick"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div><div class="flex justify-center py-1">`);
        if (unref(insertAtIndex) !== index + 1) {
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-plus",
            variant: "ghost",
            size: "xs",
            square: "",
            class: "rounded-full border border-dashed border-brown/40 text-parchment/50 hover:border-gold/60 hover:text-gold hover:bg-gold/5 transition-all",
            onClick: ($event) => insertAtIndex.value = index + 1
          }, null, _parent));
        } else {
          _push(`<div class="flex flex-wrap gap-1.5 py-1"><!--[-->`);
          ssrRenderList(unref(insertableStages), (s) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: s,
              variant: "soft",
              size: "xs",
              label: s,
              class: [
                unref(stageBgColor)(unref(STAGE_DISPLAY)[s]?.color || "neutral"),
                unref(stageTextColor)(unref(STAGE_DISPLAY)[s]?.color || "neutral"),
                "hover:opacity-80"
              ],
              onClick: ($event) => insertStage(s)
            }, null, _parent));
          });
          _push(`<!--]-->`);
          _push(ssrRenderComponent(_component_UButton, {
            label: "Cancel",
            variant: "link",
            size: "xs",
            color: "neutral",
            onClick: ($event) => insertAtIndex.value = null
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`</div><!--]-->`);
      });
      _push(`<!--]--></div><div class="flex items-center justify-between mt-5 pt-4 border-t border-brown/20"><span class="text-xs text-parchment/60">${ssrInterpolate(unref(editedPipeline).length)} stages </span><div class="flex gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        loading: unref(saving),
        disabled: !unref(hasChanges) || !unref(isValid),
        onClick: save
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Save Pipeline `);
          } else {
            return [
              createTextVNode(" Save Pipeline ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchPipelineEditor.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_15 = Object.assign(_sfc_main$5, { __name: "BatchPipelineEditor" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "BatchHeader",
  __ssrInlineRender: true,
  props: {
    batch: {},
    recipe: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const toast = useToast();
    const stageDisplay = computed(() => {
      const d = STAGE_DISPLAY[props.batch.currentStage];
      return d || { icon: "i-lucide-circle", color: "neutral" };
    });
    const statusBadge = computed(() => {
      switch (props.batch.status) {
        case "active":
          return "bg-blue-500/15 text-blue-400 border-blue-500/25";
        case "completed":
          return "bg-green-500/15 text-green-400 border-green-500/25";
        case "cancelled":
          return "bg-red-500/15 text-red-400 border-red-500/25";
        default:
          return "bg-brown/15 text-parchment/50 border-brown/25";
      }
    });
    const batchCostDisplay = computed(() => {
      if (props.batch.batchCost) return Dollar.format(props.batch.batchCost);
      return Dollar.format(0);
    });
    const recipeCostDisplay = computed(() => {
      if (props.batch.recipeCost) return Dollar.format(props.batch.recipeCost);
      if (props.recipe) return Dollar.format(recipePrice(props.recipe));
      return Dollar.format(0);
    });
    const barrelCostDisplay = computed(() => {
      if (props.batch.barrelCost != null) return Dollar.format(props.batch.barrelCost);
      return null;
    });
    const totalBatchCost = computed(() => {
      return (props.batch.batchCost || 0) + (props.batch.barrelCost || 0);
    });
    const editingBarrelCost = ref(false);
    const localBarrelCost = ref(void 0);
    const savingBarrelCost = ref(false);
    const startEditBarrelCost = () => {
      localBarrelCost.value = props.batch.barrelCost;
      editingBarrelCost.value = true;
    };
    const cancelEditBarrelCost = () => {
      editingBarrelCost.value = false;
    };
    const saveBarrelCost = async () => {
      savingBarrelCost.value = true;
      try {
        const target = batchStore.getBatchById(props.batch._id);
        if (target) {
          target.barrelCost = localBarrelCost.value;
          batchStore.setBatch(target._id);
          batchStore.batch.barrelCost = localBarrelCost.value;
          await batchStore.updateBatch();
          toast.add({ title: "Barrel cost updated", color: "success", icon: "i-lucide-check-circle" });
        }
        editingBarrelCost.value = false;
      } catch {
        toast.add({ title: "Failed to update barrel cost", color: "error", icon: "i-lucide-alert-circle" });
      } finally {
        savingBarrelCost.value = false;
      }
    };
    const isSplit = computed(() => {
      if (!hasStageVolumes(props.batch)) return false;
      const active = getActiveStages(props.batch);
      return active.length > 1;
    });
    const volumeDistribution = computed(() => {
      if (!props.batch.stageVolumes) return [];
      return Object.entries(props.batch.stageVolumes).filter(([, vol]) => vol > 0).map(([stage, vol]) => {
        const display = STAGE_DISPLAY[stage] || { icon: "i-lucide-circle", color: "neutral" };
        return { stage, volume: vol, ...display };
      });
    });
    const volumeUnit = computed(() => {
      return (props.batch.batchSizeUnit || "gallon").replace(/gallon/i, "gal").replace(/liter/i, "L");
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e$1;
      const _component_UButton = _sfc_main$8$1;
      const _component_UInput = _sfc_main$m;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4"><div><h2 class="text-2xl font-bold font-[Cormorant_Garamond]">`);
      if (__props.recipe?._id) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/admin/recipes/${__props.recipe._id}`,
          class: "text-gold hover:text-copper transition-colors"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(__props.recipe.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(__props.recipe.name), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<span class="text-parchment">Unknown Recipe</span>`);
      }
      _push(`</h2><div class="flex items-center gap-2 mt-1">`);
      if (__props.recipe?.class) {
        _push(`<span class="text-sm text-parchment/60">${ssrInterpolate(__props.recipe.class)}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.recipe?.class && __props.recipe?.type) {
        _push(`<span class="text-parchment/50">-</span>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.recipe?.type) {
        _push(`<span class="text-sm text-parchment/60">${ssrInterpolate(__props.recipe.type)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="flex items-center gap-2 shrink-0"><span class="${ssrRenderClass(["px-3 py-1 rounded-full text-xs font-semibold border", unref(statusBadge)])}">${ssrInterpolate(__props.batch.status)}</span>`);
      if (!unref(isSplit)) {
        _push(`<span class="${ssrRenderClass([unref(stageBgColor)(unref(stageDisplay).color), "px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1"])}">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: unref(stageDisplay).icon,
          class: [unref(stageTextColor)(unref(stageDisplay).color), "text-sm"]
        }, null, _parent));
        _push(` ${ssrInterpolate(__props.batch.currentStage)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(isSplit)) {
        _push(`<div class="flex flex-wrap gap-2 mb-4"><!--[-->`);
        ssrRenderList(unref(volumeDistribution), (entry) => {
          _push(`<span class="${ssrRenderClass([unref(stageBgColor)(entry.color), "px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5"])}">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: entry.icon,
            class: [unref(stageTextColor)(entry.color), "text-xs"]
          }, null, _parent));
          _push(` ${ssrInterpolate(entry.stage)}: ${ssrInterpolate(entry.volume)} ${ssrInterpolate(unref(volumeUnit))}</span>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-brown/20"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Batch Size</div><div class="text-sm text-parchment font-medium">${ssrInterpolate(__props.batch.batchSize)} ${ssrInterpolate(__props.batch.batchSizeUnit)}</div></div>`);
      if (__props.batch.batchNumber) {
        _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Batch #</div><div class="text-sm text-parchment font-medium">${ssrInterpolate(__props.batch.batchNumber)}</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Recipe Cost</div><div class="text-sm text-parchment font-medium">${ssrInterpolate(unref(recipeCostDisplay))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Ingredient Cost</div><div class="text-sm text-parchment font-medium">${ssrInterpolate(unref(batchCostDisplay))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 flex items-center gap-1"> Barrel Cost `);
      if (!unref(editingBarrelCost)) {
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          variant: "ghost",
          color: "neutral",
          icon: "i-lucide-pencil",
          class: "h-4 w-4",
          ui: { leadingIcon: "size-3" },
          onClick: startEditBarrelCost
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(editingBarrelCost)) {
        _push(`<div class="flex items-center gap-1">`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(localBarrelCost),
          "onUpdate:modelValue": ($event) => isRef(localBarrelCost) ? localBarrelCost.value = $event : null,
          modelModifiers: { number: true },
          type: "number",
          step: "0.01",
          min: "0",
          placeholder: "0.00",
          size: "xs",
          class: "w-24"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          loading: unref(savingBarrelCost),
          icon: "i-lucide-check",
          onClick: saveBarrelCost
        }, null, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          variant: "ghost",
          color: "neutral",
          icon: "i-lucide-x",
          onClick: cancelEditBarrelCost
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="text-sm text-parchment font-medium">${ssrInterpolate(unref(barrelCostDisplay) || "--")}</div>`);
      }
      _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Total Cost</div><div class="text-sm text-gold font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalBatchCost)))}</div></div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchHeader.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_16 = Object.assign(_sfc_main$4, { __name: "BatchHeader" });
const LazyModalBarrelFill = defineAsyncComponent(() => import('./ModalBarrelFill-DET9t9-X.mjs').then((r) => r["default"] || r.default || r));
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "BatchAdvanceAction",
  __ssrInlineRender: true,
  props: {
    batch: {},
    sourceStage: {}
  },
  emits: ["advanced"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const batchStore = useBatchStore();
    const vesselStore = useVesselStore();
    const productionStore = useProductionStore();
    const bulkSpiritStore = useBulkSpiritStore();
    const overlay = useOverlay();
    const toast = useToast();
    const effectiveSource = computed(() => props.sourceStage || props.batch.currentStage);
    const nextStage = computed(() => {
      if (effectiveSource.value === "Upcoming") {
        return props.batch.pipeline[0] || null;
      }
      return getNextStage(props.batch.pipeline, effectiveSource.value);
    });
    const nextDisplay = computed(() => {
      if (!nextStage.value) return null;
      return STAGE_DISPLAY[nextStage.value] || { icon: "i-lucide-circle", color: "neutral" };
    });
    const stageColorClasses = computed(() => {
      if (!nextDisplay.value) return "";
      const color = nextDisplay.value.color;
      const map = {
        orange: "bg-orange-500/15 text-orange-400 border-orange-500/25 hover:bg-orange-500/25",
        yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/25",
        copper: "bg-copper/15 text-copper border-copper/25 hover:bg-copper/25",
        emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25",
        sky: "bg-sky-500/15 text-sky-400 border-sky-500/25 hover:bg-sky-500/25",
        amber: "bg-amber-500/15 text-amber border-amber/25 hover:bg-amber/25",
        purple: "bg-purple-500/15 text-purple-400 border-purple-500/25 hover:bg-purple-500/25",
        pink: "bg-pink-500/15 text-pink-400 border-pink-500/25 hover:bg-pink-500/25",
        cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25 hover:bg-cyan-500/25",
        green: "bg-green-500/15 text-green-400 border-green-500/25 hover:bg-green-500/25"
      };
      return map[color] || "bg-brown/15 text-parchment/50 border-brown/25";
    });
    const showModal = ref(false);
    const selectedVessel = ref("");
    const selectedSourceBarrel = ref("");
    const advancing = ref(false);
    const outputAbv = ref(0);
    const transferUnit = ref(props.batch.batchSizeUnit || "gallon");
    const isFromDistilling = computed(() => effectiveSource.value === "Distilling");
    const isFromBarrelAging = computed(() => effectiveSource.value === "Barrel Aging");
    const sourceBarrelOptions = computed(() => {
      if (!isFromBarrelAging.value) return [];
      return vesselStore.barrels.filter((b) => b.contents?.some((c) => c.batch === props.batch._id)).map((v) => ({ label: v.name, value: v._id }));
    });
    const sourceVolumeRaw = computed(() => getStageVolume(props.batch, effectiveSource.value));
    const batchUnit = computed(() => props.batch.batchSizeUnit || "gallon");
    const sourceVolume = computed(
      () => sourceVolumeRaw.value * convertUnitRatio(batchUnit.value, transferUnit.value)
    );
    const vesselCapacity = computed(() => {
      if (!selectedVessel.value) return Infinity;
      const vessel = vesselStore.getVesselById(selectedVessel.value);
      if (!vessel) return Infinity;
      const rawCap = getVesselRemainingCapacity(vessel);
      const capUnit = vessel.stats?.volumeUnit || "";
      return rawCap * convertUnitRatio(capUnit, transferUnit.value);
    });
    const maxTransfer = computed(() => {
      const src = sourceVolume.value;
      const cap = vesselCapacity.value;
      return Math.min(src, cap === Infinity ? src : cap);
    });
    const transferVolume = ref(0);
    watch(showModal, (open) => {
      if (open) {
        selectedSourceBarrel.value = "";
        if (isFromDistilling.value) {
          transferVolume.value = 0;
          outputAbv.value = 0;
        } else {
          transferVolume.value = maxTransfer.value;
        }
        if (isFromBarrelAging.value && sourceBarrelOptions.value.length === 1) {
          selectedSourceBarrel.value = sourceBarrelOptions.value[0].value;
        }
      }
    });
    watch(selectedVessel, () => {
      if (transferVolume.value > maxTransfer.value) {
        transferVolume.value = maxTransfer.value;
      }
    });
    const volumeUnit = computed(() => {
      const unit = transferUnit.value;
      return unit.replace(/gallon/i, "gal").replace(/liter/i, "L");
    });
    const vesselOptions = computed(() => {
      if (!nextStage.value) return [];
      const vesselType = STAGE_VESSEL_TYPE[nextStage.value];
      if (!vesselType) return [];
      switch (vesselType) {
        case "Mash Tun":
          return vesselStore.mashTuns.map((v) => ({ label: v.name, value: v._id }));
        case "Fermenter":
          return vesselStore.fermenters.map((v) => ({ label: v.name, value: v._id }));
        case "Still":
          return vesselStore.stills.map((v) => ({ label: v.name, value: v._id }));
        case "Tank":
          return vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }));
        case "Barrel":
          return vesselStore.emptyBarrels.map((v) => ({ label: v.name, value: v._id }));
        default:
          return [];
      }
    });
    const needsVessel = computed(() => {
      if (!nextStage.value) return false;
      if (nextStage.value === "Distilling") return false;
      if (nextStage.value === "Barrel Aging") return false;
      if (nextStage.value === "Bottled") return false;
      return !!STAGE_VESSEL_TYPE[nextStage.value];
    });
    const isBottledAdvance = computed(
      () => nextStage.value === "Bottled"
    );
    const isDistillingAdvance = computed(
      () => nextStage.value === "Distilling"
    );
    const isBarrelAgingAdvance = computed(
      () => nextStage.value === "Barrel Aging"
    );
    const handleClick = async () => {
      if (isDistillingAdvance.value) {
        await advanceToDistilling();
      } else if (isBarrelAgingAdvance.value) {
        await advanceToBarrelAging();
      } else {
        showModal.value = true;
      }
    };
    const advanceToDistilling = async () => {
      const sourceVesselId = getCurrentVesselId();
      const chargeModal = overlay.create(LazyModalDistillingCharge);
      const result = await chargeModal.open({
        batchId: props.batch._id,
        sourceVesselId,
        isFirstRun: true
      });
      if (!result) return;
      advancing.value = true;
      try {
        const sourceVessels = result.chargeSourceVessels || (result.chargeSourceVessel ? [result.chargeSourceVessel] : []);
        if (result.chargeVolume > 0 && sourceVessels.length > 0) {
          for (const vesselId of sourceVessels) {
            const vessel = vesselStore.getVesselById(vesselId);
            const entry = vessel?.contents?.find((c) => c.batch === props.batch._id);
            if (!entry || entry.volume <= 0) continue;
            await vesselStore.transferBatchContents(
              vesselId,
              result.stillId,
              props.batch._id,
              entry.volume,
              entry.volumeUnit
            );
          }
        }
        for (const addition of result.additions) {
          if (addition.sourceVessel && (addition.volume || 0) > 0) {
            await vesselStore.transferBatch(addition.sourceVessel, result.stillId, {
              volume: addition.volume,
              volumeUnit: addition.volumeUnit || "gallon",
              abv: addition.abv || 0,
              value: 0
            });
          }
        }
        const vol = result.chargeVolume || sourceVolume.value;
        await batchStore.advanceToStage(
          props.batch._id,
          "Distilling",
          { vessel: result.stillId },
          vol,
          effectiveSource.value
        );
        const firstRun = {
          runType: result.runType,
          date: /* @__PURE__ */ new Date(),
          chargeVolume: result.chargeVolume,
          chargeVolumeUnit: result.chargeVolumeUnit,
          chargeAbv: result.chargeAbv,
          chargeSourceVessel: sourceVessels[0] || "",
          chargeSourceVessels: sourceVessels,
          additions: result.additions.length > 0 ? result.additions : void 0
        };
        if (result.runType === "stripping") {
          firstRun.output = { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0, proofGallons: void 0 };
        } else {
          firstRun.collected = {
            foreshots: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
            heads: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
            hearts: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 },
            tails: { vessel: "", volume: void 0, volumeUnit: "gallon", abv: void 0 }
          };
        }
        await batchStore.addDistillingRun(props.batch._id, firstRun);
        emit("advanced");
      } catch (error) {
        toast.add({
          title: "Failed to advance to Distilling",
          description: getErrorMessage(error),
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        advancing.value = false;
      }
    };
    const advanceToBarrelAging = async () => {
      let sourceAbv = 0;
      const storageStage = props.batch.stages?.storage;
      if (storageStage?.abv) {
        sourceAbv = storageStage.abv;
      } else {
        const sourceVesselId = getCurrentVesselId();
        if (sourceVesselId) {
          const vessel = vesselStore.getVesselById(sourceVesselId);
          const entry = vessel?.contents?.find((c) => c.batch === props.batch._id);
          if (entry?.abv) sourceAbv = entry.abv;
        }
      }
      const barrelFillModal = overlay.create(LazyModalBarrelFill);
      const result = await barrelFillModal.open({
        batchId: props.batch._id,
        sourceVolume: sourceVolumeRaw.value,
        sourceVolumeUnit: batchUnit.value,
        sourceAbv
      });
      if (!result) return;
      advancing.value = true;
      try {
        const totalFillCost = props.batch.recipeCost || 0;
        const sourceVessels = vesselStore.vessels.filter(
          (v) => v.contents?.some((c) => c.batch === props.batch._id)
        );
        for (const vessel of sourceVessels) {
          vessel.contents = (vessel.contents || []).filter((c) => c.batch !== props.batch._id);
          vesselStore.vessel = vessel;
          await vesselStore.updateVessel();
        }
        const totalBarrelVolume = result.barrels.reduce((sum, b) => {
          return sum + b.volume * convertUnitRatio(b.volumeUnit, batchUnit.value);
        }, 0);
        for (const barrel of result.barrels) {
          const barrelVolInBatchUnit = barrel.volume * convertUnitRatio(barrel.volumeUnit, batchUnit.value);
          const proportion = totalBarrelVolume > 0 ? barrelVolInBatchUnit / totalBarrelVolume : 0;
          await vesselStore.addContents(barrel.barrelId, {
            batch: props.batch._id,
            volume: barrel.volume,
            volumeUnit: barrel.volumeUnit,
            abv: result.entryAbv,
            value: totalFillCost * proportion
          });
        }
        await batchStore.advanceToStage(
          props.batch._id,
          "Barrel Aging",
          { vessel: result.barrels[0]?.barrelId },
          sourceVolumeRaw.value,
          // Deduct full source volume
          effectiveSource.value,
          totalBarrelVolume
          // Add actual barrel volume (may differ if proofed)
        );
        await batchStore.updateStageData(props.batch._id, "Barrel Aging", {
          entry: {
            date: /* @__PURE__ */ new Date(),
            volume: totalBarrelVolume,
            volumeUnit: batchUnit.value,
            abv: result.entryAbv,
            proofGallons: totalBarrelVolume && result.entryAbv ? calculateProofGallons(totalBarrelVolume, batchUnit.value, result.entryAbv) : void 0
          }
        }, `Filled ${result.barrels.length} barrel${result.barrels.length > 1 ? "s" : ""} at ${result.entryAbv}% ABV${result.waterAdded > 0 ? `, proofed with ${result.waterAdded.toFixed(1)} ${result.waterAddedUnit} water` : ""}`);
        toast.add({
          title: `Filled ${result.barrels.length} barrel${result.barrels.length > 1 ? "s" : ""}`,
          description: `${totalBarrelVolume.toFixed(1)} ${batchUnit.value} at ${result.entryAbv}% ABV`,
          color: "success",
          icon: "i-lucide-cylinder"
        });
        emit("advanced");
      } catch (error) {
        toast.add({
          title: "Failed to fill barrels",
          description: getErrorMessage(error),
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        advancing.value = false;
      }
    };
    const openProductionPanel = async () => {
      const batchVesselIds = vesselStore.vessels.filter(
        (v) => (v.type.toLowerCase() === "barrel" || v.type.toLowerCase() === "tank") && v.contents?.some((c) => c.batch === props.batch._id)
      ).map((v) => v._id);
      productionStore.resetProduction();
      productionStore.production.date = /* @__PURE__ */ new Date();
      productionStore.production.vessel = batchVesselIds;
      const panel = overlay.create(LazyPanelProduction);
      const result = await panel.open({
        prefill: {
          batchId: props.batch._id,
          vessels: batchVesselIds,
          date: /* @__PURE__ */ new Date()
        }
      });
      if (result && typeof result === "string") {
        toast.add({
          title: "Production linked to batch",
          description: "The bottling run has been recorded and linked.",
          color: "success",
          icon: "i-lucide-link"
        });
      }
      emit("advanced");
    };
    const advance = async () => {
      if (!nextStage.value) return;
      advancing.value = true;
      try {
        const stageName = nextStage.value;
        const vol = transferVolume.value;
        const volInBatchUnit = vol * convertUnitRatio(transferUnit.value, batchUnit.value);
        if (effectiveSource.value === "Upcoming") {
          await batchStore.startFirstStage(props.batch._id, selectedVessel.value, volInBatchUnit);
        } else if (isFromDistilling.value) {
          const currentVessel = getCurrentVesselId();
          let chargeValue = 0;
          if (currentVessel) {
            const still = vesselStore.getVesselById(currentVessel);
            if (still) {
              const stillEntry = still.contents?.find((c) => c.batch === props.batch._id);
              chargeValue = stillEntry?.value || 0;
              still.contents = (still.contents || []).filter((c) => c.batch !== props.batch._id);
              vesselStore.vessel = still;
              await vesselStore.updateVessel();
            }
          }
          if (selectedVessel.value) {
            await vesselStore.addContents(selectedVessel.value, {
              batch: props.batch._id,
              volume: vol,
              volumeUnit: transferUnit.value,
              abv: outputAbv.value,
              value: chargeValue
            });
          }
          const stageData = {};
          if (selectedVessel.value) stageData.vessel = selectedVessel.value;
          const sourceVolInBatchUnit = sourceVolumeRaw.value;
          await batchStore.advanceToStage(
            props.batch._id,
            stageName,
            stageData,
            sourceVolInBatchUnit,
            // Deduct full still charge from Distilling (in batch units)
            effectiveSource.value,
            volInBatchUnit
            // Only add distillate output to destination (in batch units)
          );
        } else {
          const currentVesselId = isFromBarrelAging.value && selectedSourceBarrel.value ? selectedSourceBarrel.value : getCurrentVesselId();
          const sourceVessel = currentVesselId ? vesselStore.getVesselById(currentVesselId) : null;
          const sourceHasContents = sourceVessel?.contents?.some((c) => c.batch === props.batch._id) ?? false;
          if (sourceHasContents && selectedVessel.value && currentVesselId !== selectedVessel.value) {
            await vesselStore.transferBatchContents(
              currentVesselId,
              selectedVessel.value,
              props.batch._id,
              vol,
              transferUnit.value
            );
          } else if (!sourceHasContents && selectedVessel.value) {
            const sourceKey = STAGE_KEY_MAP[effectiveSource.value];
            const sourceStageData = sourceKey ? props.batch.stages?.[sourceKey] : null;
            const abv = sourceStageData?.exit?.abv || sourceStageData?.entry?.abv || sourceStageData?.abv || 0;
            const batchCostValue = (props.batch.recipeCost || 0) + (props.batch.barrelCost || 0);
            await vesselStore.addContents(selectedVessel.value, {
              batch: props.batch._id,
              volume: vol,
              volumeUnit: transferUnit.value,
              abv,
              value: batchCostValue
            });
          }
          const stageData = {};
          if (selectedVessel.value) stageData.vessel = selectedVessel.value;
          await batchStore.advanceToStage(props.batch._id, stageName, stageData, volInBatchUnit, effectiveSource.value);
        }
        showModal.value = false;
        selectedVessel.value = "";
        selectedSourceBarrel.value = "";
        if (stageName === "Bottled") {
          advancing.value = false;
          await openProductionPanel();
          return;
        }
        emit("advanced");
      } finally {
        advancing.value = false;
      }
    };
    const getCurrentVesselId = () => {
      const stageKey = STAGE_KEY_MAP[effectiveSource.value];
      if (!stageKey) return void 0;
      const stageData = props.batch.stages?.[stageKey];
      return stageData?.vessel;
    };
    const isTerminalStorage = computed(
      () => !nextStage.value && effectiveSource.value === "Storage" && props.batch.status === "active"
    );
    const showBulkStorageModal = ref(false);
    const selectedBulkSpirit = ref("");
    const completingToBulk = ref(false);
    const bulkSpiritOptions = computed(
      () => bulkSpiritStore.activeBulkSpirits.map((bs) => ({ label: `${bs.name} (${bs.volume.toFixed(1)} ${bs.volumeUnit})`, value: bs._id }))
    );
    const storageStageData = computed(() => {
      const stageData = props.batch.stages?.storage;
      return stageData || {};
    });
    const completeToBulkStorage = async () => {
      if (!selectedBulkSpirit.value) return;
      completingToBulk.value = true;
      try {
        const stageData = storageStageData.value;
        const volume = stageData.volume || getStageVolume(props.batch, "Storage");
        const volumeUnit2 = stageData.volumeUnit || props.batch.batchSizeUnit || "gallon";
        const abv = stageData.abv || 0;
        const currentVesselId = getCurrentVesselId();
        let value = 0;
        if (currentVesselId) {
          const vessel = vesselStore.getVesselById(currentVesselId);
          const entry = vessel?.contents?.find((c) => c.batch === props.batch._id);
          value = entry?.value || 0;
        }
        if (!value) {
          value = props.batch.batchCost || props.batch.recipeCost || 0;
        }
        await bulkSpiritStore.deposit(selectedBulkSpirit.value, {
          batchId: props.batch._id,
          volume,
          volumeUnit: volumeUnit2,
          abv,
          value
        });
        if (currentVesselId) {
          const vessel = vesselStore.getVesselById(currentVesselId);
          if (vessel) {
            vessel.contents = (vessel.contents || []).filter((c) => c.batch !== props.batch._id);
            vesselStore.vessel = vessel;
            await vesselStore.updateVessel();
          }
        }
        const target = batchStore.getBatchById(props.batch._id);
        if (target) {
          target.status = "completed";
          if (target.stageVolumes) {
            delete target.stageVolumes["Storage"];
          }
          if (target.stages?.storage) {
            target.stages.storage.completedAt = /* @__PURE__ */ new Date();
          }
          batchStore.batch = target;
          await batchStore.updateBatch();
        }
        showBulkStorageModal.value = false;
        selectedBulkSpirit.value = "";
        toast.add({
          title: "Batch completed to bulk storage",
          description: `${volume.toFixed(1)} ${volumeUnit2} deposited`,
          color: "success",
          icon: "i-lucide-archive"
        });
        emit("advanced");
      } catch (error) {
        toast.add({
          title: "Failed to complete to bulk storage",
          description: getErrorMessage(error),
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        completingToBulk.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8$1;
      const _component_UModal = _sfc_main$l;
      const _component_UIcon = _sfc_main$e$1;
      const _component_USelectMenu = _sfc_main$t;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UInput = _sfc_main$m;
      const _component_USelect = _sfc_main$o;
      _push(`<!--[-->`);
      if (unref(isTerminalStorage)) {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-archive",
          class: "border font-semibold bg-purple-500/15 text-purple-400 border-purple-500/25 hover:bg-purple-500/25",
          size: "lg",
          variant: "ghost",
          onClick: ($event) => showBulkStorageModal.value = true
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Complete to Bulk Storage `);
            } else {
              return [
                createTextVNode(" Complete to Bulk Storage ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UModal, {
          open: unref(showBulkStorageModal),
          "onUpdate:open": ($event) => isRef(showBulkStorageModal) ? showBulkStorageModal.value = $event : null
        }, {
          content: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="p-5"${_scopeId}><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"${_scopeId}> Complete to Bulk Storage </h3><div class="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2 mb-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-info",
                class: "text-purple-400 shrink-0"
              }, null, _parent2, _scopeId));
              _push2(`<span class="text-xs text-parchment/70"${_scopeId}> This will mark the batch as completed and deposit its contents into a bulk spirit entry for use in future batches. </span></div><div class="grid grid-cols-2 gap-3 text-sm mb-4 rounded-lg border border-brown/30 p-3"${_scopeId}><div${_scopeId}><span class="text-parchment/50"${_scopeId}>Volume:</span><span class="text-parchment ml-1"${_scopeId}>${ssrInterpolate((unref(storageStageData).volume || unref(getStageVolume)(__props.batch, "Storage")).toFixed(1))} ${ssrInterpolate(unref(storageStageData).volumeUnit || __props.batch.batchSizeUnit)}</span></div><div${_scopeId}><span class="text-parchment/50"${_scopeId}>ABV:</span><span class="text-parchment ml-1"${_scopeId}>${ssrInterpolate((unref(storageStageData).abv || 0).toFixed(1))}%</span></div></div><div class="mb-4"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Select Bulk Spirit</div>`);
              _push2(ssrRenderComponent(_component_USelectMenu, {
                modelValue: unref(selectedBulkSpirit),
                "onUpdate:modelValue": ($event) => isRef(selectedBulkSpirit) ? selectedBulkSpirit.value = $event : null,
                items: unref(bulkSpiritOptions),
                "value-key": "value",
                placeholder: "Choose bulk spirit entry..."
              }, null, _parent2, _scopeId));
              _push2(`<div class="text-xs text-parchment/50 mt-1"${_scopeId}> Create a new entry on the `);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/admin/bulk-spirits",
                class: "text-gold hover:text-copper"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Bulk Spirits`);
                  } else {
                    return [
                      createTextVNode("Bulk Spirits")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(` page first if needed. </div></div><div class="flex justify-end gap-2 mt-6"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UButton, {
                variant: "outline",
                color: "neutral",
                onClick: ($event) => showBulkStorageModal.value = false
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Cancel`);
                  } else {
                    return [
                      createTextVNode("Cancel")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                onClick: completeToBulkStorage,
                loading: unref(completingToBulk),
                disabled: !unref(selectedBulkSpirit),
                icon: "i-lucide-archive"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Complete &amp; Deposit `);
                  } else {
                    return [
                      createTextVNode(" Complete & Deposit ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></div>`);
            } else {
              return [
                createVNode("div", { class: "p-5" }, [
                  createVNode("h3", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4" }, " Complete to Bulk Storage "),
                  createVNode("div", { class: "flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2 mb-4" }, [
                    createVNode(_component_UIcon, {
                      name: "i-lucide-info",
                      class: "text-purple-400 shrink-0"
                    }),
                    createVNode("span", { class: "text-xs text-parchment/70" }, " This will mark the batch as completed and deposit its contents into a bulk spirit entry for use in future batches. ")
                  ]),
                  createVNode("div", { class: "grid grid-cols-2 gap-3 text-sm mb-4 rounded-lg border border-brown/30 p-3" }, [
                    createVNode("div", null, [
                      createVNode("span", { class: "text-parchment/50" }, "Volume:"),
                      createVNode("span", { class: "text-parchment ml-1" }, toDisplayString((unref(storageStageData).volume || unref(getStageVolume)(__props.batch, "Storage")).toFixed(1)) + " " + toDisplayString(unref(storageStageData).volumeUnit || __props.batch.batchSizeUnit), 1)
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-parchment/50" }, "ABV:"),
                      createVNode("span", { class: "text-parchment ml-1" }, toDisplayString((unref(storageStageData).abv || 0).toFixed(1)) + "%", 1)
                    ])
                  ]),
                  createVNode("div", { class: "mb-4" }, [
                    createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Select Bulk Spirit"),
                    createVNode(_component_USelectMenu, {
                      modelValue: unref(selectedBulkSpirit),
                      "onUpdate:modelValue": ($event) => isRef(selectedBulkSpirit) ? selectedBulkSpirit.value = $event : null,
                      items: unref(bulkSpiritOptions),
                      "value-key": "value",
                      placeholder: "Choose bulk spirit entry..."
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                    createVNode("div", { class: "text-xs text-parchment/50 mt-1" }, [
                      createTextVNode(" Create a new entry on the "),
                      createVNode(_component_NuxtLink, {
                        to: "/admin/bulk-spirits",
                        class: "text-gold hover:text-copper"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Bulk Spirits")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" page first if needed. ")
                    ])
                  ]),
                  createVNode("div", { class: "flex justify-end gap-2 mt-6" }, [
                    createVNode(_component_UButton, {
                      variant: "outline",
                      color: "neutral",
                      onClick: ($event) => showBulkStorageModal.value = false
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Cancel")
                      ]),
                      _: 1
                    }, 8, ["onClick"]),
                    createVNode(_component_UButton, {
                      onClick: completeToBulkStorage,
                      loading: unref(completingToBulk),
                      disabled: !unref(selectedBulkSpirit),
                      icon: "i-lucide-archive"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Complete & Deposit ")
                      ]),
                      _: 1
                    }, 8, ["loading", "disabled"])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(nextStage) && unref(nextDisplay)) {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: unref(nextDisplay).icon,
          class: ["border font-semibold", unref(stageColorClasses)],
          size: "lg",
          variant: "ghost",
          loading: unref(advancing) && (unref(isDistillingAdvance) || unref(isBarrelAgingAdvance)),
          onClick: handleClick
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Transfer to ${ssrInterpolate(unref(nextStage))} `);
              if (__props.sourceStage) {
                _push2(`<span class="text-xs opacity-70 ml-1"${_scopeId}>(from ${ssrInterpolate(__props.sourceStage)})</span>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createTextVNode(" Transfer to " + toDisplayString(unref(nextStage)) + " ", 1),
                __props.sourceStage ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-xs opacity-70 ml-1"
                }, "(from " + toDisplayString(__props.sourceStage) + ")", 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UModal, {
          open: unref(showModal),
          "onUpdate:open": ($event) => isRef(showModal) ? showModal.value = $event : null
        }, {
          content: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="p-5"${_scopeId}><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"${_scopeId}> Transfer to ${ssrInterpolate(unref(nextStage))}</h3>`);
              if (unref(isBottledAdvance) && !unref(isFromDistilling)) {
                _push2(`<div class="mb-4"${_scopeId}><div class="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 mb-4"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-info",
                  class: "text-green-400 shrink-0"
                }, null, _parent2, _scopeId));
                _push2(`<span class="text-xs text-parchment/70"${_scopeId}> After transferring to Bottled, a production recording form will open automatically so you can capture the bottling details. </span></div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Transfer Volume</div><div class="flex items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: unref(transferVolume),
                  "onUpdate:modelValue": ($event) => isRef(transferVolume) ? transferVolume.value = $event : null,
                  modelModifiers: { number: true },
                  type: "number",
                  min: 1,
                  max: unref(maxTransfer),
                  class: "flex-1"
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_USelect, {
                  modelValue: unref(transferUnit),
                  "onUpdate:modelValue": ($event) => isRef(transferUnit) ? transferUnit.value = $event : null,
                  items: unref(volumeUnits),
                  class: "w-28"
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UButton, {
                  size: "xs",
                  variant: "outline",
                  color: "neutral",
                  onClick: ($event) => transferVolume.value = unref(maxTransfer)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Max `);
                    } else {
                      return [
                        createTextVNode(" Max ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div><div class="text-xs text-parchment/50 mt-1"${_scopeId}>${ssrInterpolate(unref(sourceVolume).toFixed(1))} ${ssrInterpolate(unref(volumeUnit))} available </div></div>`);
              } else if (unref(isFromDistilling)) {
                _push2(`<!--[-->`);
                if (unref(isBottledAdvance)) {
                  _push2(`<div class="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 mb-4"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "i-lucide-info",
                    class: "text-green-400 shrink-0"
                  }, null, _parent2, _scopeId));
                  _push2(`<span class="text-xs text-parchment/70"${_scopeId}> After transferring, a production recording form will open automatically. </span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="mb-4"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Distillate Output Volume</div><div class="flex items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: unref(transferVolume),
                  "onUpdate:modelValue": ($event) => isRef(transferVolume) ? transferVolume.value = $event : null,
                  modelModifiers: { number: true },
                  type: "number",
                  min: 0,
                  step: 0.1,
                  class: "flex-1"
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_USelect, {
                  modelValue: unref(transferUnit),
                  "onUpdate:modelValue": ($event) => isRef(transferUnit) ? transferUnit.value = $event : null,
                  items: unref(volumeUnits),
                  class: "w-28"
                }, null, _parent2, _scopeId));
                _push2(`</div><div class="text-xs text-parchment/50 mt-1"${_scopeId}> Still charge: ${ssrInterpolate(unref(sourceVolume).toFixed(1))} ${ssrInterpolate(unref(volumeUnit))} (will be emptied) </div></div><div class="mb-4"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Distillate ABV (%)</div>`);
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: unref(outputAbv),
                  "onUpdate:modelValue": ($event) => isRef(outputAbv) ? outputAbv.value = $event : null,
                  modelModifiers: { number: true },
                  type: "number",
                  min: 0,
                  max: 100,
                  step: 0.1,
                  placeholder: "0.0"
                }, null, _parent2, _scopeId));
                _push2(`</div><!--]-->`);
              } else {
                _push2(`<div class="mb-4"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Transfer Volume</div><div class="flex items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: unref(transferVolume),
                  "onUpdate:modelValue": ($event) => isRef(transferVolume) ? transferVolume.value = $event : null,
                  modelModifiers: { number: true },
                  type: "number",
                  min: 1,
                  max: unref(maxTransfer),
                  class: "flex-1"
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_USelect, {
                  modelValue: unref(transferUnit),
                  "onUpdate:modelValue": ($event) => isRef(transferUnit) ? transferUnit.value = $event : null,
                  items: unref(volumeUnits),
                  class: "w-28"
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UButton, {
                  size: "xs",
                  variant: "outline",
                  color: "neutral",
                  onClick: ($event) => transferVolume.value = unref(maxTransfer)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Max `);
                    } else {
                      return [
                        createTextVNode(" Max ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div><div class="text-xs text-parchment/50 mt-1"${_scopeId}>${ssrInterpolate(unref(sourceVolume).toFixed(1))} ${ssrInterpolate(unref(volumeUnit))} available `);
                if (unref(selectedVessel) && unref(vesselCapacity) !== Infinity) {
                  _push2(`<!--[--> · ${ssrInterpolate(unref(vesselCapacity).toFixed(0))} ${ssrInterpolate(unref(volumeUnit))} vessel capacity <!--]-->`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div>`);
              }
              if (unref(isFromBarrelAging) && unref(sourceBarrelOptions).length > 0) {
                _push2(`<div class="mb-4"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Source Barrel</div>`);
                _push2(ssrRenderComponent(_component_USelect, {
                  modelValue: unref(selectedSourceBarrel),
                  "onUpdate:modelValue": ($event) => isRef(selectedSourceBarrel) ? selectedSourceBarrel.value = $event : null,
                  items: unref(sourceBarrelOptions),
                  "value-key": "value",
                  "label-key": "label",
                  placeholder: "Choose source barrel..."
                }, null, _parent2, _scopeId));
                if (unref(sourceBarrelOptions).length > 1) {
                  _push2(`<div class="text-xs text-parchment/50 mt-1"${_scopeId}>${ssrInterpolate(unref(sourceBarrelOptions).length)} barrels contain this batch </div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(needsVessel)) {
                _push2(`<div class="mb-4"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>${ssrInterpolate(unref(isFromBarrelAging) ? "Destination Vessel" : "Select Vessel")}</div>`);
                _push2(ssrRenderComponent(_component_USelect, {
                  modelValue: unref(selectedVessel),
                  "onUpdate:modelValue": ($event) => isRef(selectedVessel) ? selectedVessel.value = $event : null,
                  items: unref(vesselOptions),
                  "value-key": "value",
                  "label-key": "label",
                  placeholder: "Choose a vessel..."
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="flex justify-end gap-2 mt-6"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UButton, {
                variant: "outline",
                color: "neutral",
                onClick: ($event) => showModal.value = false
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Cancel`);
                  } else {
                    return [
                      createTextVNode("Cancel")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                onClick: advance,
                loading: unref(advancing),
                disabled: unref(needsVessel) && !unref(selectedVessel) || unref(isFromBarrelAging) && unref(sourceBarrelOptions).length > 0 && !unref(selectedSourceBarrel) || unref(transferVolume) <= 0
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    if (unref(isBottledAdvance)) {
                      _push3(`<!--[--> Transfer ${ssrInterpolate(unref(transferVolume))} ${ssrInterpolate(unref(volumeUnit))} &amp; Record Bottling <!--]-->`);
                    } else if (unref(isFromDistilling)) {
                      _push3(`<!--[--> Collect ${ssrInterpolate(unref(transferVolume))} ${ssrInterpolate(unref(volumeUnit))} to ${ssrInterpolate(unref(nextStage))}<!--]-->`);
                    } else {
                      _push3(`<!--[--> Transfer ${ssrInterpolate(unref(transferVolume))} ${ssrInterpolate(unref(volumeUnit))}<!--]-->`);
                    }
                  } else {
                    return [
                      unref(isBottledAdvance) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createTextVNode(" Transfer " + toDisplayString(unref(transferVolume)) + " " + toDisplayString(unref(volumeUnit)) + " & Record Bottling ", 1)
                      ], 64)) : unref(isFromDistilling) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                        createTextVNode(" Collect " + toDisplayString(unref(transferVolume)) + " " + toDisplayString(unref(volumeUnit)) + " to " + toDisplayString(unref(nextStage)), 1)
                      ], 64)) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                        createTextVNode(" Transfer " + toDisplayString(unref(transferVolume)) + " " + toDisplayString(unref(volumeUnit)), 1)
                      ], 64))
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></div>`);
            } else {
              return [
                createVNode("div", { class: "p-5" }, [
                  createVNode("h3", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4" }, " Transfer to " + toDisplayString(unref(nextStage)), 1),
                  unref(isBottledAdvance) && !unref(isFromDistilling) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "mb-4"
                  }, [
                    createVNode("div", { class: "flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 mb-4" }, [
                      createVNode(_component_UIcon, {
                        name: "i-lucide-info",
                        class: "text-green-400 shrink-0"
                      }),
                      createVNode("span", { class: "text-xs text-parchment/70" }, " After transferring to Bottled, a production recording form will open automatically so you can capture the bottling details. ")
                    ]),
                    createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Transfer Volume"),
                    createVNode("div", { class: "flex items-center gap-2" }, [
                      createVNode(_component_UInput, {
                        modelValue: unref(transferVolume),
                        "onUpdate:modelValue": ($event) => isRef(transferVolume) ? transferVolume.value = $event : null,
                        modelModifiers: { number: true },
                        type: "number",
                        min: 1,
                        max: unref(maxTransfer),
                        class: "flex-1"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "max"]),
                      createVNode(_component_USelect, {
                        modelValue: unref(transferUnit),
                        "onUpdate:modelValue": ($event) => isRef(transferUnit) ? transferUnit.value = $event : null,
                        items: unref(volumeUnits),
                        class: "w-28"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                      createVNode(_component_UButton, {
                        size: "xs",
                        variant: "outline",
                        color: "neutral",
                        onClick: ($event) => transferVolume.value = unref(maxTransfer)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Max ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    createVNode("div", { class: "text-xs text-parchment/50 mt-1" }, toDisplayString(unref(sourceVolume).toFixed(1)) + " " + toDisplayString(unref(volumeUnit)) + " available ", 1)
                  ])) : unref(isFromDistilling) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                    unref(isBottledAdvance) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 mb-4"
                    }, [
                      createVNode(_component_UIcon, {
                        name: "i-lucide-info",
                        class: "text-green-400 shrink-0"
                      }),
                      createVNode("span", { class: "text-xs text-parchment/70" }, " After transferring, a production recording form will open automatically. ")
                    ])) : createCommentVNode("", true),
                    createVNode("div", { class: "mb-4" }, [
                      createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Distillate Output Volume"),
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode(_component_UInput, {
                          modelValue: unref(transferVolume),
                          "onUpdate:modelValue": ($event) => isRef(transferVolume) ? transferVolume.value = $event : null,
                          modelModifiers: { number: true },
                          type: "number",
                          min: 0,
                          step: 0.1,
                          class: "flex-1"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(_component_USelect, {
                          modelValue: unref(transferUnit),
                          "onUpdate:modelValue": ($event) => isRef(transferUnit) ? transferUnit.value = $event : null,
                          items: unref(volumeUnits),
                          class: "w-28"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                      ]),
                      createVNode("div", { class: "text-xs text-parchment/50 mt-1" }, " Still charge: " + toDisplayString(unref(sourceVolume).toFixed(1)) + " " + toDisplayString(unref(volumeUnit)) + " (will be emptied) ", 1)
                    ]),
                    createVNode("div", { class: "mb-4" }, [
                      createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Distillate ABV (%)"),
                      createVNode(_component_UInput, {
                        modelValue: unref(outputAbv),
                        "onUpdate:modelValue": ($event) => isRef(outputAbv) ? outputAbv.value = $event : null,
                        modelModifiers: { number: true },
                        type: "number",
                        min: 0,
                        max: 100,
                        step: 0.1,
                        placeholder: "0.0"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ])
                  ], 64)) : (openBlock(), createBlock("div", {
                    key: 2,
                    class: "mb-4"
                  }, [
                    createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Transfer Volume"),
                    createVNode("div", { class: "flex items-center gap-2" }, [
                      createVNode(_component_UInput, {
                        modelValue: unref(transferVolume),
                        "onUpdate:modelValue": ($event) => isRef(transferVolume) ? transferVolume.value = $event : null,
                        modelModifiers: { number: true },
                        type: "number",
                        min: 1,
                        max: unref(maxTransfer),
                        class: "flex-1"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "max"]),
                      createVNode(_component_USelect, {
                        modelValue: unref(transferUnit),
                        "onUpdate:modelValue": ($event) => isRef(transferUnit) ? transferUnit.value = $event : null,
                        items: unref(volumeUnits),
                        class: "w-28"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                      createVNode(_component_UButton, {
                        size: "xs",
                        variant: "outline",
                        color: "neutral",
                        onClick: ($event) => transferVolume.value = unref(maxTransfer)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Max ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    createVNode("div", { class: "text-xs text-parchment/50 mt-1" }, [
                      createTextVNode(toDisplayString(unref(sourceVolume).toFixed(1)) + " " + toDisplayString(unref(volumeUnit)) + " available ", 1),
                      unref(selectedVessel) && unref(vesselCapacity) !== Infinity ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createTextVNode(" · " + toDisplayString(unref(vesselCapacity).toFixed(0)) + " " + toDisplayString(unref(volumeUnit)) + " vessel capacity ", 1)
                      ], 64)) : createCommentVNode("", true)
                    ])
                  ])),
                  unref(isFromBarrelAging) && unref(sourceBarrelOptions).length > 0 ? (openBlock(), createBlock("div", {
                    key: 3,
                    class: "mb-4"
                  }, [
                    createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Source Barrel"),
                    createVNode(_component_USelect, {
                      modelValue: unref(selectedSourceBarrel),
                      "onUpdate:modelValue": ($event) => isRef(selectedSourceBarrel) ? selectedSourceBarrel.value = $event : null,
                      items: unref(sourceBarrelOptions),
                      "value-key": "value",
                      "label-key": "label",
                      placeholder: "Choose source barrel..."
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                    unref(sourceBarrelOptions).length > 1 ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "text-xs text-parchment/50 mt-1"
                    }, toDisplayString(unref(sourceBarrelOptions).length) + " barrels contain this batch ", 1)) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true),
                  unref(needsVessel) ? (openBlock(), createBlock("div", {
                    key: 4,
                    class: "mb-4"
                  }, [
                    createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, toDisplayString(unref(isFromBarrelAging) ? "Destination Vessel" : "Select Vessel"), 1),
                    createVNode(_component_USelect, {
                      modelValue: unref(selectedVessel),
                      "onUpdate:modelValue": ($event) => isRef(selectedVessel) ? selectedVessel.value = $event : null,
                      items: unref(vesselOptions),
                      "value-key": "value",
                      "label-key": "label",
                      placeholder: "Choose a vessel..."
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                  ])) : createCommentVNode("", true),
                  createVNode("div", { class: "flex justify-end gap-2 mt-6" }, [
                    createVNode(_component_UButton, {
                      variant: "outline",
                      color: "neutral",
                      onClick: ($event) => showModal.value = false
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Cancel")
                      ]),
                      _: 1
                    }, 8, ["onClick"]),
                    createVNode(_component_UButton, {
                      onClick: advance,
                      loading: unref(advancing),
                      disabled: unref(needsVessel) && !unref(selectedVessel) || unref(isFromBarrelAging) && unref(sourceBarrelOptions).length > 0 && !unref(selectedSourceBarrel) || unref(transferVolume) <= 0
                    }, {
                      default: withCtx(() => [
                        unref(isBottledAdvance) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                          createTextVNode(" Transfer " + toDisplayString(unref(transferVolume)) + " " + toDisplayString(unref(volumeUnit)) + " & Record Bottling ", 1)
                        ], 64)) : unref(isFromDistilling) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                          createTextVNode(" Collect " + toDisplayString(unref(transferVolume)) + " " + toDisplayString(unref(volumeUnit)) + " to " + toDisplayString(unref(nextStage)), 1)
                        ], 64)) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                          createTextVNode(" Transfer " + toDisplayString(unref(transferVolume)) + " " + toDisplayString(unref(volumeUnit)), 1)
                        ], 64))
                      ]),
                      _: 1
                    }, 8, ["loading", "disabled"])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchAdvanceAction.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_17 = Object.assign(_sfc_main$3, { __name: "BatchAdvanceAction" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BatchTastingNotes",
  __ssrInlineRender: true,
  props: {
    batch: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const sortedNotes = computed(() => {
      if (!props.batch.tastingNotes?.length) return [];
      return props.batch.tastingNotes.map((note, originalIndex) => ({ ...note, originalIndex })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const newNote = reactive({
      date: today,
      abv: void 0,
      notes: ""
    });
    const saving = ref(false);
    const canSubmit = computed(() => newNote.notes.trim().length > 0);
    const submitNote = async () => {
      if (!canSubmit.value) return;
      saving.value = true;
      try {
        await batchStore.addTastingNote(props.batch._id, {
          date: newNote.date,
          abv: newNote.abv || void 0,
          notes: newNote.notes.trim()
        });
        newNote.date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        newNote.abv = void 0;
        newNote.notes = "";
      } finally {
        saving.value = false;
      }
    };
    const deletingIndex = ref(null);
    const deleteNote = async (originalIndex) => {
      deletingIndex.value = originalIndex;
      try {
        await batchStore.deleteTastingNote(props.batch._id, originalIndex);
      } finally {
        deletingIndex.value = null;
      }
    };
    function formatDate(date) {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_UFormField = _sfc_main$p;
      const _component_UInput = _sfc_main$m;
      const _component_UTextarea = _sfc_main$n;
      const _component_UButton = _sfc_main$8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center gap-2 mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-wine",
        class: "text-lg text-amber-400"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Tasting Notes</h3>`);
      if (unref(sortedNotes).length > 0) {
        _push(`<span class="text-xs text-parchment/60 ml-auto">${ssrInterpolate(unref(sortedNotes).length)} ${ssrInterpolate(unref(sortedNotes).length === 1 ? "note" : "notes")}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.batch.status === "active") {
        _push(`<div class="mb-5 bg-charcoal-light/30 rounded-lg border border-brown/20 p-4"><div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-3">`);
        _push(ssrRenderComponent(_component_UFormField, {
          label: "Date",
          name: "date"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(newNote).date,
                "onUpdate:modelValue": ($event) => unref(newNote).date = $event,
                type: "date",
                size: "sm"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(newNote).date,
                  "onUpdate:modelValue": ($event) => unref(newNote).date = $event,
                  type: "date",
                  size: "sm"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, {
          label: "Sample ABV %",
          name: "abv"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(newNote).abv,
                "onUpdate:modelValue": ($event) => unref(newNote).abv = $event,
                modelModifiers: { number: true },
                type: "number",
                placeholder: "e.g. 62.5",
                step: "0.1",
                min: "0",
                max: "100",
                size: "sm"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(newNote).abv,
                  "onUpdate:modelValue": ($event) => unref(newNote).abv = $event,
                  modelModifiers: { number: true },
                  type: "number",
                  placeholder: "e.g. 62.5",
                  step: "0.1",
                  min: "0",
                  max: "100",
                  size: "sm"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(newNote).notes,
          "onUpdate:modelValue": ($event) => unref(newNote).notes = $event,
          placeholder: "Describe the aroma, flavor, mouthfeel, finish...",
          rows: 2,
          autoresize: "",
          class: "flex-1",
          onKeydown: [submitNote, submitNote]
        }, null, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          size: "sm",
          icon: "i-lucide-plus",
          loading: unref(saving),
          disabled: !unref(canSubmit),
          class: "self-end",
          onClick: submitNote
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add `);
            } else {
              return [
                createTextVNode(" Add ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sortedNotes).length === 0) {
        _push(`<div class="text-center py-6">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-wine",
          class: "text-3xl text-parchment/15 mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">No tasting notes recorded yet</p></div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(sortedNotes), (note) => {
          _push(`<div class="group relative rounded-lg border border-brown/20 bg-charcoal-light/20 p-4"><div class="flex items-center gap-3 mb-2"><span class="text-sm font-medium text-parchment/80">${ssrInterpolate(formatDate(note.date))}</span>`);
          if (note.abv) {
            _push(`<span class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-flask-conical",
              class: "text-[10px]"
            }, null, _parent));
            _push(` ${ssrInterpolate(note.abv)}% ABV </span>`);
          } else {
            _push(`<!---->`);
          }
          if (note.addedBy) {
            _push(`<span class="text-[11px] text-parchment/60 ml-auto hidden sm:inline"> by ${ssrInterpolate(note.addedBy)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (__props.batch.status === "active") {
            _push(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-trash-2",
              size: "xs",
              variant: "ghost",
              color: "error",
              class: "opacity-0 group-hover:opacity-100 transition-opacity sm:ml-0 ml-auto",
              loading: unref(deletingIndex) === note.originalIndex,
              onClick: ($event) => deleteNote(note.originalIndex)
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div><p class="text-sm text-parchment/70 whitespace-pre-line leading-relaxed">${ssrInterpolate(note.notes)}</p></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchTastingNotes.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_19 = Object.assign(_sfc_main$2, { __name: "BatchTastingNotes" });
const INITIAL_COUNT = 10;
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BatchActivityLog",
  __ssrInlineRender: true,
  props: {
    batch: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const entries = computed(() => {
      if (!props.batch.log) return [];
      return [...props.batch.log].reverse();
    });
    const showAll = ref(false);
    const visibleEntries = computed(
      () => showAll.value ? entries.value : entries.value.slice(0, INITIAL_COUNT)
    );
    const hasMore = computed(() => entries.value.length > INITIAL_COUNT);
    const noteText = ref("");
    const savingNote = ref(false);
    const submitNote = async () => {
      const text = noteText.value.trim();
      if (!text) return;
      savingNote.value = true;
      try {
        await batchStore.addNote(props.batch._id, text);
        noteText.value = "";
      } finally {
        savingNote.value = false;
      }
    };
    function getActionMeta(action) {
      if (action.startsWith("Advanced to")) return { icon: "i-lucide-arrow-right-circle", color: "text-green-400" };
      if (action.startsWith("Started")) return { icon: "i-lucide-play-circle", color: "text-blue-400" };
      if (action === "Batch created") return { icon: "i-lucide-plus-circle", color: "text-emerald-400" };
      if (action.includes("reading")) return { icon: "i-lucide-thermometer", color: "text-yellow-400" };
      if (action.startsWith("Updated")) return { icon: "i-lucide-pencil", color: "text-amber-400" };
      if (action === "Note added") return { icon: "i-lucide-message-square", color: "text-copper" };
      return { icon: "i-lucide-info", color: "text-parchment/60" };
    }
    function formatDate(date) {
      const d = new Date(date);
      const now = /* @__PURE__ */ new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 6e4);
      const diffHours = Math.floor(diffMs / 36e5);
      const diffDays = Math.floor(diffMs / 864e5);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : void 0 });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_UTextarea = _sfc_main$n;
      const _component_UButton = _sfc_main$8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center gap-2 mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-scroll-text",
        class: "text-lg text-parchment/60"
      }, null, _parent));
      _push(`<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Activity Log</h3>`);
      if (unref(entries).length > 0) {
        _push(`<span class="text-xs text-parchment/60 ml-auto">${ssrInterpolate(unref(entries).length)} ${ssrInterpolate(unref(entries).length === 1 ? "entry" : "entries")}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.batch.status === "active") {
        _push(`<div class="mb-5"><div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_UTextarea, {
          modelValue: unref(noteText),
          "onUpdate:modelValue": ($event) => isRef(noteText) ? noteText.value = $event : null,
          placeholder: "Add a note or observation...",
          rows: 1,
          autoresize: "",
          class: "flex-1",
          onKeydown: [submitNote, submitNote]
        }, null, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          size: "sm",
          loading: unref(savingNote),
          disabled: !unref(noteText).trim(),
          class: "self-end",
          onClick: submitNote
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add Note `);
            } else {
              return [
                createTextVNode(" Add Note ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(entries).length === 0) {
        _push(`<div class="text-center py-6">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-scroll-text",
          class: "text-3xl text-parchment/15 mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">No activity recorded yet</p></div>`);
      } else {
        _push(`<div class="relative"><div class="absolute left-[11px] top-3 bottom-3 w-px bg-brown/20"></div><!--[-->`);
        ssrRenderList(unref(visibleEntries), (entry, i) => {
          _push(`<div class="relative flex gap-3 pb-4 last:pb-0"><div class="relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-charcoal border border-brown/30">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: getActionMeta(entry.action).icon,
            class: ["text-xs", getActionMeta(entry.action).color]
          }, null, _parent));
          _push(`</div><div class="flex-1 min-w-0 pt-0.5"><div class="flex items-baseline gap-2 flex-wrap"><span class="text-sm text-parchment">${ssrInterpolate(entry.action)}</span><span class="text-[10px] text-parchment/60">${ssrInterpolate(formatDate(entry.date))}</span>`);
          if (entry.user) {
            _push(`<span class="text-[10px] text-parchment/50"> by ${ssrInterpolate(entry.user)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (entry.details) {
            _push(`<div class="text-xs text-parchment/50 mt-0.5">${ssrInterpolate(entry.details)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (unref(hasMore) && !unref(showAll)) {
          _push(`<div class="relative z-10 pl-9 pt-1">`);
          _push(ssrRenderComponent(_component_UButton, {
            variant: "link",
            size: "xs",
            class: "text-gold hover:text-copper",
            label: `Show ${unref(entries).length - INITIAL_COUNT} more entries`,
            onClick: ($event) => showAll.value = true
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchActivityLog.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_20 = Object.assign(_sfc_main$1, { __name: "BatchActivityLog" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const vesselStore = useVesselStore();
    const batch = computed(() => batchStore.getBatchById(route.params._id));
    const recipe = computed(() => batch.value?.recipe ? recipeStore.getRecipeById(batch.value.recipe) : void 0);
    const containingVessels = computed(() => {
      if (!batch.value?._id) return [];
      return vesselStore.vessels.filter(
        (v) => v.contents?.some((c) => c.batch === batch.value._id)
      );
    });
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelBatch);
    const editBatch = () => {
      if (!batch.value) return;
      batchStore.setBatch(batch.value._id);
      panel.open();
    };
    const hasReached = (stageName) => {
      if (!batch.value) return false;
      if (batch.value.currentStage === "Upcoming" && !hasStageVolumes(batch.value)) return false;
      if (hasStageVolumes(batch.value)) {
        return isStageActive(batch.value, stageName) || hasReachedStage(batch.value.pipeline, batch.value.currentStage, stageName);
      }
      return hasReachedStage(batch.value.pipeline, batch.value.currentStage, stageName);
    };
    const canEdit = (stageName) => {
      if (!batch.value) return false;
      if (batch.value.status !== "active" && batch.value.status !== "completed") return false;
      return hasReached(stageName);
    };
    const editingStages = ref(/* @__PURE__ */ new Set());
    const isEditing = (stageName) => editingStages.value.has(stageName);
    const toggleEdit = (stageName) => {
      if (editingStages.value.has(stageName)) {
        editingStages.value.delete(stageName);
      } else {
        editingStages.value.add(stageName);
      }
    };
    const advancableStages = computed(() => {
      if (!batch.value || batch.value.status !== "active") return [];
      const result = [];
      if (hasStageVolumes(batch.value)) {
        const active = getActiveStages(batch.value);
        for (const stage of active) {
          if (stage === "Upcoming") {
            if (batch.value.pipeline.length > 0) result.push(stage);
          } else {
            const next = getNextStage(batch.value.pipeline, stage);
            if (next) result.push(stage);
          }
        }
      } else {
        const next = batch.value.currentStage === "Upcoming" ? batch.value.pipeline[0] : getNextStage(batch.value.pipeline, batch.value.currentStage);
        if (next) result.push(batch.value.currentStage);
      }
      if (hasStageVolumes(batch.value)) {
        const active = getActiveStages(batch.value);
        for (const stage of active) {
          if (stage === "Storage" && !getNextStage(batch.value.pipeline, stage) && !result.includes(stage)) {
            result.push(stage);
          }
        }
      }
      return result;
    });
    const barrelAgingHasBarrels = computed(() => {
      if (!batch.value?._id) return false;
      return vesselStore.vessels.some(
        (v) => v.type === "Barrel" && v.contents?.some((c) => c.batch === batch.value._id)
      );
    });
    const STAGE_COMPONENTS = {
      "Mashing": __nuxt_component_0,
      "Fermenting": __nuxt_component_1,
      "Distilling": __nuxt_component_2,
      "Maceration": __nuxt_component_3,
      "Filtering": __nuxt_component_4$1,
      "Barrel Aging": __nuxt_component_5,
      "Storage": __nuxt_component_6,
      "Blending": __nuxt_component_7,
      "Proofing": __nuxt_component_8,
      "Bottled": __nuxt_component_9
    };
    const reversedReachedStages = computed(() => {
      if (!batch.value) return [];
      return [...batch.value.pipeline].filter((s) => hasReached(s) && STAGE_COMPONENTS[s]).reverse();
    });
    const pipelineEditorOpen = ref(false);
    const reverting = ref(false);
    const confirmRevertStage = ref(null);
    const canStepBack = (stageName) => {
      if (!batch.value) return false;
      if (batch.value.status !== "active" && batch.value.status !== "completed") return false;
      if (!hasStageVolumes(batch.value)) return false;
      if (!isStageActive(batch.value, stageName)) return false;
      const prev = getPreviousStage(batch.value.pipeline, stageName);
      return !!prev;
    };
    const stepBack = async (stageName) => {
      if (!batch.value) return;
      reverting.value = true;
      try {
        await batchStore.revertToPreviousStage(batch.value._id, stageName);
      } finally {
        reverting.value = false;
        confirmRevertStage.value = null;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e$1;
      const _component_AdminPageHeader = __nuxt_component_0$1;
      const _component_UButton = _sfc_main$8$1;
      const _component_BatchStepper = __nuxt_component_13;
      const _component_UModal = _sfc_main$l;
      const _component_BatchPipelineEditor = __nuxt_component_15;
      const _component_BatchHeader = __nuxt_component_16;
      const _component_BatchAdvanceAction = __nuxt_component_17;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_BatchTastingNotes = __nuxt_component_19;
      const _component_BatchActivityLog = __nuxt_component_20;
      if (!unref(batchStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(batch)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(recipe)?.name || "Batch",
          subtitle: `${unref(batch).batchSize} ${unref(batch).batchSizeUnit} batch`,
          icon: "i-lucide-flask-conical"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/batch")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Back `);
                  } else {
                    return [
                      createTextVNode(" Back ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-pencil",
                size: "sm",
                onClick: editBatch
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Edit `);
                  } else {
                    return [
                      createTextVNode(" Edit ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  icon: "i-lucide-arrow-left",
                  variant: "outline",
                  color: "neutral",
                  size: "sm",
                  onClick: ($event) => unref(router).push("/admin/batch")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editBatch
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Edit ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="flex items-center gap-3">`);
        _push(ssrRenderComponent(_component_BatchStepper, {
          pipeline: unref(batch).pipeline,
          "current-stage": unref(batch).currentStage,
          "stage-volumes": unref(batch).stageVolumes,
          "batch-size-unit": unref(batch).batchSizeUnit,
          class: "flex-1"
        }, null, _parent));
        if (unref(batch).status === "active") {
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-pencil-ruler",
            variant: "outline",
            color: "neutral",
            size: "xs",
            onClick: ($event) => pipelineEditorOpen.value = true
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Edit Pipeline `);
              } else {
                return [
                  createTextVNode(" Edit Pipeline ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(_component_UModal, {
          open: unref(pipelineEditorOpen),
          "onUpdate:open": ($event) => isRef(pipelineEditorOpen) ? pipelineEditorOpen.value = $event : null
        }, {
          content: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_BatchPipelineEditor, {
                batch: unref(batch),
                onSaved: ($event) => pipelineEditorOpen.value = false
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_BatchPipelineEditor, {
                  batch: unref(batch),
                  onSaved: ($event) => pipelineEditorOpen.value = false
                }, null, 8, ["batch", "onSaved"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_BatchHeader, {
          batch: unref(batch),
          recipe: unref(recipe)
        }, null, _parent));
        if (unref(batch).status === "active" && unref(advancableStages).includes("Upcoming")) {
          _push(`<div class="flex justify-center">`);
          _push(ssrRenderComponent(_component_BatchAdvanceAction, {
            batch: unref(batch),
            "source-stage": "Upcoming",
            onAdvanced: () => {
            }
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(containingVessels).length > 0) {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Current Vessels</h3><div class="divide-y divide-brown/20"><!--[-->`);
          ssrRenderList(unref(containingVessels), (vessel) => {
            _push(`<div class="flex items-center justify-between py-2 text-sm">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/vessels/${vessel._id}`,
              class: "text-gold hover:text-copper transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(vessel.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(vessel.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<span class="text-parchment/50 text-xs">${ssrInterpolate(vessel.type)}</span></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(reversedReachedStages), (stage) => {
          _push(`<!--[--><div class="relative">`);
          if (canEdit(stage)) {
            _push(`<div class="absolute top-4 right-4 z-10">`);
            _push(ssrRenderComponent(_component_UButton, {
              icon: isEditing(stage) ? "i-lucide-x" : "i-lucide-pencil",
              size: "xs",
              variant: isEditing(stage) ? "soft" : "ghost",
              color: isEditing(stage) ? "primary" : "neutral",
              onClick: ($event) => toggleEdit(stage)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(isEditing(stage) ? "Done" : "Edit")}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(isEditing(stage) ? "Done" : "Edit"), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(STAGE_COMPONENTS[stage]), {
            batch: unref(batch),
            editing: isEditing(stage)
          }, null), _parent);
          _push(`</div><div class="flex items-center justify-center gap-3">`);
          if (canStepBack(stage)) {
            _push(`<!--[-->`);
            if (unref(confirmRevertStage) !== stage) {
              _push(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-undo-2",
                variant: "ghost",
                color: "neutral",
                size: "sm",
                class: "text-parchment/60 hover:text-orange-400",
                onClick: ($event) => confirmRevertStage.value = stage
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(` Step Back `);
                  } else {
                    return [
                      createTextVNode(" Step Back ")
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/5"><span class="text-xs text-orange-400"> Revert to ${ssrInterpolate(unref(getPreviousStage)(unref(batch).pipeline, stage))}? </span>`);
              _push(ssrRenderComponent(_component_UButton, {
                size: "xs",
                color: "warning",
                loading: unref(reverting),
                onClick: ($event) => stepBack(stage)
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(` Confirm `);
                  } else {
                    return [
                      createTextVNode(" Confirm ")
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(ssrRenderComponent(_component_UButton, {
                size: "xs",
                variant: "ghost",
                color: "neutral",
                onClick: ($event) => confirmRevertStage.value = null
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(` Cancel `);
                  } else {
                    return [
                      createTextVNode(" Cancel ")
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div>`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          if (unref(advancableStages).includes(stage) && (stage !== "Barrel Aging" || !unref(barrelAgingHasBarrels))) {
            _push(ssrRenderComponent(_component_BatchAdvanceAction, {
              batch: unref(batch),
              "source-stage": stage,
              onAdvanced: () => {
              }
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div><!--]-->`);
        });
        _push(`<!--]-->`);
        _push(ssrRenderComponent(_component_BatchTastingNotes, { batch: unref(batch) }, null, _parent));
        _push(ssrRenderComponent(_component_BatchActivityLog, { batch: unref(batch) }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Batch not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/batch")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Batches `);
            } else {
              return [
                createTextVNode(" Back to Batches ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/batch/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-CymgwWg1.mjs.map
