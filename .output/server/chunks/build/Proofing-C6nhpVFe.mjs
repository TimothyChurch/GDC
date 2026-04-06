import { _ as _sfc_main$1 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$2 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$3 } from './Select-xxK8NqZT.mjs';
import { e as _sfc_main$8 } from './server.mjs';
import { c as convertUnitRatio, i as imperialWeightToVolume, m as metricWeightToVolume } from './conversions-t0mnZFvt.mjs';
import { mergeProps, withCtx, unref, createVNode, isRef, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, createCommentVNode, ref, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';

const useProofingCalculator = () => {
  const initialWeight = ref({ weight: 0, unit: "lb" });
  const initialAbv = ref(0);
  const targetAbv = ref();
  const steps = ref([]);
  const initialVolume = computed(() => {
    if (initialWeight.value.unit === "lb") {
      const volume = parseFloat(
        imperialWeightToVolume(
          initialWeight.value.weight,
          initialAbv.value
        ).toFixed(2)
      );
      const unit = "gal";
      return { volume, unit };
    } else {
      const volume = parseFloat(
        metricWeightToVolume(
          initialWeight.value.weight,
          initialAbv.value
        ).toFixed(2)
      );
      const unit = "L";
      return { volume, unit };
    }
  });
  const currentVolume = computed(() => {
    let stepsVolume = 0;
    if (steps.value.length > 0) {
      steps.value.forEach((step) => {
        if (step.volume != 0 && step.unit != "") {
          stepsVolume += step.volume * convertUnitRatio(step.unit, initialVolume.value.unit);
        }
      });
    }
    const volume = parseFloat(
      (initialVolume.value.volume + stepsVolume).toFixed(2)
    );
    const unit = initialVolume.value.unit;
    return { volume, unit };
  });
  const estimateFinalVolume = computed(() => {
    if (targetAbv.value == 0) {
      return;
    }
    if (steps.value.length >= 1) {
      let abv = 0;
      if (steps.value[steps.value.length - 1].abv != 0) {
        abv = steps.value[steps.value.length - 1].abv;
      } else if (steps.value.length > 2) {
        abv = steps.value[steps.value.length - 2].abv;
      } else {
        abv = initialAbv.value;
      }
      const volume2 = parseFloat(
        (abv * currentVolume.value.volume / targetAbv.value).toFixed(2)
      );
      const unit2 = initialVolume.value.unit;
      return { volume: volume2, unit: unit2 };
    }
    const volume = parseFloat(
      (initialAbv.value * initialVolume.value.volume / targetAbv.value).toFixed(2)
    );
    const unit = initialVolume.value.unit;
    return { volume, unit };
  });
  const waterNeeded = computed(() => {
    if (estimateFinalVolume.value === void 0) {
      return void 0;
    }
    const volume = parseFloat(
      ((estimateFinalVolume.value.volume - currentVolume.value.volume) * 0.75).toFixed(2)
    );
    const unit = estimateFinalVolume.value.unit;
    return { volume, unit };
  });
  const removeStep = (index) => {
    steps.value.splice(index, 1);
  };
  const clear = () => {
    initialWeight.value = { weight: 0, unit: "lb" };
    initialAbv.value = 0;
    targetAbv.value = 0;
    steps.value = [];
  };
  return {
    initialWeight,
    initialAbv,
    targetAbv,
    initialVolume,
    currentVolume,
    estimateFinalVolume,
    waterNeeded,
    steps,
    removeStep,
    clear
  };
};
const _sfc_main = {
  __name: "Proofing",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      initialWeight,
      initialVolume,
      initialAbv,
      targetAbv,
      currentVolume,
      waterNeeded,
      steps,
      removeStep,
      clear
    } = useProofingCalculator();
    const addStep = () => {
      steps.push({ volume: 0, unit: "L", abv: 0 });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UFormField = _sfc_main$1;
      const _component_UInput = _sfc_main$2;
      const _component_USelect = _sfc_main$3;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-6 space-y-6" }, _attrs))}><div><h3 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider mb-3">Initial Values</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">`);
      _push(ssrRenderComponent(_component_UFormField, { label: "Initial Weight" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid grid-cols-2 gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(initialWeight).weight,
              "onUpdate:modelValue": ($event) => unref(initialWeight).weight = $event,
              type: "number",
              min: "0"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(initialWeight).unit,
              "onUpdate:modelValue": ($event) => unref(initialWeight).unit = $event,
              items: ["kg", "lb"]
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "grid grid-cols-2 gap-2" }, [
                createVNode(_component_UInput, {
                  modelValue: unref(initialWeight).weight,
                  "onUpdate:modelValue": ($event) => unref(initialWeight).weight = $event,
                  type: "number",
                  min: "0"
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode(_component_USelect, {
                  modelValue: unref(initialWeight).unit,
                  "onUpdate:modelValue": ($event) => unref(initialWeight).unit = $event,
                  items: ["kg", "lb"]
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "Initial ABV" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(initialAbv),
              "onUpdate:modelValue": ($event) => isRef(initialAbv) ? initialAbv.value = $event : null,
              type: "number",
              min: "0",
              max: "100"
            }, {
              trailing: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`%`);
                } else {
                  return [
                    createTextVNode("%")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<span class="text-xs text-parchment/60 mt-0.5"${_scopeId}>Proof: ${ssrInterpolate((unref(initialAbv) * 2).toFixed(0))}</span>`);
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(initialAbv),
                "onUpdate:modelValue": ($event) => isRef(initialAbv) ? initialAbv.value = $event : null,
                type: "number",
                min: "0",
                max: "100"
              }, {
                trailing: withCtx(() => [
                  createTextVNode("%")
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"]),
              createVNode("span", { class: "text-xs text-parchment/60 mt-0.5" }, "Proof: " + toDisplayString((unref(initialAbv) * 2).toFixed(0)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">`);
      _push(ssrRenderComponent(_component_UFormField, { label: "Initial Volume" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="text-sm text-parchment/80 bg-brown/15 rounded-lg px-3 py-2 border border-brown/20"${_scopeId}>`);
            if (unref(initialVolume).unit === "L") {
              _push2(`<!--[-->${ssrInterpolate((unref(initialVolume).volume * ("convertUnitRatio" in _ctx ? _ctx.convertUnitRatio : unref(convertUnitRatio))("L", "gallon")).toFixed(2))} gal / ${ssrInterpolate(unref(initialVolume).volume)} ${ssrInterpolate(unref(initialVolume).unit)}<!--]-->`);
            } else if (unref(initialVolume).unit === "gal") {
              _push2(`<!--[-->${ssrInterpolate(unref(initialVolume).volume)} ${ssrInterpolate(unref(initialVolume).unit)} / ${ssrInterpolate((unref(initialVolume).volume * ("convertUnitRatio" in _ctx ? _ctx.convertUnitRatio : unref(convertUnitRatio))("gallon", "L")).toFixed(2))} L <!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "text-sm text-parchment/80 bg-brown/15 rounded-lg px-3 py-2 border border-brown/20" }, [
                unref(initialVolume).unit === "L" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  createTextVNode(toDisplayString((unref(initialVolume).volume * ("convertUnitRatio" in _ctx ? _ctx.convertUnitRatio : unref(convertUnitRatio))("L", "gallon")).toFixed(2)) + " gal / " + toDisplayString(unref(initialVolume).volume) + " " + toDisplayString(unref(initialVolume).unit), 1)
                ], 64)) : unref(initialVolume).unit === "gal" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                  createTextVNode(toDisplayString(unref(initialVolume).volume) + " " + toDisplayString(unref(initialVolume).unit) + " / " + toDisplayString((unref(initialVolume).volume * ("convertUnitRatio" in _ctx ? _ctx.convertUnitRatio : unref(convertUnitRatio))("gallon", "L")).toFixed(2)) + " L ", 1)
                ], 64)) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "Target ABV" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(targetAbv),
              "onUpdate:modelValue": ($event) => isRef(targetAbv) ? targetAbv.value = $event : null,
              type: "number",
              min: "0",
              max: "100"
            }, {
              trailing: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`%`);
                } else {
                  return [
                    createTextVNode("%")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (unref(targetAbv)) {
              _push2(`<span class="text-xs text-parchment/60 mt-0.5"${_scopeId}>Proof: ${ssrInterpolate((unref(targetAbv) * 2).toFixed(0))}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(targetAbv),
                "onUpdate:modelValue": ($event) => isRef(targetAbv) ? targetAbv.value = $event : null,
                type: "number",
                min: "0",
                max: "100"
              }, {
                trailing: withCtx(() => [
                  createTextVNode("%")
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"]),
              unref(targetAbv) ? (openBlock(), createBlock("span", {
                key: 0,
                class: "text-xs text-parchment/60 mt-0.5"
              }, "Proof: " + toDisplayString((unref(targetAbv) * 2).toFixed(0)), 1)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(steps).length > 0) {
        _push(`<div><h3 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider mb-3">Water Additions</h3><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(steps), (step, index) => {
          _push(`<div class="bg-brown/10 rounded-lg border border-brown/20 p-3"><div class="flex items-center justify-between mb-2"><span class="text-xs font-medium text-parchment/50">Step ${ssrInterpolate(index + 1)}</span>`);
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-x",
            size: "xs",
            variant: "ghost",
            color: "error",
            onClick: ($event) => unref(removeStep)(index),
            "aria-label": "Remove step"
          }, null, _parent));
          _push(`</div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">`);
          _push(ssrRenderComponent(_component_UFormField, { label: "Water Added" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="grid grid-cols-2 gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: step.volume,
                  "onUpdate:modelValue": ($event) => step.volume = $event,
                  type: "number",
                  min: "0"
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_USelect, {
                  modelValue: step.unit,
                  "onUpdate:modelValue": ($event) => step.unit = $event,
                  items: ["L", "gallon"]
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "grid grid-cols-2 gap-2" }, [
                    createVNode(_component_UInput, {
                      modelValue: step.volume,
                      "onUpdate:modelValue": ($event) => step.volume = $event,
                      type: "number",
                      min: "0"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_USelect, {
                      modelValue: step.unit,
                      "onUpdate:modelValue": ($event) => step.unit = $event,
                      items: ["L", "gallon"]
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_UFormField, { label: "New ABV" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UInput, {
                  modelValue: step.abv,
                  "onUpdate:modelValue": ($event) => step.abv = $event,
                  type: "number",
                  min: "0",
                  max: "100"
                }, {
                  trailing: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`%`);
                    } else {
                      return [
                        createTextVNode("%")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                if (step.abv) {
                  _push2(`<span class="text-xs text-parchment/60 mt-0.5"${_scopeId}>Proof: ${ssrInterpolate((step.abv * 2).toFixed(0))}</span>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode(_component_UInput, {
                    modelValue: step.abv,
                    "onUpdate:modelValue": ($event) => step.abv = $event,
                    type: "number",
                    min: "0",
                    max: "100"
                  }, {
                    trailing: withCtx(() => [
                      createTextVNode("%")
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue"]),
                  step.abv ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-xs text-parchment/60 mt-0.5"
                  }, "Proof: " + toDisplayString((step.abv * 2).toFixed(0)), 1)) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div><div class="text-xs text-parchment/60 mt-2"> Cumulative volume: ${ssrInterpolate(unref(currentVolume).volume)} ${ssrInterpolate(unref(currentVolume).unit)}</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="bg-brown/10 rounded-lg border border-brown/20 p-4"><h3 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider mb-3">Results</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><div class="text-xs text-parchment/60 mb-1">Current Volume</div><div class="text-sm text-parchment/80">${ssrInterpolate(unref(currentVolume).volume)} ${ssrInterpolate(unref(currentVolume).unit)}</div></div><div><div class="text-xs text-parchment/60 mb-1">Recommended Water</div>`);
      if (unref(waterNeeded)) {
        _push(`<div class="text-sm text-parchment/80">`);
        if (unref(waterNeeded).unit === "L") {
          _push(`<!--[-->${ssrInterpolate((unref(waterNeeded).volume * ("convertUnitRatio" in _ctx ? _ctx.convertUnitRatio : unref(convertUnitRatio))("L", "gallon")).toFixed(2))} gal / ${ssrInterpolate(unref(waterNeeded).volume)} ${ssrInterpolate(unref(waterNeeded).unit)}<!--]-->`);
        } else if (unref(waterNeeded).unit === "gal") {
          _push(`<!--[-->${ssrInterpolate(unref(waterNeeded).volume)} ${ssrInterpolate(unref(waterNeeded).unit)} / ${ssrInterpolate((unref(waterNeeded).volume * ("convertUnitRatio" in _ctx ? _ctx.convertUnitRatio : unref(convertUnitRatio))("gallon", "L")).toFixed(2))} L <!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="text-sm text-parchment/50">Set target ABV to calculate</div>`);
      }
      _push(`</div></div></div><div class="flex justify-end gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        variant: "outline",
        onClick: unref(clear),
        icon: "i-lucide-trash-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Clear All`);
          } else {
            return [
              createTextVNode("Clear All")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        onClick: addStep,
        icon: "i-lucide-plus"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Add Step`);
          } else {
            return [
              createTextVNode("Add Step")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Proofing.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Proofing-C6nhpVFe.mjs.map
