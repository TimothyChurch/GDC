import { _ as _sfc_main$1 } from './FieldGroup-bwPzB93U.mjs';
import { _ as _sfc_main$2 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$3 } from './Select-xxK8NqZT.mjs';
import { defineComponent, computed, withCtx, isRef, unref, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BaseQuantityInput",
  __ssrInlineRender: true,
  props: {
    value: {},
    unit: {},
    unitOptions: {},
    placeholder: { default: "" },
    unitPlaceholder: { default: "unit" },
    size: { default: "md" },
    disabled: { type: Boolean, default: false },
    step: { default: "any" },
    min: { default: "0" }
  },
  emits: ["update:value", "update:unit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const localValue = computed({
      get: () => props.value,
      set: (val) => emit("update:value", val)
    });
    const localUnit = computed({
      get: () => props.unit ?? void 0,
      set: (val) => emit("update:unit", val)
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UFieldGroup = _sfc_main$1;
      const _component_UInput = _sfc_main$2;
      const _component_USelect = _sfc_main$3;
      _push(ssrRenderComponent(_component_UFieldGroup, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(localValue),
              "onUpdate:modelValue": ($event) => isRef(localValue) ? localValue.value = $event : null,
              type: "number",
              placeholder: __props.placeholder,
              size: __props.size,
              disabled: __props.disabled,
              step: __props.step,
              min: __props.min
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(localUnit),
              "onUpdate:modelValue": ($event) => isRef(localUnit) ? localUnit.value = $event : null,
              items: __props.unitOptions,
              placeholder: __props.unitPlaceholder,
              size: __props.size,
              disabled: __props.disabled
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(localValue),
                "onUpdate:modelValue": ($event) => isRef(localValue) ? localValue.value = $event : null,
                type: "number",
                placeholder: __props.placeholder,
                size: __props.size,
                disabled: __props.disabled,
                step: __props.step,
                min: __props.min
              }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder", "size", "disabled", "step", "min"]),
              createVNode(_component_USelect, {
                modelValue: unref(localUnit),
                "onUpdate:modelValue": ($event) => isRef(localUnit) ? localUnit.value = $event : null,
                items: __props.unitOptions,
                placeholder: __props.unitPlaceholder,
                size: __props.size,
                disabled: __props.disabled
              }, null, 8, ["modelValue", "onUpdate:modelValue", "items", "placeholder", "size", "disabled"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Base/BaseQuantityInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main, { __name: "BaseQuantityInput" });

export { __nuxt_component_6 as _ };
//# sourceMappingURL=BaseQuantityInput-Bo8QfULy.mjs.map
