import { _ as _sfc_main$1 } from './Modal-GBrZNdlF.mjs';
import { e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$2 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$3 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$4 } from './Select-xxK8NqZT.mjs';
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, unref, toDisplayString, createVNode, isRef, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
import { c as calculateProofGallons } from './proofGallons--xmqBsFG.mjs';
import { u as useVesselStore } from './useBatchStore-D8asmAQ6.mjs';
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
import './batchPipeline-Dr1IalWc.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ModalBarrelFill",
  __ssrInlineRender: true,
  props: {
    batchId: {},
    sourceVolume: {},
    sourceVolumeUnit: {},
    sourceAbv: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const vesselStore = useVesselStore();
    const volumeUnits = ["gallon", "L"];
    const entryAbv = ref(props.sourceAbv || 0);
    const waterNeeded = computed(() => {
      if (!entryAbv.value || !props.sourceAbv || entryAbv.value >= props.sourceAbv) return 0;
      const finalVol = props.sourceVolume * props.sourceAbv / entryAbv.value;
      return Math.max(0, finalVol - props.sourceVolume);
    });
    const proovedVolume = computed(() => {
      if (!entryAbv.value || !props.sourceAbv) return props.sourceVolume;
      if (entryAbv.value >= props.sourceAbv) return props.sourceVolume;
      return props.sourceVolume * props.sourceAbv / entryAbv.value;
    });
    const proovedProofGallons = computed(() => {
      if (!proovedVolume.value || !entryAbv.value) return 0;
      return calculateProofGallons(proovedVolume.value, props.sourceVolumeUnit, entryAbv.value);
    });
    const barrels = ref([
      { barrelId: "", volume: 0, volumeUnit: props.sourceVolumeUnit || "gallon" }
    ]);
    const addBarrel = () => {
      barrels.value.push({ barrelId: "", volume: 0, volumeUnit: props.sourceVolumeUnit || "gallon" });
    };
    const removeBarrel = (index) => {
      barrels.value.splice(index, 1);
    };
    const barrelOptions = computed(() => {
      const selected = new Set(barrels.value.map((b) => b.barrelId).filter(Boolean));
      return vesselStore.emptyBarrels.map((v) => {
        const cap = v.stats?.volume ? `${v.stats.volume} ${v.stats.volumeUnit || "gal"}` : "";
        const size = v.barrel?.size ? `${v.barrel.size}` : "";
        const hint = [size, cap].filter(Boolean).join(" — ");
        return {
          label: hint ? `${v.name} (${hint})` : v.name,
          value: v._id,
          disabled: selected.has(v._id),
          capacity: v.stats?.volume || 0,
          capacityUnit: v.stats?.volumeUnit || "gallon"
        };
      });
    });
    const getBarrelCapacity = (barrelId) => {
      if (!barrelId) return 0;
      const opt = barrelOptions.value.find((o) => o.value === barrelId);
      if (!opt || !opt.capacity) return 0;
      const barrel = barrels.value.find((b) => b.barrelId === barrelId);
      return opt.capacity * convertUnitRatio(opt.capacityUnit, barrel?.volumeUnit || props.sourceVolumeUnit);
    };
    const fillBarrel = (index) => {
      const entry = barrels.value[index];
      if (!entry?.barrelId) return;
      const cap = getBarrelCapacity(entry.barrelId);
      const remaining = availableVolume.value + (entry.volume || 0);
      entry.volume = Math.min(cap, remaining);
    };
    const allocatedVolume = computed(() => {
      return barrels.value.reduce((sum, b) => {
        return sum + (b.volume || 0) * convertUnitRatio(b.volumeUnit, props.sourceVolumeUnit);
      }, 0);
    });
    const availableVolume = computed(() => {
      return Math.max(0, proovedVolume.value - allocatedVolume.value);
    });
    const allocationPercent = computed(() => {
      if (proovedVolume.value <= 0) return 0;
      return Math.min(100, allocatedVolume.value / proovedVolume.value * 100);
    });
    const canSubmit = computed(() => {
      if (barrels.value.length === 0) return false;
      const allValid = barrels.value.every((b) => b.barrelId && b.volume > 0);
      if (!allValid) return false;
      const ids = barrels.value.map((b) => b.barrelId);
      if (new Set(ids).size !== ids.length) return false;
      if (allocatedVolume.value > proovedVolume.value + 0.01) return false;
      return true;
    });
    const submit = () => {
      const result = {
        entryAbv: entryAbv.value,
        waterAdded: waterNeeded.value,
        waterAddedUnit: props.sourceVolumeUnit,
        finalVolume: proovedVolume.value,
        finalVolumeUnit: props.sourceVolumeUnit,
        barrels: barrels.value.filter((b) => b.barrelId && b.volume > 0)
      };
      emit("close", result);
    };
    const autoFillSingle = () => {
      if (barrels.value.length === 1 && barrels.value[0]?.barrelId && barrels.value[0]?.volume === 0) {
        fillBarrel(0);
      }
    };
    watch(() => barrels.value[0]?.barrelId, () => autoFillSingle());
    watch(proovedVolume, () => autoFillSingle());
    const shortUnit = (unit) => unit.replace(/gallon/i, "gal").replace(/liter/i, "L");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$1;
      const _component_UIcon = _sfc_main$e;
      const _component_UFormField = _sfc_main$2;
      const _component_UInput = _sfc_main$3;
      const _component_UButton = _sfc_main$8;
      const _component_USelect = _sfc_main$4;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        onClose: ($event) => emit("close", null)
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-cylinder",
              class: "text-amber size-5"
            }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}>Fill Barrels</span></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2" }, [
                createVNode(_component_UIcon, {
                  name: "i-lucide-cylinder",
                  class: "text-amber size-5"
                }),
                createVNode("span", null, "Fill Barrels")
              ])
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-5"${_scopeId}><div class="rounded-lg border border-brown/20 bg-brown/5 p-3"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Spirit from Storage</div><div class="flex flex-wrap gap-4 text-sm text-parchment"${_scopeId}><span${_scopeId}>${ssrInterpolate(__props.sourceVolume.toFixed(1))} ${ssrInterpolate(shortUnit(__props.sourceVolumeUnit))}</span><span${_scopeId}>${ssrInterpolate(__props.sourceAbv.toFixed(1))}% ABV</span><span class="text-purple-400 font-semibold"${_scopeId}>${ssrInterpolate(unref(calculateProofGallons)(__props.sourceVolume, __props.sourceVolumeUnit, __props.sourceAbv).toFixed(2))} PG </span></div></div><div${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Barrel Entry ABV</div><div class="grid grid-cols-2 gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UFormField, { label: "Target ABV %" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(entryAbv),
                    "onUpdate:modelValue": ($event) => isRef(entryAbv) ? entryAbv.value = $event : null,
                    modelModifiers: { number: true },
                    type: "number",
                    min: 0,
                    max: __props.sourceAbv,
                    step: "0.1",
                    placeholder: "62.5"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(entryAbv),
                      "onUpdate:modelValue": ($event) => isRef(entryAbv) ? entryAbv.value = $event : null,
                      modelModifiers: { number: true },
                      type: "number",
                      min: 0,
                      max: __props.sourceAbv,
                      step: "0.1",
                      placeholder: "62.5"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "max"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="flex flex-col justify-end"${_scopeId}>`);
            if (unref(waterNeeded) > 0) {
              _push2(`<div class="text-sm text-cyan-400"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-droplets",
                class: "inline text-xs"
              }, null, _parent2, _scopeId));
              _push2(` Add ${ssrInterpolate(unref(waterNeeded).toFixed(1))} ${ssrInterpolate(shortUnit(__props.sourceVolumeUnit))} water </div>`);
            } else {
              _push2(`<div class="text-sm text-parchment/60"${_scopeId}> No proofing needed </div>`);
            }
            _push2(`</div></div>`);
            if (unref(waterNeeded) > 0) {
              _push2(`<div class="mt-2 text-xs text-parchment/50"${_scopeId}> After proofing: ${ssrInterpolate(unref(proovedVolume).toFixed(1))} ${ssrInterpolate(shortUnit(__props.sourceVolumeUnit))} @ ${ssrInterpolate(unref(entryAbv).toFixed(1))}% ABV (${ssrInterpolate(unref(proovedProofGallons).toFixed(2))} PG) </div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div${_scopeId}><div class="flex items-center justify-between mb-2"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider"${_scopeId}>Barrels</div>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              size: "xs",
              variant: "ghost",
              onClick: addBarrel
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Barrel`);
                } else {
                  return [
                    createTextVNode("Add Barrel")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="space-y-2"${_scopeId}><!--[-->`);
            ssrRenderList(unref(barrels), (entry, i) => {
              _push2(`<div class="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end p-3 rounded-lg border border-brown/15 bg-brown/5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UFormField, { label: "Barrel" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_USelect, {
                      modelValue: entry.barrelId,
                      "onUpdate:modelValue": ($event) => entry.barrelId = $event,
                      items: unref(barrelOptions),
                      "value-key": "value",
                      "label-key": "label",
                      placeholder: "Select barrel..."
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_USelect, {
                        modelValue: entry.barrelId,
                        "onUpdate:modelValue": ($event) => entry.barrelId = $event,
                        items: unref(barrelOptions),
                        "value-key": "value",
                        "label-key": "label",
                        placeholder: "Select barrel..."
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UInput, {
                      modelValue: entry.volume,
                      "onUpdate:modelValue": ($event) => entry.volume = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      min: 0,
                      step: "0.1",
                      placeholder: "0",
                      class: "w-24"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UInput, {
                        modelValue: entry.volume,
                        "onUpdate:modelValue": ($event) => entry.volume = $event,
                        modelModifiers: { number: true },
                        type: "number",
                        min: 0,
                        step: "0.1",
                        placeholder: "0",
                        class: "w-24"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_USelect, {
                      modelValue: entry.volumeUnit,
                      "onUpdate:modelValue": ($event) => entry.volumeUnit = $event,
                      items: volumeUnits,
                      class: "w-24"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_USelect, {
                        modelValue: entry.volumeUnit,
                        "onUpdate:modelValue": ($event) => entry.volumeUnit = $event,
                        items: volumeUnits,
                        class: "w-24"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`<div class="flex items-end gap-1 pb-0.5"${_scopeId}>`);
              if (entry.barrelId) {
                _push2(ssrRenderComponent(_component_UButton, {
                  icon: "i-lucide-maximize-2",
                  variant: "ghost",
                  color: "neutral",
                  size: "xs",
                  onClick: ($event) => fillBarrel(i),
                  title: "Fill to capacity"
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(barrels).length > 1) {
                _push2(ssrRenderComponent(_component_UButton, {
                  icon: "i-lucide-x",
                  variant: "ghost",
                  color: "error",
                  size: "xs",
                  onClick: ($event) => removeBarrel(i)
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            });
            _push2(`<!--]--></div><div class="mt-3"${_scopeId}><div class="w-full bg-brown/20 rounded-full h-2"${_scopeId}><div class="${ssrRenderClass([unref(allocatedVolume) > unref(proovedVolume) + 0.01 ? "bg-red-500" : "bg-amber-500", "h-full rounded-full transition-all duration-300"])}" style="${ssrRenderStyle({ width: `${unref(allocationPercent)}%` })}"${_scopeId}></div></div><div class="flex justify-between text-xs mt-1"${_scopeId}><span class="${ssrRenderClass(unref(allocatedVolume) > unref(proovedVolume) + 0.01 ? "text-red-400" : "text-parchment/50")}"${_scopeId}>${ssrInterpolate(unref(allocatedVolume).toFixed(1))} ${ssrInterpolate(shortUnit(__props.sourceVolumeUnit))} allocated </span><span class="text-parchment/60"${_scopeId}>${ssrInterpolate(unref(availableVolume).toFixed(1))} ${ssrInterpolate(shortUnit(__props.sourceVolumeUnit))} remaining </span></div></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-5" }, [
                createVNode("div", { class: "rounded-lg border border-brown/20 bg-brown/5 p-3" }, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Spirit from Storage"),
                  createVNode("div", { class: "flex flex-wrap gap-4 text-sm text-parchment" }, [
                    createVNode("span", null, toDisplayString(__props.sourceVolume.toFixed(1)) + " " + toDisplayString(shortUnit(__props.sourceVolumeUnit)), 1),
                    createVNode("span", null, toDisplayString(__props.sourceAbv.toFixed(1)) + "% ABV", 1),
                    createVNode("span", { class: "text-purple-400 font-semibold" }, toDisplayString(unref(calculateProofGallons)(__props.sourceVolume, __props.sourceVolumeUnit, __props.sourceAbv).toFixed(2)) + " PG ", 1)
                  ])
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Barrel Entry ABV"),
                  createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                    createVNode(_component_UFormField, { label: "Target ABV %" }, {
                      default: withCtx(() => [
                        createVNode(_component_UInput, {
                          modelValue: unref(entryAbv),
                          "onUpdate:modelValue": ($event) => isRef(entryAbv) ? entryAbv.value = $event : null,
                          modelModifiers: { number: true },
                          type: "number",
                          min: 0,
                          max: __props.sourceAbv,
                          step: "0.1",
                          placeholder: "62.5"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "max"])
                      ]),
                      _: 1
                    }),
                    createVNode("div", { class: "flex flex-col justify-end" }, [
                      unref(waterNeeded) > 0 ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "text-sm text-cyan-400"
                      }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-droplets",
                          class: "inline text-xs"
                        }),
                        createTextVNode(" Add " + toDisplayString(unref(waterNeeded).toFixed(1)) + " " + toDisplayString(shortUnit(__props.sourceVolumeUnit)) + " water ", 1)
                      ])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "text-sm text-parchment/60"
                      }, " No proofing needed "))
                    ])
                  ]),
                  unref(waterNeeded) > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "mt-2 text-xs text-parchment/50"
                  }, " After proofing: " + toDisplayString(unref(proovedVolume).toFixed(1)) + " " + toDisplayString(shortUnit(__props.sourceVolumeUnit)) + " @ " + toDisplayString(unref(entryAbv).toFixed(1)) + "% ABV (" + toDisplayString(unref(proovedProofGallons).toFixed(2)) + " PG) ", 1)) : createCommentVNode("", true)
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "flex items-center justify-between mb-2" }, [
                    createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, "Barrels"),
                    createVNode(_component_UButton, {
                      icon: "i-lucide-plus",
                      size: "xs",
                      variant: "ghost",
                      onClick: addBarrel
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Add Barrel")
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode("div", { class: "space-y-2" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(barrels), (entry, i) => {
                      return openBlock(), createBlock("div", {
                        key: i,
                        class: "grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end p-3 rounded-lg border border-brown/15 bg-brown/5"
                      }, [
                        createVNode(_component_UFormField, { label: "Barrel" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: entry.barrelId,
                              "onUpdate:modelValue": ($event) => entry.barrelId = $event,
                              items: unref(barrelOptions),
                              "value-key": "value",
                              "label-key": "label",
                              placeholder: "Select barrel..."
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 2
                        }, 1024),
                        createVNode(_component_UFormField, { label: "Volume" }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: entry.volume,
                              "onUpdate:modelValue": ($event) => entry.volume = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              min: 0,
                              step: "0.1",
                              placeholder: "0",
                              class: "w-24"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 2
                        }, 1024),
                        createVNode(_component_UFormField, { label: "Unit" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: entry.volumeUnit,
                              "onUpdate:modelValue": ($event) => entry.volumeUnit = $event,
                              items: volumeUnits,
                              class: "w-24"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 2
                        }, 1024),
                        createVNode("div", { class: "flex items-end gap-1 pb-0.5" }, [
                          entry.barrelId ? (openBlock(), createBlock(_component_UButton, {
                            key: 0,
                            icon: "i-lucide-maximize-2",
                            variant: "ghost",
                            color: "neutral",
                            size: "xs",
                            onClick: ($event) => fillBarrel(i),
                            title: "Fill to capacity"
                          }, null, 8, ["onClick"])) : createCommentVNode("", true),
                          unref(barrels).length > 1 ? (openBlock(), createBlock(_component_UButton, {
                            key: 1,
                            icon: "i-lucide-x",
                            variant: "ghost",
                            color: "error",
                            size: "xs",
                            onClick: ($event) => removeBarrel(i)
                          }, null, 8, ["onClick"])) : createCommentVNode("", true)
                        ])
                      ]);
                    }), 128))
                  ]),
                  createVNode("div", { class: "mt-3" }, [
                    createVNode("div", { class: "w-full bg-brown/20 rounded-full h-2" }, [
                      createVNode("div", {
                        class: ["h-full rounded-full transition-all duration-300", unref(allocatedVolume) > unref(proovedVolume) + 0.01 ? "bg-red-500" : "bg-amber-500"],
                        style: { width: `${unref(allocationPercent)}%` }
                      }, null, 6)
                    ]),
                    createVNode("div", { class: "flex justify-between text-xs mt-1" }, [
                      createVNode("span", {
                        class: unref(allocatedVolume) > unref(proovedVolume) + 0.01 ? "text-red-400" : "text-parchment/50"
                      }, toDisplayString(unref(allocatedVolume).toFixed(1)) + " " + toDisplayString(shortUnit(__props.sourceVolumeUnit)) + " allocated ", 3),
                      createVNode("span", { class: "text-parchment/60" }, toDisplayString(unref(availableVolume).toFixed(1)) + " " + toDisplayString(shortUnit(__props.sourceVolumeUnit)) + " remaining ", 1)
                    ])
                  ])
                ])
              ])
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-end gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "outline",
              color: "neutral",
              onClick: ($event) => emit("close", null)
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
              disabled: !unref(canSubmit),
              onClick: submit
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Fill ${ssrInterpolate(unref(barrels).filter((b) => b.barrelId).length)} ${ssrInterpolate(unref(barrels).filter((b) => b.barrelId).length === 1 ? "Barrel" : "Barrels")}`);
                } else {
                  return [
                    createTextVNode(" Fill " + toDisplayString(unref(barrels).filter((b) => b.barrelId).length) + " " + toDisplayString(unref(barrels).filter((b) => b.barrelId).length === 1 ? "Barrel" : "Barrels"), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex justify-end gap-2" }, [
                createVNode(_component_UButton, {
                  variant: "outline",
                  color: "neutral",
                  onClick: ($event) => emit("close", null)
                }, {
                  default: withCtx(() => [
                    createTextVNode("Cancel")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  disabled: !unref(canSubmit),
                  onClick: submit
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Fill " + toDisplayString(unref(barrels).filter((b) => b.barrelId).length) + " " + toDisplayString(unref(barrels).filter((b) => b.barrelId).length === 1 ? "Barrel" : "Barrels"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Modal/ModalBarrelFill.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ModalBarrelFill = Object.assign(_sfc_main, { __name: "ModalBarrelFill" });

export { ModalBarrelFill as default };
//# sourceMappingURL=ModalBarrelFill-Dr42A5r-.mjs.map
