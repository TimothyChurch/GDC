import { _ as _sfc_main$2 } from './Popover-BvOOk09Z.mjs';
import { _ as _sfc_main$3 } from './FieldGroup-bwPzB93U.mjs';
import { e as _sfc_main$8 } from './server.mjs';
import { useModel, ref, mergeProps, isRef, unref, withCtx, createVNode, defineComponent, computed, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { DatePicker } from 'v-calendar';
import { format } from 'date-fns';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "DatePicker",
  __ssrInlineRender: true,
  props: {
    modelValue: {
      type: [Date, Object],
      default: null
    }
  },
  emits: ["update:model-value", "close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const date = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit("update:model-value", value);
        emit("close");
      }
    });
    const attrs = {
      transparent: true,
      borderless: true,
      color: "primary",
      "is-dark": { selector: "html", darkClass: "dark" },
      "first-day-of-week": 2
    };
    function onDayClick(_, event) {
      const target = event.target;
      target.blur();
    }
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(date) && unref(date)?.start && unref(date)?.end) {
        _push(ssrRenderComponent(unref(DatePicker), mergeProps({
          modelValue: unref(date),
          "onUpdate:modelValue": ($event) => isRef(date) ? date.value = $event : null,
          modelModifiers: { range: true },
          columns: 2
        }, { ...attrs, ..._ctx.$attrs }, { onDayclick: onDayClick }, _attrs), null, _parent));
      } else {
        _push(ssrRenderComponent(unref(DatePicker), mergeProps({
          modelValue: unref(date),
          "onUpdate:modelValue": ($event) => isRef(date) ? date.value = $event : null
        }, { ...attrs, ..._ctx.$attrs }, { onDayclick: onDayClick }, _attrs), null, _parent));
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DatePicker.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "DatePicker" });
const _sfc_main = {
  __name: "SiteDatePicker",
  __ssrInlineRender: true,
  props: {
    "modelValue": {},
    "modelModifiers": {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const open = ref(false);
    const buttonLabel = () => {
      if (!model.value) {
        return "Select a date";
      }
      if (typeof model.value == "string") {
        return format(new Date(model.value), "d MMM, yyyy");
      }
      return format(model.value, "d MMM, yyyy");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UPopover = _sfc_main$2;
      const _component_UFieldGroup = _sfc_main$3;
      const _component_UButton = _sfc_main$8;
      const _component_DatePicker = __nuxt_component_3;
      _push(ssrRenderComponent(_component_UPopover, mergeProps({
        open: unref(open),
        "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_DatePicker, {
              modelValue: model.value,
              "onUpdate:modelValue": ($event) => model.value = $event,
              "is-required": ""
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_DatePicker, {
                modelValue: model.value,
                "onUpdate:modelValue": ($event) => model.value = $event,
                "is-required": ""
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UFieldGroup, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UButton, {
                    icon: "i-lucide-calendar-days",
                    label: buttonLabel()
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    icon: "i-lucide-x",
                    onClick: ($event) => model.value = null
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      icon: "i-lucide-calendar-days",
                      label: buttonLabel()
                    }, null, 8, ["label"]),
                    createVNode(_component_UButton, {
                      icon: "i-lucide-x",
                      onClick: ($event) => model.value = null
                    }, null, 8, ["onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UFieldGroup, null, {
                default: withCtx(() => [
                  createVNode(_component_UButton, {
                    icon: "i-lucide-calendar-days",
                    label: buttonLabel()
                  }, null, 8, ["label"]),
                  createVNode(_component_UButton, {
                    icon: "i-lucide-x",
                    onClick: ($event) => model.value = null
                  }, null, 8, ["onClick"])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SiteDatePicker.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=SiteDatePicker-pVMyeD61.mjs.map
