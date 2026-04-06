import { _ as _sfc_main$1 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$2 } from './Form-DifyhlgS.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$4 } from './SiteDatePicker-pVMyeD61.mjs';
import { _ as _sfc_main$5 } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$6 } from './Input-Fd8Vd_4J.mjs';
import { _ as __nuxt_component_8 } from './BaseItemSelect-8IgvW2BX.mjs';
import { _ as _sfc_main$7 } from './Switch-BH6j8VnQ.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { b as allUnits } from './units-DWysHFem.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createVNode, createTextVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import * as yup from 'yup';
import { b as usePurchaseOrderStore, u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useFormPanel } from './useFormPanel-DspW7Iuy.mjs';
import { P as PO_STATUS_OPTIONS } from './definitions-C7fnFA_u.mjs';
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
import './Popover-BvOOk09Z.mjs';
import 'reka-ui/namespaced';
import './FieldGroup-bwPzB93U.mjs';
import 'v-calendar';
import 'date-fns';
import './SelectMenu-DljUyjmT.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelPurchaseOrder",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const schema = yup.object({
      date: yup.string().required("Date is required"),
      vendor: yup.string().required("Vendor is required"),
      status: yup.string().required("Status is required")
    });
    const purchaseOrderStore = usePurchaseOrderStore();
    const contactStore = useContactStore();
    const itemStore = useItemStore();
    const originalStatus = purchaseOrderStore.purchaseOrder.status;
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => purchaseOrderStore.purchaseOrder,
      async onSave(data) {
        data.total = total.value;
        const statusChangedToDelivered = data.status === "Delivered" && originalStatus !== "Delivered";
        Object.assign(purchaseOrderStore.purchaseOrder, data);
        const result = await purchaseOrderStore.updatePurchaseOrder();
        result.items.forEach((item) => {
          const foundItem = itemStore.items.find((i) => i._id === item.item);
          if (foundItem) {
            if (!foundItem.purchaseHistory?.includes(result._id)) {
              itemStore.item = foundItem;
              itemStore.item.purchaseHistory?.push(result._id);
              itemStore.updateItem();
            }
          }
        });
        if (statusChangedToDelivered) {
          await purchaseOrderStore.receivePurchaseOrder(result._id);
        }
      },
      onClose: () => emit("close", true)
    });
    const isNew = !localData.value._id;
    const isMarkingDelivered = computed(
      () => localData.value.status === "Delivered" && originalStatus !== "Delivered"
    );
    const statusOptions = PO_STATUS_OPTIONS;
    const subtotal = computed(
      () => localData.value.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    );
    const totalTax = computed(() => {
      const rate = localData.value.taxRate || 0;
      return localData.value.items.reduce(
        (sum, item) => {
          if (!item.taxable) return sum;
          return sum + item.price * item.quantity * rate;
        },
        0
      );
    });
    const total = computed(
      () => subtotal.value + totalTax.value + (localData.value.shipping || 0)
    );
    const newItem = ref({
      item: "",
      quantity: 0,
      size: 0,
      sizeUnit: "",
      price: 0,
      taxable: false,
      brand: ""
    });
    const addItem = () => {
      localData.value.items.push({
        ...newItem.value
      });
      newItem.value = {
        item: "",
        quantity: 0,
        size: 0,
        sizeUnit: "",
        price: 0,
        taxable: false,
        brand: ""
      };
    };
    const removeItem = (index) => {
      localData.value.items.splice(index, 1);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$2;
      const _component_UFormField = _sfc_main$3;
      const _component_SiteDatePicker = _sfc_main$4;
      const _component_USelect = _sfc_main$5;
      const _component_UInput = _sfc_main$6;
      const _component_UIcon = _sfc_main$e;
      const _component_BaseItemSelect = __nuxt_component_8;
      const _component_USwitch = _sfc_main$7;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(isNew ? "New Purchase Order" : "Edit Purchase Order")}</h2>`);
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
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Date",
                    name: "date"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_SiteDatePicker, {
                          modelValue: unref(localData).date,
                          "onUpdate:modelValue": ($event) => unref(localData).date = $event
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_SiteDatePicker, {
                            modelValue: unref(localData).date,
                            "onUpdate:modelValue": ($event) => unref(localData).date = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="grid grid-cols-2 gap-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Status",
                    name: "status"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).status,
                          "onUpdate:modelValue": ($event) => unref(localData).status = $event,
                          items: unref(statusOptions),
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).status,
                            "onUpdate:modelValue": ($event) => unref(localData).status = $event,
                            items: unref(statusOptions),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Vendor",
                    name: "vendor"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).vendor,
                          "onUpdate:modelValue": ($event) => unref(localData).vendor = $event,
                          items: unref(contactStore).contacts.map((c) => ({
                            label: c.businessName || `${c.firstName} ${c.lastName}`,
                            value: c._id
                          })),
                          "value-key": "value",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).vendor,
                            "onUpdate:modelValue": ($event) => unref(localData).vendor = $event,
                            items: unref(contactStore).contacts.map((c) => ({
                              label: c.businessName || `${c.firstName} ${c.lastName}`,
                              value: c._id
                            })),
                            "value-key": "value",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="grid grid-cols-2 gap-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Tax Rate (%)",
                    name: "taxRate"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          "model-value": ((unref(localData).taxRate || 0) * 100).toFixed(2),
                          "onUpdate:modelValue": (v) => unref(localData).taxRate = parseFloat(v) / 100 || 0,
                          type: "number",
                          step: "0.01",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            "model-value": ((unref(localData).taxRate || 0) * 100).toFixed(2),
                            "onUpdate:modelValue": (v) => unref(localData).taxRate = parseFloat(v) / 100 || 0,
                            type: "number",
                            step: "0.01",
                            class: "w-full"
                          }, null, 8, ["model-value", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Shipping ($)",
                    name: "shipping"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).shipping,
                          "onUpdate:modelValue": ($event) => unref(localData).shipping = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          step: "0.01",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).shipping,
                            "onUpdate:modelValue": ($event) => unref(localData).shipping = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            step: "0.01",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  if (unref(isMarkingDelivered) && unref(localData).items.length > 0) {
                    _push3(`<div class="flex items-start gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_UIcon, {
                      name: "i-lucide-package-check",
                      class: "text-green-400 shrink-0 mt-0.5"
                    }, null, _parent3, _scopeId2));
                    _push3(`<div class="text-xs text-parchment/70"${_scopeId2}><span class="font-semibold text-green-400"${_scopeId2}>Inventory will be updated automatically</span> when this order is saved as Delivered. Stock levels for ${ssrInterpolate(unref(localData).items.length)} item${ssrInterpolate(unref(localData).items.length !== 1 ? "s" : "")} will be increased based on the order quantities. </div></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Items" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="space-y-2"${_scopeId3}><!--[-->`);
                        ssrRenderList(unref(localData).items, (item, index) => {
                          _push4(`<div class="flex items-center justify-between gap-2 text-sm"${_scopeId3}><div class="flex-1 min-w-0"${_scopeId3}><span class="truncate block"${_scopeId3}>${ssrInterpolate(unref(itemStore).items.find((i) => i._id === item.item)?.name)}</span>`);
                          if (item.brand) {
                            _push4(`<span class="text-xs text-parchment/60"${_scopeId3}>${ssrInterpolate(item.brand)}</span>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`</div>`);
                          if (item.taxable) {
                            _push4(`<span class="text-[10px] font-semibold text-amber bg-amber/15 border border-amber/25 px-1.5 py-0.5 rounded-full shrink-0"${_scopeId3}>TAX</span>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`<span class="text-parchment/60 shrink-0"${_scopeId3}>${ssrInterpolate(item.quantity)} x ${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price))}</span>`);
                          _push4(ssrRenderComponent(_component_UButton, {
                            icon: "i-lucide-trash-2",
                            color: "error",
                            variant: "ghost",
                            size: "xs",
                            onClick: ($event) => removeItem(index)
                          }, null, _parent4, _scopeId3));
                          _push4(`</div>`);
                        });
                        _push4(`<!--]--><div class="space-y-2 border border-white/10 rounded p-2"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_BaseItemSelect, {
                          modelValue: unref(newItem).item,
                          "onUpdate:modelValue": ($event) => unref(newItem).item = $event,
                          placeholder: "Select item",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(newItem).brand,
                          "onUpdate:modelValue": ($event) => unref(newItem).brand = $event,
                          placeholder: "Brand (optional)",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                        _push4(`<div class="grid grid-cols-4 gap-2"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(newItem).quantity,
                          "onUpdate:modelValue": ($event) => unref(newItem).quantity = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          placeholder: "Qty"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(newItem).size,
                          "onUpdate:modelValue": ($event) => unref(newItem).size = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          placeholder: "Size"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(newItem).sizeUnit,
                          "onUpdate:modelValue": ($event) => unref(newItem).sizeUnit = $event,
                          items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                          placeholder: "Unit"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(newItem).price,
                          "onUpdate:modelValue": ($event) => unref(newItem).price = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          placeholder: "Price"
                        }, null, _parent4, _scopeId3));
                        _push4(`</div><label class="flex items-center gap-2 text-sm text-parchment/70 cursor-pointer"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_USwitch, {
                          modelValue: unref(newItem).taxable,
                          "onUpdate:modelValue": ($event) => unref(newItem).taxable = $event,
                          size: "sm"
                        }, null, _parent4, _scopeId3));
                        _push4(`<span${_scopeId3}>Taxable</span></label>`);
                        _push4(ssrRenderComponent(_component_UButton, {
                          onClick: addItem,
                          icon: "i-lucide-plus",
                          size: "sm",
                          variant: "outline",
                          class: "w-full"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Add Item`);
                            } else {
                              return [
                                createTextVNode("Add Item")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`</div></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).items, (item, index) => {
                              return openBlock(), createBlock("div", {
                                key: index,
                                class: "flex items-center justify-between gap-2 text-sm"
                              }, [
                                createVNode("div", { class: "flex-1 min-w-0" }, [
                                  createVNode("span", { class: "truncate block" }, toDisplayString(unref(itemStore).items.find((i) => i._id === item.item)?.name), 1),
                                  item.brand ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "text-xs text-parchment/60"
                                  }, toDisplayString(item.brand), 1)) : createCommentVNode("", true)
                                ]),
                                item.taxable ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-[10px] font-semibold text-amber bg-amber/15 border border-amber/25 px-1.5 py-0.5 rounded-full shrink-0"
                                }, "TAX")) : createCommentVNode("", true),
                                createVNode("span", { class: "text-parchment/60 shrink-0" }, toDisplayString(item.quantity) + " x " + toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price)), 1),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeItem(index)
                                }, null, 8, ["onClick"])
                              ]);
                            }), 128)),
                            createVNode("div", { class: "space-y-2 border border-white/10 rounded p-2" }, [
                              createVNode(_component_BaseItemSelect, {
                                modelValue: unref(newItem).item,
                                "onUpdate:modelValue": ($event) => unref(newItem).item = $event,
                                placeholder: "Select item",
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newItem).brand,
                                "onUpdate:modelValue": ($event) => unref(newItem).brand = $event,
                                placeholder: "Brand (optional)",
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode("div", { class: "grid grid-cols-4 gap-2" }, [
                                createVNode(_component_UInput, {
                                  modelValue: unref(newItem).quantity,
                                  "onUpdate:modelValue": ($event) => unref(newItem).quantity = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Qty"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_UInput, {
                                  modelValue: unref(newItem).size,
                                  "onUpdate:modelValue": ($event) => unref(newItem).size = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Size"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelect, {
                                  modelValue: unref(newItem).sizeUnit,
                                  "onUpdate:modelValue": ($event) => unref(newItem).sizeUnit = $event,
                                  items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                                  placeholder: "Unit"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UInput, {
                                  modelValue: unref(newItem).price,
                                  "onUpdate:modelValue": ($event) => unref(newItem).price = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Price"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              createVNode("label", { class: "flex items-center gap-2 text-sm text-parchment/70 cursor-pointer" }, [
                                createVNode(_component_USwitch, {
                                  modelValue: unref(newItem).taxable,
                                  "onUpdate:modelValue": ($event) => unref(newItem).taxable = $event,
                                  size: "sm"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode("span", null, "Taxable")
                              ]),
                              createVNode(_component_UButton, {
                                onClick: addItem,
                                icon: "i-lucide-plus",
                                size: "sm",
                                variant: "outline",
                                class: "w-full"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Add Item")
                                ]),
                                _: 1
                              })
                            ])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="space-y-1 text-sm"${_scopeId2}><div class="flex justify-between text-parchment/60"${_scopeId2}><span${_scopeId2}>Subtotal</span><span${_scopeId2}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(subtotal)))}</span></div>`);
                  if (unref(totalTax) > 0) {
                    _push3(`<div class="flex justify-between text-parchment/60"${_scopeId2}><span${_scopeId2}>Tax (${ssrInterpolate(((unref(localData).taxRate || 0) * 100).toFixed(2))}%)</span><span${_scopeId2}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalTax)))}</span></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if ((unref(localData).shipping || 0) > 0) {
                    _push3(`<div class="flex justify-between text-parchment/60"${_scopeId2}><span${_scopeId2}>Shipping</span><span${_scopeId2}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(localData).shipping))}</span></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<div class="flex justify-between text-lg font-bold text-parchment pt-1 border-t border-white/10"${_scopeId2}><span${_scopeId2}>Total</span><span${_scopeId2}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(total)))}</span></div></div></div><div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"${_scopeId2}>`);
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
                        _push4(`${ssrInterpolate(isNew ? "Create" : unref(isMarkingDelivered) ? "Save & Update Inventory" : "Save")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(isNew ? "Create" : unref(isMarkingDelivered) ? "Save & Update Inventory" : "Save"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex-1 overflow-y-auto p-4 space-y-4" }, [
                      createVNode(_component_UFormField, {
                        label: "Date",
                        name: "date"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_SiteDatePicker, {
                            modelValue: unref(localData).date,
                            "onUpdate:modelValue": ($event) => unref(localData).date = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Status",
                          name: "status"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).status,
                              "onUpdate:modelValue": ($event) => unref(localData).status = $event,
                              items: unref(statusOptions),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Vendor",
                          name: "vendor"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).vendor,
                              "onUpdate:modelValue": ($event) => unref(localData).vendor = $event,
                              items: unref(contactStore).contacts.map((c) => ({
                                label: c.businessName || `${c.firstName} ${c.lastName}`,
                                value: c._id
                              })),
                              "value-key": "value",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Tax Rate (%)",
                          name: "taxRate"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              "model-value": ((unref(localData).taxRate || 0) * 100).toFixed(2),
                              "onUpdate:modelValue": (v) => unref(localData).taxRate = parseFloat(v) / 100 || 0,
                              type: "number",
                              step: "0.01",
                              class: "w-full"
                            }, null, 8, ["model-value", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Shipping ($)",
                          name: "shipping"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).shipping,
                              "onUpdate:modelValue": ($event) => unref(localData).shipping = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              step: "0.01",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      unref(isMarkingDelivered) && unref(localData).items.length > 0 ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "flex items-start gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"
                      }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-package-check",
                          class: "text-green-400 shrink-0 mt-0.5"
                        }),
                        createVNode("div", { class: "text-xs text-parchment/70" }, [
                          createVNode("span", { class: "font-semibold text-green-400" }, "Inventory will be updated automatically"),
                          createTextVNode(" when this order is saved as Delivered. Stock levels for " + toDisplayString(unref(localData).items.length) + " item" + toDisplayString(unref(localData).items.length !== 1 ? "s" : "") + " will be increased based on the order quantities. ", 1)
                        ])
                      ])) : createCommentVNode("", true),
                      createVNode(_component_UFormField, { label: "Items" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).items, (item, index) => {
                              return openBlock(), createBlock("div", {
                                key: index,
                                class: "flex items-center justify-between gap-2 text-sm"
                              }, [
                                createVNode("div", { class: "flex-1 min-w-0" }, [
                                  createVNode("span", { class: "truncate block" }, toDisplayString(unref(itemStore).items.find((i) => i._id === item.item)?.name), 1),
                                  item.brand ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "text-xs text-parchment/60"
                                  }, toDisplayString(item.brand), 1)) : createCommentVNode("", true)
                                ]),
                                item.taxable ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-[10px] font-semibold text-amber bg-amber/15 border border-amber/25 px-1.5 py-0.5 rounded-full shrink-0"
                                }, "TAX")) : createCommentVNode("", true),
                                createVNode("span", { class: "text-parchment/60 shrink-0" }, toDisplayString(item.quantity) + " x " + toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price)), 1),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeItem(index)
                                }, null, 8, ["onClick"])
                              ]);
                            }), 128)),
                            createVNode("div", { class: "space-y-2 border border-white/10 rounded p-2" }, [
                              createVNode(_component_BaseItemSelect, {
                                modelValue: unref(newItem).item,
                                "onUpdate:modelValue": ($event) => unref(newItem).item = $event,
                                placeholder: "Select item",
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newItem).brand,
                                "onUpdate:modelValue": ($event) => unref(newItem).brand = $event,
                                placeholder: "Brand (optional)",
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode("div", { class: "grid grid-cols-4 gap-2" }, [
                                createVNode(_component_UInput, {
                                  modelValue: unref(newItem).quantity,
                                  "onUpdate:modelValue": ($event) => unref(newItem).quantity = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Qty"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_UInput, {
                                  modelValue: unref(newItem).size,
                                  "onUpdate:modelValue": ($event) => unref(newItem).size = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Size"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelect, {
                                  modelValue: unref(newItem).sizeUnit,
                                  "onUpdate:modelValue": ($event) => unref(newItem).sizeUnit = $event,
                                  items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                                  placeholder: "Unit"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UInput, {
                                  modelValue: unref(newItem).price,
                                  "onUpdate:modelValue": ($event) => unref(newItem).price = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Price"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              createVNode("label", { class: "flex items-center gap-2 text-sm text-parchment/70 cursor-pointer" }, [
                                createVNode(_component_USwitch, {
                                  modelValue: unref(newItem).taxable,
                                  "onUpdate:modelValue": ($event) => unref(newItem).taxable = $event,
                                  size: "sm"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode("span", null, "Taxable")
                              ]),
                              createVNode(_component_UButton, {
                                onClick: addItem,
                                icon: "i-lucide-plus",
                                size: "sm",
                                variant: "outline",
                                class: "w-full"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Add Item")
                                ]),
                                _: 1
                              })
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "space-y-1 text-sm" }, [
                        createVNode("div", { class: "flex justify-between text-parchment/60" }, [
                          createVNode("span", null, "Subtotal"),
                          createVNode("span", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(subtotal))), 1)
                        ]),
                        unref(totalTax) > 0 ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "flex justify-between text-parchment/60"
                        }, [
                          createVNode("span", null, "Tax (" + toDisplayString(((unref(localData).taxRate || 0) * 100).toFixed(2)) + "%)", 1),
                          createVNode("span", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalTax))), 1)
                        ])) : createCommentVNode("", true),
                        (unref(localData).shipping || 0) > 0 ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "flex justify-between text-parchment/60"
                        }, [
                          createVNode("span", null, "Shipping"),
                          createVNode("span", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(localData).shipping)), 1)
                        ])) : createCommentVNode("", true),
                        createVNode("div", { class: "flex justify-between text-lg font-bold text-parchment pt-1 border-t border-white/10" }, [
                          createVNode("span", null, "Total"),
                          createVNode("span", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(total))), 1)
                        ])
                      ])
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
                          createTextVNode(toDisplayString(isNew ? "Create" : unref(isMarkingDelivered) ? "Save & Update Inventory" : "Save"), 1)
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
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(isNew ? "New Purchase Order" : "Edit Purchase Order"), 1),
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
                      createVNode(_component_UFormField, {
                        label: "Date",
                        name: "date"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_SiteDatePicker, {
                            modelValue: unref(localData).date,
                            "onUpdate:modelValue": ($event) => unref(localData).date = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Status",
                          name: "status"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).status,
                              "onUpdate:modelValue": ($event) => unref(localData).status = $event,
                              items: unref(statusOptions),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Vendor",
                          name: "vendor"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).vendor,
                              "onUpdate:modelValue": ($event) => unref(localData).vendor = $event,
                              items: unref(contactStore).contacts.map((c) => ({
                                label: c.businessName || `${c.firstName} ${c.lastName}`,
                                value: c._id
                              })),
                              "value-key": "value",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Tax Rate (%)",
                          name: "taxRate"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              "model-value": ((unref(localData).taxRate || 0) * 100).toFixed(2),
                              "onUpdate:modelValue": (v) => unref(localData).taxRate = parseFloat(v) / 100 || 0,
                              type: "number",
                              step: "0.01",
                              class: "w-full"
                            }, null, 8, ["model-value", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Shipping ($)",
                          name: "shipping"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).shipping,
                              "onUpdate:modelValue": ($event) => unref(localData).shipping = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              step: "0.01",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      unref(isMarkingDelivered) && unref(localData).items.length > 0 ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "flex items-start gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"
                      }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-package-check",
                          class: "text-green-400 shrink-0 mt-0.5"
                        }),
                        createVNode("div", { class: "text-xs text-parchment/70" }, [
                          createVNode("span", { class: "font-semibold text-green-400" }, "Inventory will be updated automatically"),
                          createTextVNode(" when this order is saved as Delivered. Stock levels for " + toDisplayString(unref(localData).items.length) + " item" + toDisplayString(unref(localData).items.length !== 1 ? "s" : "") + " will be increased based on the order quantities. ", 1)
                        ])
                      ])) : createCommentVNode("", true),
                      createVNode(_component_UFormField, { label: "Items" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).items, (item, index) => {
                              return openBlock(), createBlock("div", {
                                key: index,
                                class: "flex items-center justify-between gap-2 text-sm"
                              }, [
                                createVNode("div", { class: "flex-1 min-w-0" }, [
                                  createVNode("span", { class: "truncate block" }, toDisplayString(unref(itemStore).items.find((i) => i._id === item.item)?.name), 1),
                                  item.brand ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "text-xs text-parchment/60"
                                  }, toDisplayString(item.brand), 1)) : createCommentVNode("", true)
                                ]),
                                item.taxable ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-[10px] font-semibold text-amber bg-amber/15 border border-amber/25 px-1.5 py-0.5 rounded-full shrink-0"
                                }, "TAX")) : createCommentVNode("", true),
                                createVNode("span", { class: "text-parchment/60 shrink-0" }, toDisplayString(item.quantity) + " x " + toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price)), 1),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeItem(index)
                                }, null, 8, ["onClick"])
                              ]);
                            }), 128)),
                            createVNode("div", { class: "space-y-2 border border-white/10 rounded p-2" }, [
                              createVNode(_component_BaseItemSelect, {
                                modelValue: unref(newItem).item,
                                "onUpdate:modelValue": ($event) => unref(newItem).item = $event,
                                placeholder: "Select item",
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newItem).brand,
                                "onUpdate:modelValue": ($event) => unref(newItem).brand = $event,
                                placeholder: "Brand (optional)",
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode("div", { class: "grid grid-cols-4 gap-2" }, [
                                createVNode(_component_UInput, {
                                  modelValue: unref(newItem).quantity,
                                  "onUpdate:modelValue": ($event) => unref(newItem).quantity = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Qty"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_UInput, {
                                  modelValue: unref(newItem).size,
                                  "onUpdate:modelValue": ($event) => unref(newItem).size = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Size"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelect, {
                                  modelValue: unref(newItem).sizeUnit,
                                  "onUpdate:modelValue": ($event) => unref(newItem).sizeUnit = $event,
                                  items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                                  placeholder: "Unit"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UInput, {
                                  modelValue: unref(newItem).price,
                                  "onUpdate:modelValue": ($event) => unref(newItem).price = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Price"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              createVNode("label", { class: "flex items-center gap-2 text-sm text-parchment/70 cursor-pointer" }, [
                                createVNode(_component_USwitch, {
                                  modelValue: unref(newItem).taxable,
                                  "onUpdate:modelValue": ($event) => unref(newItem).taxable = $event,
                                  size: "sm"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode("span", null, "Taxable")
                              ]),
                              createVNode(_component_UButton, {
                                onClick: addItem,
                                icon: "i-lucide-plus",
                                size: "sm",
                                variant: "outline",
                                class: "w-full"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Add Item")
                                ]),
                                _: 1
                              })
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "space-y-1 text-sm" }, [
                        createVNode("div", { class: "flex justify-between text-parchment/60" }, [
                          createVNode("span", null, "Subtotal"),
                          createVNode("span", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(subtotal))), 1)
                        ]),
                        unref(totalTax) > 0 ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "flex justify-between text-parchment/60"
                        }, [
                          createVNode("span", null, "Tax (" + toDisplayString(((unref(localData).taxRate || 0) * 100).toFixed(2)) + "%)", 1),
                          createVNode("span", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalTax))), 1)
                        ])) : createCommentVNode("", true),
                        (unref(localData).shipping || 0) > 0 ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "flex justify-between text-parchment/60"
                        }, [
                          createVNode("span", null, "Shipping"),
                          createVNode("span", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(localData).shipping)), 1)
                        ])) : createCommentVNode("", true),
                        createVNode("div", { class: "flex justify-between text-lg font-bold text-parchment pt-1 border-t border-white/10" }, [
                          createVNode("span", null, "Total"),
                          createVNode("span", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(total))), 1)
                        ])
                      ])
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
                          createTextVNode(toDisplayString(isNew ? "Create" : unref(isMarkingDelivered) ? "Save & Update Inventory" : "Save"), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelPurchaseOrder.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main, { __name: "PanelPurchaseOrder" });

export { __nuxt_component_2 as default };
//# sourceMappingURL=PanelPurchaseOrder-aaUzpc3l.mjs.map
