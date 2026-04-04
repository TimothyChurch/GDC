import { _ as _sfc_main$1 } from './Modal-GBrZNdlF.mjs';
import { e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$2 } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$3 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$4 } from './FormField-DcXe0kwN.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, createVNode, isRef, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
import { u as useVesselStore } from './useBatchStore-C5x8JeHz.mjs';
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
import './batchPipeline-br9pdPdU.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ModalDistillingCharge",
  __ssrInlineRender: true,
  props: {
    batchId: {},
    sourceVesselId: {},
    defaultRunType: {},
    isFirstRun: { type: Boolean }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const vesselStore = useVesselStore();
    const stillId = ref("");
    const chargeVolumeUnit = ref("gallon");
    const runType = ref(props.defaultRunType || "stripping");
    const additions = ref([]);
    const vesselVolumes = ref({});
    const volumeUnits = ["gallon", "L", "mL", "fl oz"];
    const sourceVesselOptions = computed(() => {
      return vesselStore.vessels.filter((v) => v.type !== "Still" && v.contents?.some((c) => c.batch === props.batchId && c.volume > 1e-3)).map((v) => {
        const entry = v.contents.find((c) => c.batch === props.batchId);
        return {
          id: v._id,
          name: v.name,
          availableVolume: entry.volume,
          availableVolumeUnit: entry.volumeUnit,
          abv: entry.abv
        };
      });
    });
    const enabledVesselIds = computed(
      () => sourceVesselOptions.value.filter((v) => (vesselVolumes.value[v.id] || 0) > 0).map((v) => v.id)
    );
    const availableInUnit = (vessel) => vessel.availableVolume * convertUnitRatio(vessel.availableVolumeUnit, chargeVolumeUnit.value);
    const stillOptions = computed(() => {
      return vesselStore.stills.map((v) => {
        const statsUnit = v.stats?.volumeUnit || "gal";
        const currentVol = (v.current?.volume || 0) * convertUnitRatio(v.current?.volumeUnit || statsUnit, statsUnit);
        const capacity = v.stats?.volume || 0;
        const hint = capacity > 0 ? `${currentVol.toFixed(1)}/${capacity.toFixed(0)} ${statsUnit}` : currentVol > 0 ? `${currentVol.toFixed(1)} ${statsUnit} in use` : "empty";
        return {
          label: `${v.name} (${hint})`,
          value: v._id
        };
      });
    });
    const totalChargeVolume = computed(() => {
      return sourceVesselOptions.value.reduce((sum, v) => {
        return sum + (vesselVolumes.value[v.id] || 0);
      }, 0);
    });
    const chargeAbv = computed(() => {
      const entries = sourceVesselOptions.value.filter((v) => (vesselVolumes.value[v.id] || 0) > 0).map((v) => ({
        volume: vesselVolumes.value[v.id],
        abv: v.abv
      }));
      if (entries.length === 0) return 0;
      const totalVol = entries.reduce((s, e) => s + e.volume, 0);
      if (totalVol === 0) return 0;
      return entries.reduce((s, e) => s + e.abv * e.volume, 0) / totalVol;
    });
    const fillVesselMax = (vessel) => {
      vesselVolumes.value[vessel.id] = Math.floor(availableInUnit(vessel) * 100) / 100;
    };
    const fillAllMax = () => {
      for (const v of sourceVesselOptions.value) {
        fillVesselMax(v);
      }
    };
    const clearVessel = (vesselId) => {
      vesselVolumes.value[vesselId] = void 0;
    };
    const additionVesselOptions = computed(() => [
      ...vesselStore.stills.map((v) => ({ label: `${v.name} (Still)`, value: v._id })),
      ...vesselStore.tanks.map((v) => ({ label: `${v.name} (Tank)`, value: v._id })),
      ...vesselStore.barrels.map((v) => ({ label: `${v.name} (Barrel)`, value: v._id }))
    ]);
    const addAddition = () => {
      additions.value.push({
        label: "",
        sourceVessel: "",
        volume: void 0,
        volumeUnit: "gallon",
        abv: void 0
      });
    };
    const removeAddition = (index) => {
      additions.value.splice(index, 1);
    };
    if (props.sourceVesselId && sourceVesselOptions.value.some((v) => v.id === props.sourceVesselId)) {
      const vessel = sourceVesselOptions.value.find((v) => v.id === props.sourceVesselId);
      vesselVolumes.value[vessel.id] = Math.floor(availableInUnit(vessel) * 100) / 100;
    }
    const canSubmit = computed(() => {
      if (!stillId.value) return false;
      const hasCharge = totalChargeVolume.value > 0;
      const hasAddition = additions.value.some((a) => (a.volume || 0) > 0);
      return hasCharge || hasAddition;
    });
    const submit = () => {
      const perVessel = sourceVesselOptions.value.filter((v) => (vesselVolumes.value[v.id] || 0) > 0).map((v) => ({
        vesselId: v.id,
        volume: vesselVolumes.value[v.id],
        volumeUnit: chargeVolumeUnit.value
      }));
      const vesselIds = perVessel.map((p) => p.vesselId);
      const result = {
        stillId: stillId.value,
        chargeVolume: totalChargeVolume.value,
        chargeVolumeUnit: chargeVolumeUnit.value,
        chargeAbv: chargeAbv.value,
        chargeSourceVessel: vesselIds[0] || "",
        chargeSourceVessels: vesselIds,
        chargePerVessel: perVessel,
        runType: runType.value,
        additions: additions.value.filter((a) => (a.volume || 0) > 0)
      };
      emit("close", result);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$1;
      const _component_UIcon = _sfc_main$e;
      const _component_USelect = _sfc_main$2;
      const _component_UButton = _sfc_main$8;
      const _component_UInput = _sfc_main$3;
      const _component_UFormField = _sfc_main$4;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        onClose: ($event) => emit("close", null)
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-flask-conical",
              class: "text-copper size-5"
            }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}>${ssrInterpolate(__props.isFirstRun ? "Charge Still & Begin Distilling" : "Charge Still")}</span></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2" }, [
                createVNode(_component_UIcon, {
                  name: "i-lucide-flask-conical",
                  class: "text-copper size-5"
                }),
                createVNode("span", null, toDisplayString(__props.isFirstRun ? "Charge Still & Begin Distilling" : "Charge Still"), 1)
              ])
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-5"${_scopeId}><div class="flex items-center justify-between"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider"${_scopeId}>Volume Unit</div>`);
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(chargeVolumeUnit),
              "onUpdate:modelValue": ($event) => isRef(chargeVolumeUnit) ? chargeVolumeUnit.value = $event : null,
              items: volumeUnits,
              class: "w-28",
              size: "sm"
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><div class="flex items-center justify-between mb-2"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider"${_scopeId}>Charge from Vessels</div>`);
            if (unref(sourceVesselOptions).length > 1) {
              _push2(ssrRenderComponent(_component_UButton, {
                variant: "link",
                size: "xs",
                class: "text-copper hover:text-gold",
                onClick: fillAllMax
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Fill All Max `);
                  } else {
                    return [
                      createTextVNode(" Fill All Max ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (unref(sourceVesselOptions).length === 0) {
              _push2(`<div class="text-xs text-parchment/60 italic"${_scopeId}> No vessels contain this batch </div>`);
            } else {
              _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(unref(sourceVesselOptions), (vessel) => {
                _push2(`<div class="${ssrRenderClass([
                  "rounded-lg border p-3 transition-all",
                  (unref(vesselVolumes)[vessel.id] || 0) > 0 ? "border-copper/40 bg-copper/10" : "border-brown/20 bg-brown/5"
                ])}"${_scopeId}><div class="flex items-center justify-between mb-1.5"${_scopeId}><span class="text-sm text-parchment font-medium"${_scopeId}>${ssrInterpolate(vessel.name)}</span><span class="text-xs text-parchment/50"${_scopeId}>${ssrInterpolate(availableInUnit(vessel).toFixed(1))} ${ssrInterpolate(unref(chargeVolumeUnit))} @ ${ssrInterpolate(vessel.abv.toFixed(1))}% </span></div><div class="flex items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UInput, {
                  "model-value": unref(vesselVolumes)[vessel.id],
                  "onUpdate:modelValue": ($event) => unref(vesselVolumes)[vessel.id] = $event,
                  type: "number",
                  max: availableInUnit(vessel),
                  placeholder: "0",
                  step: "0.1",
                  size: "sm",
                  class: "flex-1"
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UButton, {
                  size: "xs",
                  variant: "ghost",
                  class: "text-parchment/50 shrink-0",
                  onClick: ($event) => fillVesselMax(vessel)
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
                  _: 2
                }, _parent2, _scopeId));
                if ((unref(vesselVolumes)[vessel.id] || 0) > 0) {
                  _push2(ssrRenderComponent(_component_UButton, {
                    size: "xs",
                    variant: "ghost",
                    color: "error",
                    icon: "i-lucide-x",
                    class: "shrink-0",
                    onClick: ($event) => clearVessel(vessel.id)
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
                if (availableInUnit(vessel) > 0 && (unref(vesselVolumes)[vessel.id] || 0) > 0) {
                  _push2(`<div class="mt-1.5"${_scopeId}><div class="w-full bg-brown/20 rounded-full h-1"${_scopeId}><div class="bg-copper rounded-full h-1 transition-all" style="${ssrRenderStyle({ width: `${Math.min(100, (unref(vesselVolumes)[vessel.id] || 0) / availableInUnit(vessel) * 100)}%` })}"${_scopeId}></div></div></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              });
              _push2(`<!--]--></div>`);
            }
            if (unref(totalChargeVolume) > 0) {
              _push2(`<div class="mt-3 rounded-lg border border-copper/30 bg-copper/5 px-3 py-2"${_scopeId}><div class="flex items-center justify-between"${_scopeId}><span class="text-xs text-parchment/60 uppercase tracking-wider"${_scopeId}>Total Charge</span><span class="text-sm font-semibold text-copper"${_scopeId}>${ssrInterpolate(unref(totalChargeVolume).toFixed(1))} ${ssrInterpolate(unref(chargeVolumeUnit))} `);
              if (unref(chargeAbv) > 0) {
                _push2(`<span class="text-parchment/60 font-normal"${_scopeId}>@ ${ssrInterpolate(unref(chargeAbv).toFixed(1))}% ABV</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</span></div>`);
              if (unref(enabledVesselIds).length > 1) {
                _push2(`<div class="text-xs text-parchment/50 mt-0.5"${_scopeId}> from ${ssrInterpolate(unref(enabledVesselIds).length)} vessels </div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Still</div>`);
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(stillId),
              "onUpdate:modelValue": ($event) => isRef(stillId) ? stillId.value = $event : null,
              items: unref(stillOptions),
              "value-key": "value",
              "label-key": "label",
              placeholder: "Select still..."
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><div class="flex items-center justify-between mb-2"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider"${_scopeId}>Additions (optional)</div>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              size: "xs",
              variant: "ghost",
              onClick: addAddition
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add`);
                } else {
                  return [
                    createTextVNode("Add")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (unref(additions).length) {
              _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(unref(additions), (addition, i) => {
                _push2(`<div class="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end p-2 rounded border border-brown/10 bg-brown/5"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UFormField, { label: "Label" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UInput, {
                        modelValue: addition.label,
                        "onUpdate:modelValue": ($event) => addition.label = $event,
                        placeholder: "Tails, Low wines...",
                        size: "sm"
                      }, null, _parent3, _scopeId2));
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
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UFormField, { label: "Source Vessel" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_USelect, {
                        modelValue: addition.sourceVessel,
                        "onUpdate:modelValue": ($event) => addition.sourceVessel = $event,
                        items: unref(additionVesselOptions),
                        "value-key": "value",
                        "label-key": "label",
                        placeholder: "Vessel",
                        size: "sm"
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_USelect, {
                          modelValue: addition.sourceVessel,
                          "onUpdate:modelValue": ($event) => addition.sourceVessel = $event,
                          items: unref(additionVesselOptions),
                          "value-key": "value",
                          "label-key": "label",
                          placeholder: "Vessel",
                          size: "sm"
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
                        modelValue: addition.volume,
                        "onUpdate:modelValue": ($event) => addition.volume = $event,
                        modelModifiers: { number: true },
                        type: "number",
                        placeholder: "0",
                        size: "sm"
                      }, null, _parent3, _scopeId2));
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
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UFormField, { label: "ABV %" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UInput, {
                        modelValue: addition.abv,
                        "onUpdate:modelValue": ($event) => addition.abv = $event,
                        modelModifiers: { number: true },
                        type: "number",
                        step: "0.1",
                        placeholder: "0",
                        size: "sm"
                      }, null, _parent3, _scopeId2));
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
                }, _parent2, _scopeId));
                _push2(`<div class="flex justify-end"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UButton, {
                  icon: "i-lucide-x",
                  color: "error",
                  variant: "ghost",
                  size: "xs",
                  onClick: ($event) => removeAddition(i)
                }, null, _parent2, _scopeId));
                _push2(`</div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<div class="text-xs text-parchment/50 italic"${_scopeId}>None</div>`);
            }
            _push2(`</div><div${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Run Type</div><div class="flex gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              variant: unref(runType) === "stripping" ? "solid" : "outline",
              color: unref(runType) === "stripping" ? "primary" : "neutral",
              size: "sm",
              onClick: ($event) => runType.value = "stripping"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Stripping `);
                } else {
                  return [
                    createTextVNode(" Stripping ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              variant: unref(runType) === "spirit" ? "solid" : "outline",
              color: unref(runType) === "spirit" ? "primary" : "neutral",
              size: "sm",
              onClick: ($event) => runType.value = "spirit"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Spirit `);
                } else {
                  return [
                    createTextVNode(" Spirit ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-5" }, [
                createVNode("div", { class: "flex items-center justify-between" }, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, "Volume Unit"),
                  createVNode(_component_USelect, {
                    modelValue: unref(chargeVolumeUnit),
                    "onUpdate:modelValue": ($event) => isRef(chargeVolumeUnit) ? chargeVolumeUnit.value = $event : null,
                    items: volumeUnits,
                    class: "w-28",
                    size: "sm"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "flex items-center justify-between mb-2" }, [
                    createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, "Charge from Vessels"),
                    unref(sourceVesselOptions).length > 1 ? (openBlock(), createBlock(_component_UButton, {
                      key: 0,
                      variant: "link",
                      size: "xs",
                      class: "text-copper hover:text-gold",
                      onClick: fillAllMax
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Fill All Max ")
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ]),
                  unref(sourceVesselOptions).length === 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "text-xs text-parchment/60 italic"
                  }, " No vessels contain this batch ")) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "space-y-2"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(sourceVesselOptions), (vessel) => {
                      return openBlock(), createBlock("div", {
                        key: vessel.id,
                        class: [
                          "rounded-lg border p-3 transition-all",
                          (unref(vesselVolumes)[vessel.id] || 0) > 0 ? "border-copper/40 bg-copper/10" : "border-brown/20 bg-brown/5"
                        ]
                      }, [
                        createVNode("div", { class: "flex items-center justify-between mb-1.5" }, [
                          createVNode("span", { class: "text-sm text-parchment font-medium" }, toDisplayString(vessel.name), 1),
                          createVNode("span", { class: "text-xs text-parchment/50" }, toDisplayString(availableInUnit(vessel).toFixed(1)) + " " + toDisplayString(unref(chargeVolumeUnit)) + " @ " + toDisplayString(vessel.abv.toFixed(1)) + "% ", 1)
                        ]),
                        createVNode("div", { class: "flex items-center gap-2" }, [
                          createVNode(_component_UInput, {
                            "model-value": unref(vesselVolumes)[vessel.id],
                            "onUpdate:modelValue": ($event) => unref(vesselVolumes)[vessel.id] = $event,
                            type: "number",
                            max: availableInUnit(vessel),
                            placeholder: "0",
                            step: "0.1",
                            size: "sm",
                            class: "flex-1"
                          }, null, 8, ["model-value", "onUpdate:modelValue", "max"]),
                          createVNode(_component_UButton, {
                            size: "xs",
                            variant: "ghost",
                            class: "text-parchment/50 shrink-0",
                            onClick: ($event) => fillVesselMax(vessel)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Max ")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          (unref(vesselVolumes)[vessel.id] || 0) > 0 ? (openBlock(), createBlock(_component_UButton, {
                            key: 0,
                            size: "xs",
                            variant: "ghost",
                            color: "error",
                            icon: "i-lucide-x",
                            class: "shrink-0",
                            onClick: ($event) => clearVessel(vessel.id)
                          }, null, 8, ["onClick"])) : createCommentVNode("", true)
                        ]),
                        availableInUnit(vessel) > 0 && (unref(vesselVolumes)[vessel.id] || 0) > 0 ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "mt-1.5"
                        }, [
                          createVNode("div", { class: "w-full bg-brown/20 rounded-full h-1" }, [
                            createVNode("div", {
                              class: "bg-copper rounded-full h-1 transition-all",
                              style: { width: `${Math.min(100, (unref(vesselVolumes)[vessel.id] || 0) / availableInUnit(vessel) * 100)}%` }
                            }, null, 4)
                          ])
                        ])) : createCommentVNode("", true)
                      ], 2);
                    }), 128))
                  ])),
                  unref(totalChargeVolume) > 0 ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "mt-3 rounded-lg border border-copper/30 bg-copper/5 px-3 py-2"
                  }, [
                    createVNode("div", { class: "flex items-center justify-between" }, [
                      createVNode("span", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, "Total Charge"),
                      createVNode("span", { class: "text-sm font-semibold text-copper" }, [
                        createTextVNode(toDisplayString(unref(totalChargeVolume).toFixed(1)) + " " + toDisplayString(unref(chargeVolumeUnit)) + " ", 1),
                        unref(chargeAbv) > 0 ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "text-parchment/60 font-normal"
                        }, "@ " + toDisplayString(unref(chargeAbv).toFixed(1)) + "% ABV", 1)) : createCommentVNode("", true)
                      ])
                    ]),
                    unref(enabledVesselIds).length > 1 ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "text-xs text-parchment/50 mt-0.5"
                    }, " from " + toDisplayString(unref(enabledVesselIds).length) + " vessels ", 1)) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true)
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Still"),
                  createVNode(_component_USelect, {
                    modelValue: unref(stillId),
                    "onUpdate:modelValue": ($event) => isRef(stillId) ? stillId.value = $event : null,
                    items: unref(stillOptions),
                    "value-key": "value",
                    "label-key": "label",
                    placeholder: "Select still..."
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "flex items-center justify-between mb-2" }, [
                    createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, "Additions (optional)"),
                    createVNode(_component_UButton, {
                      icon: "i-lucide-plus",
                      size: "xs",
                      variant: "ghost",
                      onClick: addAddition
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Add")
                      ]),
                      _: 1
                    })
                  ]),
                  unref(additions).length ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-2"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(additions), (addition, i) => {
                      return openBlock(), createBlock("div", {
                        key: i,
                        class: "grid grid-cols-2 sm:grid-cols-5 gap-2 items-end p-2 rounded border border-brown/10 bg-brown/5"
                      }, [
                        createVNode(_component_UFormField, { label: "Label" }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: addition.label,
                              "onUpdate:modelValue": ($event) => addition.label = $event,
                              placeholder: "Tails, Low wines...",
                              size: "sm"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 2
                        }, 1024),
                        createVNode(_component_UFormField, { label: "Source Vessel" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: addition.sourceVessel,
                              "onUpdate:modelValue": ($event) => addition.sourceVessel = $event,
                              items: unref(additionVesselOptions),
                              "value-key": "value",
                              "label-key": "label",
                              placeholder: "Vessel",
                              size: "sm"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 2
                        }, 1024),
                        createVNode(_component_UFormField, { label: "Volume" }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: addition.volume,
                              "onUpdate:modelValue": ($event) => addition.volume = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              placeholder: "0",
                              size: "sm"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 2
                        }, 1024),
                        createVNode(_component_UFormField, { label: "ABV %" }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: addition.abv,
                              "onUpdate:modelValue": ($event) => addition.abv = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              step: "0.1",
                              placeholder: "0",
                              size: "sm"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 2
                        }, 1024),
                        createVNode("div", { class: "flex justify-end" }, [
                          createVNode(_component_UButton, {
                            icon: "i-lucide-x",
                            color: "error",
                            variant: "ghost",
                            size: "xs",
                            onClick: ($event) => removeAddition(i)
                          }, null, 8, ["onClick"])
                        ])
                      ]);
                    }), 128))
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-xs text-parchment/50 italic"
                  }, "None"))
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Run Type"),
                  createVNode("div", { class: "flex gap-2" }, [
                    createVNode(_component_UButton, {
                      variant: unref(runType) === "stripping" ? "solid" : "outline",
                      color: unref(runType) === "stripping" ? "primary" : "neutral",
                      size: "sm",
                      onClick: ($event) => runType.value = "stripping"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Stripping ")
                      ]),
                      _: 1
                    }, 8, ["variant", "color", "onClick"]),
                    createVNode(_component_UButton, {
                      variant: unref(runType) === "spirit" ? "solid" : "outline",
                      color: unref(runType) === "spirit" ? "primary" : "neutral",
                      size: "sm",
                      onClick: ($event) => runType.value = "spirit"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Spirit ")
                      ]),
                      _: 1
                    }, 8, ["variant", "color", "onClick"])
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
                  _push3(`${ssrInterpolate(__props.isFirstRun ? "Begin Distilling" : "Charge Still")}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.isFirstRun ? "Begin Distilling" : "Charge Still"), 1)
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
                    createTextVNode(toDisplayString(__props.isFirstRun ? "Begin Distilling" : "Charge Still"), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Modal/ModalDistillingCharge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ModalDistillingCharge = Object.assign(_sfc_main, { __name: "ModalDistillingCharge" });

export { ModalDistillingCharge as default };
//# sourceMappingURL=ModalDistillingCharge-DUXLrys7.mjs.map
