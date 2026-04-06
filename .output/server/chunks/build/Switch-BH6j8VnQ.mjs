import { useSlots, useModel, useId, computed, unref, mergeProps, withCtx, openBlock, createBlock, Fragment, createCommentVNode, createVNode, renderSlot, createTextVNode, toDisplayString, mergeModels, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderClass, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { useForwardProps, Primitive, SwitchRoot, SwitchThumb, Label } from 'reka-ui';
import { i as useAppConfig, r as reactivePick, j as useFormField, t as tv, f as _sfc_main$e } from './server.mjs';

const theme = {
  "slots": {
    "root": "relative flex items-start",
    "base": [
      "inline-flex items-center shrink-0 rounded-full border-2 border-transparent focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=unchecked]:bg-accented",
      "transition-[background] duration-200"
    ],
    "container": "flex items-center",
    "thumb": "group pointer-events-none rounded-full bg-default shadow-lg ring-0 transition-transform duration-200 data-[state=unchecked]:translate-x-0 data-[state=unchecked]:rtl:-translate-x-0 flex items-center justify-center",
    "icon": [
      "absolute shrink-0 group-data-[state=unchecked]:text-dimmed opacity-0 size-10/12",
      "transition-[color,opacity] duration-200"
    ],
    "wrapper": "ms-2",
    "label": "block font-medium text-default",
    "description": "text-muted"
  },
  "variants": {
    "color": {
      "primary": {
        "base": "data-[state=checked]:bg-primary focus-visible:outline-primary",
        "icon": "group-data-[state=checked]:text-primary"
      },
      "secondary": {
        "base": "data-[state=checked]:bg-secondary focus-visible:outline-secondary",
        "icon": "group-data-[state=checked]:text-secondary"
      },
      "success": {
        "base": "data-[state=checked]:bg-success focus-visible:outline-success",
        "icon": "group-data-[state=checked]:text-success"
      },
      "info": {
        "base": "data-[state=checked]:bg-info focus-visible:outline-info",
        "icon": "group-data-[state=checked]:text-info"
      },
      "warning": {
        "base": "data-[state=checked]:bg-warning focus-visible:outline-warning",
        "icon": "group-data-[state=checked]:text-warning"
      },
      "error": {
        "base": "data-[state=checked]:bg-error focus-visible:outline-error",
        "icon": "group-data-[state=checked]:text-error"
      },
      "neutral": {
        "base": "data-[state=checked]:bg-inverted focus-visible:outline-inverted",
        "icon": "group-data-[state=checked]:text-highlighted"
      }
    },
    "size": {
      "xs": {
        "base": "w-7",
        "container": "h-4",
        "thumb": "size-3 data-[state=checked]:translate-x-3 data-[state=checked]:rtl:-translate-x-3",
        "wrapper": "text-xs"
      },
      "sm": {
        "base": "w-8",
        "container": "h-4",
        "thumb": "size-3.5 data-[state=checked]:translate-x-3.5 data-[state=checked]:rtl:-translate-x-3.5",
        "wrapper": "text-xs"
      },
      "md": {
        "base": "w-9",
        "container": "h-5",
        "thumb": "size-4 data-[state=checked]:translate-x-4 data-[state=checked]:rtl:-translate-x-4",
        "wrapper": "text-sm"
      },
      "lg": {
        "base": "w-10",
        "container": "h-5",
        "thumb": "size-4.5 data-[state=checked]:translate-x-4.5 data-[state=checked]:rtl:-translate-x-4.5",
        "wrapper": "text-sm"
      },
      "xl": {
        "base": "w-11",
        "container": "h-6",
        "thumb": "size-5 data-[state=checked]:translate-x-5 data-[state=checked]:rtl:-translate-x-5",
        "wrapper": "text-base"
      }
    },
    "checked": {
      "true": {
        "icon": "group-data-[state=checked]:opacity-100"
      }
    },
    "unchecked": {
      "true": {
        "icon": "group-data-[state=unchecked]:opacity-100"
      }
    },
    "loading": {
      "true": {
        "icon": "animate-spin"
      }
    },
    "required": {
      "true": {
        "label": "after:content-['*'] after:ms-0.5 after:text-error"
      }
    },
    "disabled": {
      "true": {
        "root": "opacity-75",
        "base": "cursor-not-allowed",
        "label": "cursor-not-allowed",
        "description": "cursor-not-allowed"
      }
    }
  },
  "defaultVariants": {
    "color": "primary",
    "size": "md"
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "USwitch",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    as: { type: null, required: false },
    color: { type: null, required: false },
    size: { type: null, required: false },
    loading: { type: Boolean, required: false },
    loadingIcon: { type: null, required: false },
    checkedIcon: { type: null, required: false },
    uncheckedIcon: { type: null, required: false },
    label: { type: String, required: false },
    description: { type: String, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    disabled: { type: Boolean, required: false },
    id: { type: String, required: false },
    name: { type: String, required: false },
    required: { type: Boolean, required: false },
    value: { type: String, required: false },
    defaultValue: { type: Boolean, required: false }
  }, {
    "modelValue": { type: Boolean, ...{ default: void 0 } },
    "modelModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["change"], ["update:modelValue"]),
  setup(__props, { emit: __emit }) {
    const props = __props;
    const slots = useSlots();
    const emits = __emit;
    const modelValue = useModel(__props, "modelValue", { type: Boolean, ...{ default: void 0 } });
    const appConfig = useAppConfig();
    const rootProps = useForwardProps(reactivePick(props, "required", "value", "defaultValue"));
    const { id: _id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField(props);
    const id = _id.value ?? useId();
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.switch || {} })({
      size: size.value,
      color: color.value,
      required: props.required,
      loading: props.loading,
      disabled: disabled.value || props.loading
    }));
    function onUpdate(value) {
      const event = new Event("change", { target: { value } });
      emits("change", event);
      emitFormChange();
      emitFormInput();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-slot="container" class="${ssrRenderClass(ui.value.container({ class: props.ui?.container }))}"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(SwitchRoot), mergeProps({ id: unref(id) }, { ...unref(rootProps), ..._ctx.$attrs, ...unref(ariaAttrs) }, {
              modelValue: modelValue.value,
              "onUpdate:modelValue": [($event) => modelValue.value = $event, onUpdate],
              name: unref(name),
              disabled: unref(disabled) || __props.loading,
              "data-slot": "base",
              class: ui.value.base({ class: props.ui?.base })
            }), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(SwitchThumb), {
                    "data-slot": "thumb",
                    class: ui.value.thumb({ class: props.ui?.thumb })
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (__props.loading) {
                          _push4(ssrRenderComponent(_sfc_main$e, {
                            name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, checked: true, unchecked: true })
                          }, null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!--[-->`);
                          if (__props.checkedIcon) {
                            _push4(ssrRenderComponent(_sfc_main$e, {
                              name: __props.checkedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: props.ui?.icon, checked: true })
                            }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (__props.uncheckedIcon) {
                            _push4(ssrRenderComponent(_sfc_main$e, {
                              name: __props.uncheckedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: props.ui?.icon, unchecked: true })
                            }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`<!--]-->`);
                        }
                      } else {
                        return [
                          __props.loading ? (openBlock(), createBlock(_sfc_main$e, {
                            key: 0,
                            name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, checked: true, unchecked: true })
                          }, null, 8, ["name", "class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                            __props.checkedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                              key: 0,
                              name: __props.checkedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: props.ui?.icon, checked: true })
                            }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                            __props.uncheckedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                              key: 1,
                              name: __props.uncheckedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: props.ui?.icon, unchecked: true })
                            }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                          ], 64))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(SwitchThumb), {
                      "data-slot": "thumb",
                      class: ui.value.thumb({ class: props.ui?.thumb })
                    }, {
                      default: withCtx(() => [
                        __props.loading ? (openBlock(), createBlock(_sfc_main$e, {
                          key: 0,
                          name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: props.ui?.icon, checked: true, unchecked: true })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          __props.checkedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                            key: 0,
                            name: __props.checkedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, checked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                          __props.uncheckedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                            key: 1,
                            name: __props.uncheckedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, unchecked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                        ], 64))
                      ]),
                      _: 1
                    }, 8, ["class"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (__props.label || !!slots.label || (__props.description || !!slots.description)) {
              _push2(`<div data-slot="wrapper" class="${ssrRenderClass(ui.value.wrapper({ class: props.ui?.wrapper }))}"${_scopeId}>`);
              if (__props.label || !!slots.label) {
                _push2(ssrRenderComponent(unref(Label), {
                  for: unref(id),
                  "data-slot": "label",
                  class: ui.value.label({ class: props.ui?.label })
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      ssrRenderSlot(_ctx.$slots, "label", { label: __props.label }, () => {
                        _push3(`${ssrInterpolate(__props.label)}`);
                      }, _push3, _parent3, _scopeId2);
                    } else {
                      return [
                        renderSlot(_ctx.$slots, "label", { label: __props.label }, () => [
                          createTextVNode(toDisplayString(__props.label), 1)
                        ])
                      ];
                    }
                  }),
                  _: 3
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (__props.description || !!slots.description) {
                _push2(`<p data-slot="description" class="${ssrRenderClass(ui.value.description({ class: props.ui?.description }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "description", { description: __props.description }, () => {
                  _push2(`${ssrInterpolate(__props.description)}`);
                }, _push2, _parent2, _scopeId);
                _push2(`</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", {
                "data-slot": "container",
                class: ui.value.container({ class: props.ui?.container })
              }, [
                createVNode(unref(SwitchRoot), mergeProps({ id: unref(id) }, { ...unref(rootProps), ..._ctx.$attrs, ...unref(ariaAttrs) }, {
                  modelValue: modelValue.value,
                  "onUpdate:modelValue": [($event) => modelValue.value = $event, onUpdate],
                  name: unref(name),
                  disabled: unref(disabled) || __props.loading,
                  "data-slot": "base",
                  class: ui.value.base({ class: props.ui?.base })
                }), {
                  default: withCtx(() => [
                    createVNode(unref(SwitchThumb), {
                      "data-slot": "thumb",
                      class: ui.value.thumb({ class: props.ui?.thumb })
                    }, {
                      default: withCtx(() => [
                        __props.loading ? (openBlock(), createBlock(_sfc_main$e, {
                          key: 0,
                          name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: props.ui?.icon, checked: true, unchecked: true })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          __props.checkedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                            key: 0,
                            name: __props.checkedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, checked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                          __props.uncheckedIcon ? (openBlock(), createBlock(_sfc_main$e, {
                            key: 1,
                            name: __props.uncheckedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, unchecked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                        ], 64))
                      ]),
                      _: 1
                    }, 8, ["class"])
                  ]),
                  _: 1
                }, 16, ["id", "modelValue", "onUpdate:modelValue", "name", "disabled", "class"])
              ], 2),
              __props.label || !!slots.label || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                key: 0,
                "data-slot": "wrapper",
                class: ui.value.wrapper({ class: props.ui?.wrapper })
              }, [
                __props.label || !!slots.label ? (openBlock(), createBlock(unref(Label), {
                  key: 0,
                  for: unref(id),
                  "data-slot": "label",
                  class: ui.value.label({ class: props.ui?.label })
                }, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, "label", { label: __props.label }, () => [
                      createTextVNode(toDisplayString(__props.label), 1)
                    ])
                  ]),
                  _: 3
                }, 8, ["for", "class"])) : createCommentVNode("", true),
                __props.description || !!slots.description ? (openBlock(), createBlock("p", {
                  key: 1,
                  "data-slot": "description",
                  class: ui.value.description({ class: props.ui?.description })
                }, [
                  renderSlot(_ctx.$slots, "description", { description: __props.description }, () => [
                    createTextVNode(toDisplayString(__props.description), 1)
                  ])
                ], 2)) : createCommentVNode("", true)
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/Switch.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Switch-BH6j8VnQ.mjs.map
