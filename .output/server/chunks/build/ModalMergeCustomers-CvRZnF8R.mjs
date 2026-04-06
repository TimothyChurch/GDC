import { _ as _sfc_main$1 } from './Modal-GBrZNdlF.mjs';
import { e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$2 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$3 } from './SelectMenu-DljUyjmT.mjs';
import { defineComponent, computed, ref, mergeProps, withCtx, unref, createTextVNode, createVNode, openBlock, createBlock, isRef, toDisplayString, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useEventStore } from './useEventStore-LoZhbbHY.mjs';
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
import './Input-Fd8Vd_4J.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ModalMergeCustomers",
  __ssrInlineRender: true,
  props: {
    preselectedId: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const contactStore = useContactStore();
    const eventStore = useEventStore();
    const customers = computed(() => contactStore.getCustomers());
    const primaryId = ref(props.preselectedId || "");
    const duplicateId = ref("");
    const merging = ref(false);
    const step = ref("select");
    const primary = computed(() => customers.value.find((c) => c._id === primaryId.value));
    const duplicate = computed(() => customers.value.find((c) => c._id === duplicateId.value));
    function displayName(c) {
      if (!c) return "";
      return c.businessName || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unnamed";
    }
    const primaryOptions = computed(
      () => customers.value.filter((c) => c._id !== duplicateId.value).map((c) => ({ label: displayName(c), value: c._id, hint: c.email || "" }))
    );
    const duplicateOptions = computed(
      () => customers.value.filter((c) => c._id !== primaryId.value).map((c) => ({ label: displayName(c), value: c._id, hint: c.email || "" }))
    );
    const duplicateEventCount = computed(
      () => duplicateId.value ? eventStore.getEventsByContact(duplicateId.value).length : 0
    );
    const fieldsToFill = computed(() => {
      if (!primary.value || !duplicate.value) return [];
      const fields = [];
      const checks = [
        { key: "firstName", label: "First Name" },
        { key: "lastName", label: "Last Name" },
        { key: "businessName", label: "Business" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "address", label: "Address" },
        { key: "website", label: "Website" }
      ];
      for (const { key, label } of checks) {
        if (!primary.value[key] && duplicate.value[key]) {
          fields.push({ label, value: String(duplicate.value[key]) });
        }
      }
      return fields;
    });
    const canProceed = computed(() => primaryId.value && duplicateId.value && primaryId.value !== duplicateId.value);
    function goToPreview() {
      step.value = "preview";
    }
    function goBack() {
      step.value = "select";
    }
    async function confirmMerge() {
      merging.value = true;
      try {
        await contactStore.mergeCustomers(primaryId.value, duplicateId.value);
        await eventStore.getAll();
        emit("close", true);
      } catch {
      } finally {
        merging.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$1;
      const _component_UIcon = _sfc_main$e;
      const _component_UFormField = _sfc_main$2;
      const _component_USelectMenu = _sfc_main$3;
      const _component_UButton = _sfc_main$8;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        onClose: ($event) => emit("close", false)
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-merge",
              class: "text-copper size-5"
            }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}>Merge Customers</span></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2" }, [
                createVNode(_component_UIcon, {
                  name: "i-lucide-merge",
                  class: "text-copper size-5"
                }),
                createVNode("span", null, "Merge Customers")
              ])
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(step) === "select") {
              _push2(`<div class="space-y-4"${_scopeId}><p class="text-sm text-parchment/70"${_scopeId}> Select the primary customer to keep and the duplicate to merge into it. All events, messages, and records from the duplicate will be transferred to the primary. </p>`);
              _push2(ssrRenderComponent(_component_UFormField, {
                label: "Keep (Primary)",
                required: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_USelectMenu, {
                      modelValue: unref(primaryId),
                      "onUpdate:modelValue": ($event) => isRef(primaryId) ? primaryId.value = $event : null,
                      items: unref(primaryOptions),
                      "value-key": "value",
                      placeholder: "Select primary customer...",
                      searchable: "",
                      class: "w-full"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_USelectMenu, {
                        modelValue: unref(primaryId),
                        "onUpdate:modelValue": ($event) => isRef(primaryId) ? primaryId.value = $event : null,
                        items: unref(primaryOptions),
                        "value-key": "value",
                        placeholder: "Select primary customer...",
                        searchable: "",
                        class: "w-full"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UFormField, {
                label: "Merge & Delete (Duplicate)",
                required: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_USelectMenu, {
                      modelValue: unref(duplicateId),
                      "onUpdate:modelValue": ($event) => isRef(duplicateId) ? duplicateId.value = $event : null,
                      items: unref(duplicateOptions),
                      "value-key": "value",
                      placeholder: "Select duplicate customer...",
                      searchable: "",
                      class: "w-full"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_USelectMenu, {
                        modelValue: unref(duplicateId),
                        "onUpdate:modelValue": ($event) => isRef(duplicateId) ? duplicateId.value = $event : null,
                        items: unref(duplicateOptions),
                        "value-key": "value",
                        placeholder: "Select duplicate customer...",
                        searchable: "",
                        class: "w-full"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<div class="space-y-4"${_scopeId}><div class="bg-charcoal rounded-lg border border-brown/30 p-3"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Keeping</div><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(displayName(unref(primary)))}</div>`);
              if (unref(primary)?.email) {
                _push2(`<div class="text-xs text-parchment/50"${_scopeId}>${ssrInterpolate(unref(primary).email)}</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="flex justify-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-arrow-up",
                class: "text-copper text-lg"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="bg-charcoal rounded-lg border border-red-500/30 p-3"${_scopeId}><div class="text-xs text-red-400 uppercase tracking-wider mb-2"${_scopeId}>Merging &amp; Deleting</div><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(displayName(unref(duplicate)))}</div>`);
              if (unref(duplicate)?.email) {
                _push2(`<div class="text-xs text-parchment/50"${_scopeId}>${ssrInterpolate(unref(duplicate).email)}</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="bg-charcoal rounded-lg border border-brown/30 p-3 space-y-2"${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider"${_scopeId}>What will happen</div><ul class="text-sm text-parchment/80 space-y-1"${_scopeId}>`);
              if (unref(duplicateEventCount) > 0) {
                _push2(`<li class="flex items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-calendar",
                  class: "text-copper shrink-0"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(unref(duplicateEventCount))} event(s) will be transferred </li>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--[-->`);
              ssrRenderList(unref(fieldsToFill), (field) => {
                _push2(`<li class="flex items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-plus-circle",
                  class: "text-green-400 shrink-0"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(field.label)} will be filled: &quot;${ssrInterpolate(field.value)}&quot; </li>`);
              });
              _push2(`<!--]-->`);
              if (unref(duplicate)?.newsletter && !unref(primary)?.newsletter) {
                _push2(`<li class="flex items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-mail",
                  class: "text-green-400 shrink-0"
                }, null, _parent2, _scopeId));
                _push2(` Newsletter subscription will be preserved </li>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(duplicateEventCount) === 0 && unref(fieldsToFill).length === 0) {
                _push2(`<li class="text-parchment/50"${_scopeId}> No additional data to transfer (duplicate will simply be removed) </li>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</ul></div><p class="text-xs text-red-400"${_scopeId}> This action cannot be undone. The duplicate customer record will be permanently deleted. </p></div>`);
            }
          } else {
            return [
              unref(step) === "select" ? (openBlock(), createBlock("div", {
                key: 0,
                class: "space-y-4"
              }, [
                createVNode("p", { class: "text-sm text-parchment/70" }, " Select the primary customer to keep and the duplicate to merge into it. All events, messages, and records from the duplicate will be transferred to the primary. "),
                createVNode(_component_UFormField, {
                  label: "Keep (Primary)",
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_USelectMenu, {
                      modelValue: unref(primaryId),
                      "onUpdate:modelValue": ($event) => isRef(primaryId) ? primaryId.value = $event : null,
                      items: unref(primaryOptions),
                      "value-key": "value",
                      placeholder: "Select primary customer...",
                      searchable: "",
                      class: "w-full"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                  ]),
                  _: 1
                }),
                createVNode(_component_UFormField, {
                  label: "Merge & Delete (Duplicate)",
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_USelectMenu, {
                      modelValue: unref(duplicateId),
                      "onUpdate:modelValue": ($event) => isRef(duplicateId) ? duplicateId.value = $event : null,
                      items: unref(duplicateOptions),
                      "value-key": "value",
                      placeholder: "Select duplicate customer...",
                      searchable: "",
                      class: "w-full"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                  ]),
                  _: 1
                })
              ])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "space-y-4"
              }, [
                createVNode("div", { class: "bg-charcoal rounded-lg border border-brown/30 p-3" }, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Keeping"),
                  createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(displayName(unref(primary))), 1),
                  unref(primary)?.email ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "text-xs text-parchment/50"
                  }, toDisplayString(unref(primary).email), 1)) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "flex justify-center" }, [
                  createVNode(_component_UIcon, {
                    name: "i-lucide-arrow-up",
                    class: "text-copper text-lg"
                  })
                ]),
                createVNode("div", { class: "bg-charcoal rounded-lg border border-red-500/30 p-3" }, [
                  createVNode("div", { class: "text-xs text-red-400 uppercase tracking-wider mb-2" }, "Merging & Deleting"),
                  createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(displayName(unref(duplicate))), 1),
                  unref(duplicate)?.email ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "text-xs text-parchment/50"
                  }, toDisplayString(unref(duplicate).email), 1)) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "bg-charcoal rounded-lg border border-brown/30 p-3 space-y-2" }, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, "What will happen"),
                  createVNode("ul", { class: "text-sm text-parchment/80 space-y-1" }, [
                    unref(duplicateEventCount) > 0 ? (openBlock(), createBlock("li", {
                      key: 0,
                      class: "flex items-center gap-2"
                    }, [
                      createVNode(_component_UIcon, {
                        name: "i-lucide-calendar",
                        class: "text-copper shrink-0"
                      }),
                      createTextVNode(" " + toDisplayString(unref(duplicateEventCount)) + " event(s) will be transferred ", 1)
                    ])) : createCommentVNode("", true),
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(fieldsToFill), (field) => {
                      return openBlock(), createBlock("li", {
                        key: field.label,
                        class: "flex items-center gap-2"
                      }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-plus-circle",
                          class: "text-green-400 shrink-0"
                        }),
                        createTextVNode(" " + toDisplayString(field.label) + ' will be filled: "' + toDisplayString(field.value) + '" ', 1)
                      ]);
                    }), 128)),
                    unref(duplicate)?.newsletter && !unref(primary)?.newsletter ? (openBlock(), createBlock("li", {
                      key: 1,
                      class: "flex items-center gap-2"
                    }, [
                      createVNode(_component_UIcon, {
                        name: "i-lucide-mail",
                        class: "text-green-400 shrink-0"
                      }),
                      createTextVNode(" Newsletter subscription will be preserved ")
                    ])) : createCommentVNode("", true),
                    unref(duplicateEventCount) === 0 && unref(fieldsToFill).length === 0 ? (openBlock(), createBlock("li", {
                      key: 2,
                      class: "text-parchment/50"
                    }, " No additional data to transfer (duplicate will simply be removed) ")) : createCommentVNode("", true)
                  ])
                ]),
                createVNode("p", { class: "text-xs text-red-400" }, " This action cannot be undone. The duplicate customer record will be permanently deleted. ")
              ]))
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-end gap-2"${_scopeId}>`);
            if (unref(step) === "preview") {
              _push2(ssrRenderComponent(_component_UButton, {
                color: "neutral",
                variant: "outline",
                onClick: goBack
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Back`);
                  } else {
                    return [
                      createTextVNode("Back")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_UButton, {
                color: "neutral",
                variant: "outline",
                onClick: ($event) => emit("close", false)
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
            }
            if (unref(step) === "select") {
              _push2(ssrRenderComponent(_component_UButton, {
                disabled: !unref(canProceed),
                onClick: goToPreview
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Preview Merge `);
                  } else {
                    return [
                      createTextVNode(" Preview Merge ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_UButton, {
                color: "error",
                loading: unref(merging),
                onClick: confirmMerge
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Confirm Merge `);
                  } else {
                    return [
                      createTextVNode(" Confirm Merge ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex justify-end gap-2" }, [
                unref(step) === "preview" ? (openBlock(), createBlock(_component_UButton, {
                  key: 0,
                  color: "neutral",
                  variant: "outline",
                  onClick: goBack
                }, {
                  default: withCtx(() => [
                    createTextVNode("Back")
                  ]),
                  _: 1
                })) : (openBlock(), createBlock(_component_UButton, {
                  key: 1,
                  color: "neutral",
                  variant: "outline",
                  onClick: ($event) => emit("close", false)
                }, {
                  default: withCtx(() => [
                    createTextVNode("Cancel")
                  ]),
                  _: 1
                }, 8, ["onClick"])),
                unref(step) === "select" ? (openBlock(), createBlock(_component_UButton, {
                  key: 2,
                  disabled: !unref(canProceed),
                  onClick: goToPreview
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Preview Merge ")
                  ]),
                  _: 1
                }, 8, ["disabled"])) : (openBlock(), createBlock(_component_UButton, {
                  key: 3,
                  color: "error",
                  loading: unref(merging),
                  onClick: confirmMerge
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Confirm Merge ")
                  ]),
                  _: 1
                }, 8, ["loading"]))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Modal/ModalMergeCustomers.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ModalMergeCustomers = Object.assign(_sfc_main, { __name: "ModalMergeCustomers" });

export { ModalMergeCustomers as default };
//# sourceMappingURL=ModalMergeCustomers-CvRZnF8R.mjs.map
