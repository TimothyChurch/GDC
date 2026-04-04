import { _ as _sfc_main$1 } from './Modal-GBrZNdlF.mjs';
import { m as useToast, e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$2 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$3 } from './SelectMenu-DljUyjmT.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, unref, createVNode, isRef, toDisplayString, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "ModalLinkEvent",
  __ssrInlineRender: true,
  props: {
    contactId: {},
    contactName: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const eventStore = useEventStore();
    const toast = useToast();
    const linking = ref(false);
    const selectedEventId = ref("");
    const unlinkedEvents = computed(
      () => eventStore.events.filter((e) => {
        const contactRef = typeof e.contact === "object" && e.contact ? e.contact._id : e.contact;
        return !contactRef;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    const eventOptions = computed(
      () => unlinkedEvents.value.map((e) => ({
        label: `${formatDate(e.date)} — ${e.type} (${e.status})`,
        value: e._id
      }))
    );
    function formatDate(val) {
      if (!val) return "—";
      return new Date(val).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    async function linkEvent() {
      if (!selectedEventId.value) return;
      linking.value = true;
      try {
        await $fetch(`/api/event/${selectedEventId.value}`, {
          method: "PUT",
          body: { contact: props.contactId }
        });
        const idx = eventStore.events.findIndex((e) => e._id === selectedEventId.value);
        if (idx !== -1) {
          eventStore.events[idx] = { ...eventStore.events[idx], contact: props.contactId };
        }
        toast.add({
          title: "Event linked",
          description: `Event linked to ${props.contactName}`,
          color: "success",
          icon: "i-lucide-link"
        });
        emit("close", true);
      } catch {
        toast.add({
          title: "Failed to link event",
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        linking.value = false;
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
              name: "i-lucide-link",
              class: "text-copper size-5"
            }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}>Link Existing Event</span></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2" }, [
                createVNode(_component_UIcon, {
                  name: "i-lucide-link",
                  class: "text-copper size-5"
                }),
                createVNode("span", null, "Link Existing Event")
              ])
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p class="text-sm text-parchment/70 mb-4"${_scopeId}> Select an unlinked event to associate with <strong${_scopeId}>${ssrInterpolate(__props.contactName)}</strong>. </p>`);
            if (unref(eventOptions).length > 0) {
              _push2(ssrRenderComponent(_component_UFormField, { label: "Event" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_USelectMenu, {
                      modelValue: unref(selectedEventId),
                      "onUpdate:modelValue": ($event) => isRef(selectedEventId) ? selectedEventId.value = $event : null,
                      items: unref(eventOptions),
                      "value-key": "value",
                      placeholder: "Select an event...",
                      searchable: "",
                      class: "w-full"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_USelectMenu, {
                        modelValue: unref(selectedEventId),
                        "onUpdate:modelValue": ($event) => isRef(selectedEventId) ? selectedEventId.value = $event : null,
                        items: unref(eventOptions),
                        "value-key": "value",
                        placeholder: "Select an event...",
                        searchable: "",
                        class: "w-full"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<div class="text-center py-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-calendar-x",
                class: "text-2xl text-parchment/20 mx-auto mb-2"
              }, null, _parent2, _scopeId));
              _push2(`<p class="text-sm text-parchment/50"${_scopeId}>No unlinked events available</p></div>`);
            }
          } else {
            return [
              createVNode("p", { class: "text-sm text-parchment/70 mb-4" }, [
                createTextVNode(" Select an unlinked event to associate with "),
                createVNode("strong", null, toDisplayString(__props.contactName), 1),
                createTextVNode(". ")
              ]),
              unref(eventOptions).length > 0 ? (openBlock(), createBlock(_component_UFormField, {
                key: 0,
                label: "Event"
              }, {
                default: withCtx(() => [
                  createVNode(_component_USelectMenu, {
                    modelValue: unref(selectedEventId),
                    "onUpdate:modelValue": ($event) => isRef(selectedEventId) ? selectedEventId.value = $event : null,
                    items: unref(eventOptions),
                    "value-key": "value",
                    placeholder: "Select an event...",
                    searchable: "",
                    class: "w-full"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                ]),
                _: 1
              })) : (openBlock(), createBlock("div", {
                key: 1,
                class: "text-center py-4"
              }, [
                createVNode(_component_UIcon, {
                  name: "i-lucide-calendar-x",
                  class: "text-2xl text-parchment/20 mx-auto mb-2"
                }),
                createVNode("p", { class: "text-sm text-parchment/50" }, "No unlinked events available")
              ]))
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-end gap-2"${_scopeId}>`);
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
            _push2(ssrRenderComponent(_component_UButton, {
              disabled: !unref(selectedEventId) || unref(eventOptions).length === 0,
              loading: unref(linking),
              onClick: linkEvent
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Link Event `);
                } else {
                  return [
                    createTextVNode(" Link Event ")
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
                  color: "neutral",
                  variant: "outline",
                  onClick: ($event) => emit("close", false)
                }, {
                  default: withCtx(() => [
                    createTextVNode("Cancel")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  disabled: !unref(selectedEventId) || unref(eventOptions).length === 0,
                  loading: unref(linking),
                  onClick: linkEvent
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Link Event ")
                  ]),
                  _: 1
                }, 8, ["disabled", "loading"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Modal/ModalLinkEvent.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ModalLinkEvent = Object.assign(_sfc_main, { __name: "ModalLinkEvent" });

export { ModalLinkEvent as default };
//# sourceMappingURL=ModalLinkEvent-05jiWIIW.mjs.map
