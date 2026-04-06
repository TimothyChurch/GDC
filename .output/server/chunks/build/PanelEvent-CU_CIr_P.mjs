import { _ as _sfc_main$1 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$2 } from './Form-DifyhlgS.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$5 } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$6 } from './Switch-BH6j8VnQ.mjs';
import { _ as _sfc_main$7 } from './Textarea-f7RIzcnS.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, toDisplayString, createTextVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import * as yup from 'yup';
import { u as useEventStore } from './useEventStore-LoZhbbHY.mjs';
import { u as useFormPanel } from './useFormPanel-DspW7Iuy.mjs';
import { E as EVENT_TYPES, a as EVENT_STATUS_OPTIONS } from './definitions-C7fnFA_u.mjs';
import 'reka-ui';
import '../nitro/nitro.mjs';
import 'mongoose';
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
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useSettingsStore-CJPFEN69.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelEvent",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const schema = yup.object({
      date: yup.string().required("Date is required"),
      type: yup.string().required("Type is required"),
      groupSize: yup.number().min(0, "Must be 0 or greater"),
      status: yup.string().required("Status is required")
    });
    const eventStore = useEventStore();
    if (!eventStore.event.addOns) eventStore.event.addOns = [];
    if (eventStore.event.date) {
      const d = new Date(eventStore.event.date);
      if (!isNaN(d.getTime())) {
        eventStore.event.date = d.toISOString().split("T")[0];
      }
    }
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => eventStore.event,
      async onSave(data) {
        Object.assign(eventStore.event, data);
        await eventStore.updateEvent();
      },
      onClose: () => emit("close", true)
    });
    const isNew = !localData.value._id;
    function addAddOn() {
      if (!localData.value.addOns) localData.value.addOns = [];
      localData.value.addOns.push({ name: "", price: 0, description: "" });
    }
    function removeAddOn(idx) {
      localData.value.addOns?.splice(idx, 1);
    }
    const typeOptions = EVENT_TYPES;
    const statusOptions = EVENT_STATUS_OPTIONS;
    const contactDisplay = computed(() => {
      const c = localData.value;
      if (c._contactName) return c._contactName;
      if (typeof c.contact === "object" && c.contact) {
        const ct = c.contact;
        return ct.businessName || `${ct.firstName || ""} ${ct.lastName || ""}`.trim();
      }
      return "";
    });
    const contactEmail = computed(() => {
      const c = localData.value;
      if (typeof c.contact === "object" && c.contact) {
        return c.contact.email || "";
      }
      return "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$2;
      const _component_UFormField = _sfc_main$3;
      const _component_UInput = _sfc_main$4;
      const _component_USelect = _sfc_main$5;
      const _component_USwitch = _sfc_main$6;
      const _component_UTextarea = _sfc_main$7;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(isNew ? "New Event" : "Edit Event")}</h2>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-x",
              color: "neutral",
              variant: "ghost",
              onClick: unref(cancel)
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_UForm, {
              schema: unref(schema),
              state: unref(localData),
              onSubmit: unref(save),
              class: "flex flex-col flex-1 min-h-0"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex-1 overflow-y-auto p-4 space-y-4"${_scopeId2}>`);
                  if (unref(contactDisplay)) {
                    _push3(`<div class="bg-brown/10 rounded-lg p-3 border border-brown/20"${_scopeId2}><span class="text-xs text-parchment/50 uppercase tracking-wider block mb-1"${_scopeId2}>Contact</span><div class="text-sm font-medium text-parchment"${_scopeId2}>${ssrInterpolate(unref(contactDisplay))}</div>`);
                    if (unref(contactEmail)) {
                      _push3(`<div class="text-xs text-parchment/60"${_scopeId2}>${ssrInterpolate(unref(contactEmail))}</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Date",
                    name: "date"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).date,
                          "onUpdate:modelValue": ($event) => unref(localData).date = $event,
                          type: "date"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).date,
                            "onUpdate:modelValue": ($event) => unref(localData).date = $event,
                            type: "date"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (unref(localData).type !== "Cocktail Class") {
                    _push3(ssrRenderComponent(_component_UFormField, {
                      label: "Group Size",
                      name: "groupSize"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_UInput, {
                            modelValue: unref(localData).groupSize,
                            "onUpdate:modelValue": ($event) => unref(localData).groupSize = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            min: "1"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).groupSize,
                              "onUpdate:modelValue": ($event) => unref(localData).groupSize = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              min: "1"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Type",
                    name: "type"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).type,
                          "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                          items: unref(typeOptions)
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: unref(typeOptions)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Status",
                    name: "status"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).status,
                          "onUpdate:modelValue": ($event) => unref(localData).status = $event,
                          items: unref(statusOptions)
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).status,
                            "onUpdate:modelValue": ($event) => unref(localData).status = $event,
                            items: unref(statusOptions)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Capacity" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).capacity,
                          "onUpdate:modelValue": ($event) => unref(localData).capacity = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          min: "1",
                          placeholder: "Max seats (for public classes)"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).capacity,
                            "onUpdate:modelValue": ($event) => unref(localData).capacity = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            min: "1",
                            placeholder: "Max seats (for public classes)"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Public Visibility" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="flex items-center gap-3"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_USwitch, {
                          modelValue: unref(localData).isPublic,
                          "onUpdate:modelValue": ($event) => unref(localData).isPublic = $event
                        }, null, _parent4, _scopeId3));
                        _push4(`<span class="text-sm text-parchment/70"${_scopeId3}>${ssrInterpolate(unref(localData).isPublic ? "Visible on public website" : "Hidden from public website")}</span></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "flex items-center gap-3" }, [
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).isPublic,
                              "onUpdate:modelValue": ($event) => unref(localData).isPublic = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode("span", { class: "text-sm text-parchment/70" }, toDisplayString(unref(localData).isPublic ? "Visible on public website" : "Hidden from public website"), 1)
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Price per Person ($)" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).price,
                          "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          min: "0",
                          step: "0.01",
                          placeholder: "e.g. 75.00"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).price,
                            "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            min: "0",
                            step: "0.01",
                            placeholder: "e.g. 75.00"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="space-y-3"${_scopeId2}><div class="flex items-center justify-between"${_scopeId2}><span class="text-sm font-medium text-parchment/70"${_scopeId2}>Add-ons</span>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    size: "xs",
                    icon: "i-lucide-plus",
                    variant: "outline",
                    onClick: addAddOn
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Add`);
                      } else {
                        return [
                          createTextVNode("Add")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><!--[-->`);
                  ssrRenderList(unref(localData).addOns, (addOn, idx) => {
                    _push3(`<div class="flex gap-2 items-start"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_UInput, {
                      modelValue: addOn.name,
                      "onUpdate:modelValue": ($event) => addOn.name = $event,
                      placeholder: "Name",
                      class: "flex-1"
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UInput, {
                      modelValue: addOn.price,
                      "onUpdate:modelValue": ($event) => addOn.price = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      step: "0.01",
                      placeholder: "Price ($)",
                      class: "w-28"
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UInput, {
                      modelValue: addOn.description,
                      "onUpdate:modelValue": ($event) => addOn.description = $event,
                      placeholder: "Description",
                      class: "flex-1"
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UButton, {
                      icon: "i-lucide-x",
                      color: "error",
                      variant: "ghost",
                      size: "xs",
                      onClick: ($event) => removeAddOn(idx)
                    }, null, _parent3, _scopeId2));
                    _push3(`</div>`);
                  });
                  _push3(`<!--]-->`);
                  if (!unref(localData).addOns?.length) {
                    _push3(`<p class="text-xs text-parchment/40"${_scopeId2}>No add-ons configured</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Notes" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UTextarea, {
                          modelValue: unref(localData).notes,
                          "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                          rows: "3",
                          placeholder: "Additional notes..."
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).notes,
                            "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                            rows: "3",
                            placeholder: "Additional notes..."
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    color: "neutral",
                    variant: "outline",
                    onClick: unref(cancel)
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Cancel`);
                      } else {
                        return [
                          createTextVNode("Cancel")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    type: "submit",
                    loading: unref(saving),
                    disabled: !unref(isDirty)
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(isNew ? "Create" : "Save")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(isNew ? "Create" : "Save"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex-1 overflow-y-auto p-4 space-y-4" }, [
                      unref(contactDisplay) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "bg-brown/10 rounded-lg p-3 border border-brown/20"
                      }, [
                        createVNode("span", { class: "text-xs text-parchment/50 uppercase tracking-wider block mb-1" }, "Contact"),
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(unref(contactDisplay)), 1),
                        unref(contactEmail) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "text-xs text-parchment/60"
                        }, toDisplayString(unref(contactEmail)), 1)) : createCommentVNode("", true)
                      ])) : createCommentVNode("", true),
                      createVNode(_component_UFormField, {
                        label: "Date",
                        name: "date"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).date,
                            "onUpdate:modelValue": ($event) => unref(localData).date = $event,
                            type: "date"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      unref(localData).type !== "Cocktail Class" ? (openBlock(), createBlock(_component_UFormField, {
                        key: 1,
                        label: "Group Size",
                        name: "groupSize"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).groupSize,
                            "onUpdate:modelValue": ($event) => unref(localData).groupSize = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            min: "1"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      })) : createCommentVNode("", true),
                      createVNode(_component_UFormField, {
                        label: "Type",
                        name: "type"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: unref(typeOptions)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Status",
                        name: "status"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).status,
                            "onUpdate:modelValue": ($event) => unref(localData).status = $event,
                            items: unref(statusOptions)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Capacity" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).capacity,
                            "onUpdate:modelValue": ($event) => unref(localData).capacity = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            min: "1",
                            placeholder: "Max seats (for public classes)"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Public Visibility" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "flex items-center gap-3" }, [
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).isPublic,
                              "onUpdate:modelValue": ($event) => unref(localData).isPublic = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode("span", { class: "text-sm text-parchment/70" }, toDisplayString(unref(localData).isPublic ? "Visible on public website" : "Hidden from public website"), 1)
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Price per Person ($)" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).price,
                            "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            min: "0",
                            step: "0.01",
                            placeholder: "e.g. 75.00"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "space-y-3" }, [
                        createVNode("div", { class: "flex items-center justify-between" }, [
                          createVNode("span", { class: "text-sm font-medium text-parchment/70" }, "Add-ons"),
                          createVNode(_component_UButton, {
                            size: "xs",
                            icon: "i-lucide-plus",
                            variant: "outline",
                            onClick: addAddOn
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Add")
                            ]),
                            _: 1
                          })
                        ]),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).addOns, (addOn, idx) => {
                          return openBlock(), createBlock("div", {
                            key: idx,
                            class: "flex gap-2 items-start"
                          }, [
                            createVNode(_component_UInput, {
                              modelValue: addOn.name,
                              "onUpdate:modelValue": ($event) => addOn.name = $event,
                              placeholder: "Name",
                              class: "flex-1"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(_component_UInput, {
                              modelValue: addOn.price,
                              "onUpdate:modelValue": ($event) => addOn.price = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              step: "0.01",
                              placeholder: "Price ($)",
                              class: "w-28"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(_component_UInput, {
                              modelValue: addOn.description,
                              "onUpdate:modelValue": ($event) => addOn.description = $event,
                              placeholder: "Description",
                              class: "flex-1"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(_component_UButton, {
                              icon: "i-lucide-x",
                              color: "error",
                              variant: "ghost",
                              size: "xs",
                              onClick: ($event) => removeAddOn(idx)
                            }, null, 8, ["onClick"])
                          ]);
                        }), 128)),
                        !unref(localData).addOns?.length ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "text-xs text-parchment/40"
                        }, "No add-ons configured")) : createCommentVNode("", true)
                      ]),
                      createVNode(_component_UFormField, { label: "Notes" }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).notes,
                            "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                            rows: "3",
                            placeholder: "Additional notes..."
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode("div", { class: "flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10" }, [
                      createVNode(_component_UButton, {
                        color: "neutral",
                        variant: "outline",
                        onClick: unref(cancel)
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_UButton, {
                        type: "submit",
                        loading: unref(saving),
                        disabled: !unref(isDirty)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(isNew ? "Create" : "Save"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading", "disabled"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col h-full w-full sm:max-w-lg" }, [
                createVNode("div", { class: "flex items-center justify-between px-4 py-3 border-b border-white/10" }, [
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(isNew ? "New Event" : "Edit Event"), 1),
                  createVNode(_component_UButton, {
                    icon: "i-lucide-x",
                    color: "neutral",
                    variant: "ghost",
                    onClick: unref(cancel)
                  }, null, 8, ["onClick"])
                ]),
                createVNode(_component_UForm, {
                  schema: unref(schema),
                  state: unref(localData),
                  onSubmit: unref(save),
                  class: "flex flex-col flex-1 min-h-0"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "flex-1 overflow-y-auto p-4 space-y-4" }, [
                      unref(contactDisplay) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "bg-brown/10 rounded-lg p-3 border border-brown/20"
                      }, [
                        createVNode("span", { class: "text-xs text-parchment/50 uppercase tracking-wider block mb-1" }, "Contact"),
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(unref(contactDisplay)), 1),
                        unref(contactEmail) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "text-xs text-parchment/60"
                        }, toDisplayString(unref(contactEmail)), 1)) : createCommentVNode("", true)
                      ])) : createCommentVNode("", true),
                      createVNode(_component_UFormField, {
                        label: "Date",
                        name: "date"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).date,
                            "onUpdate:modelValue": ($event) => unref(localData).date = $event,
                            type: "date"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      unref(localData).type !== "Cocktail Class" ? (openBlock(), createBlock(_component_UFormField, {
                        key: 1,
                        label: "Group Size",
                        name: "groupSize"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).groupSize,
                            "onUpdate:modelValue": ($event) => unref(localData).groupSize = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            min: "1"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      })) : createCommentVNode("", true),
                      createVNode(_component_UFormField, {
                        label: "Type",
                        name: "type"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: unref(typeOptions)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Status",
                        name: "status"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).status,
                            "onUpdate:modelValue": ($event) => unref(localData).status = $event,
                            items: unref(statusOptions)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Capacity" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).capacity,
                            "onUpdate:modelValue": ($event) => unref(localData).capacity = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            min: "1",
                            placeholder: "Max seats (for public classes)"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Public Visibility" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "flex items-center gap-3" }, [
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).isPublic,
                              "onUpdate:modelValue": ($event) => unref(localData).isPublic = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode("span", { class: "text-sm text-parchment/70" }, toDisplayString(unref(localData).isPublic ? "Visible on public website" : "Hidden from public website"), 1)
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Price per Person ($)" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).price,
                            "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            min: "0",
                            step: "0.01",
                            placeholder: "e.g. 75.00"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "space-y-3" }, [
                        createVNode("div", { class: "flex items-center justify-between" }, [
                          createVNode("span", { class: "text-sm font-medium text-parchment/70" }, "Add-ons"),
                          createVNode(_component_UButton, {
                            size: "xs",
                            icon: "i-lucide-plus",
                            variant: "outline",
                            onClick: addAddOn
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Add")
                            ]),
                            _: 1
                          })
                        ]),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).addOns, (addOn, idx) => {
                          return openBlock(), createBlock("div", {
                            key: idx,
                            class: "flex gap-2 items-start"
                          }, [
                            createVNode(_component_UInput, {
                              modelValue: addOn.name,
                              "onUpdate:modelValue": ($event) => addOn.name = $event,
                              placeholder: "Name",
                              class: "flex-1"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(_component_UInput, {
                              modelValue: addOn.price,
                              "onUpdate:modelValue": ($event) => addOn.price = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              step: "0.01",
                              placeholder: "Price ($)",
                              class: "w-28"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(_component_UInput, {
                              modelValue: addOn.description,
                              "onUpdate:modelValue": ($event) => addOn.description = $event,
                              placeholder: "Description",
                              class: "flex-1"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(_component_UButton, {
                              icon: "i-lucide-x",
                              color: "error",
                              variant: "ghost",
                              size: "xs",
                              onClick: ($event) => removeAddOn(idx)
                            }, null, 8, ["onClick"])
                          ]);
                        }), 128)),
                        !unref(localData).addOns?.length ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "text-xs text-parchment/40"
                        }, "No add-ons configured")) : createCommentVNode("", true)
                      ]),
                      createVNode(_component_UFormField, { label: "Notes" }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).notes,
                            "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                            rows: "3",
                            placeholder: "Additional notes..."
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode("div", { class: "flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10" }, [
                      createVNode(_component_UButton, {
                        color: "neutral",
                        variant: "outline",
                        onClick: unref(cancel)
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_UButton, {
                        type: "submit",
                        loading: unref(saving),
                        disabled: !unref(isDirty)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(isNew ? "Create" : "Save"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading", "disabled"])
                    ])
                  ]),
                  _: 1
                }, 8, ["schema", "state", "onSubmit"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelEvent.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PanelEvent = Object.assign(_sfc_main, { __name: "PanelEvent" });

export { PanelEvent as default };
//# sourceMappingURL=PanelEvent-CU_CIr_P.mjs.map
