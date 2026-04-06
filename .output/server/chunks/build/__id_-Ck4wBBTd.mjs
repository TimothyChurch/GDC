import { u as useRoute, h as useRouter, m as useToast, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { b as usePurchaseOrderStore, u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { L as LazyPanelContact } from './PanelContact-BSAHu9XO.mjs';
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
import 'reka-ui';
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
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const contactStore = useContactStore();
    const purchaseOrderStore = usePurchaseOrderStore();
    const itemStore = useItemStore();
    const { confirm } = useDeleteConfirm();
    const toast = useToast();
    const contact = computed(() => contactStore.getContactById(route.params._id));
    const displayName = computed(() => {
      if (!contact.value) return "";
      return contact.value.businessName || `${contact.value.firstName || ""} ${contact.value.lastName || ""}`.trim();
    });
    const relatedPOs = computed(
      () => purchaseOrderStore.getPurchaseOrderByVendor(route.params._id)
    );
    const suppliedItems = computed(() => {
      const vendorPOs = relatedPOs.value;
      const uniqueItemIds = /* @__PURE__ */ new Set();
      for (const po of vendorPOs) {
        for (const lineItem of po.items) {
          uniqueItemIds.add(lineItem.item);
        }
      }
      return [...uniqueItemIds].map((id) => itemStore.getItemById(id)).filter((i) => !!i);
    });
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelContact);
    const editContact = () => {
      if (!contact.value) return;
      contactStore.contact = structuredClone(toRaw(contact.value));
      panel.open();
    };
    const deleteContact = async () => {
      if (!contact.value) return;
      const confirmed = await confirm("Contact", displayName.value);
      if (!confirmed) return;
      await contactStore.deleteContact(contact.value._id);
      toast.add({ title: "Contact deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/contacts");
    };
    function poStatusColor(status) {
      switch (status) {
        case "Pending":
          return "bg-yellow-500/15 text-yellow-400 border-yellow-500/25";
        case "Ordered":
          return "bg-blue-500/15 text-blue-400 border-blue-500/25";
        case "Received":
        case "Delivered":
          return "bg-green-500/15 text-green-400 border-green-500/25";
        case "Cancelled":
          return "bg-red-500/15 text-red-400 border-red-500/25";
        default:
          return "bg-brown/15 text-parchment/50 border-brown/25";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      if (!unref(contactStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(contact)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(displayName),
          subtitle: unref(contact).type || void 0,
          icon: "i-lucide-user"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/contacts")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Back `);
                  } else {
                    return [
                      createTextVNode(" Back ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-pencil",
                size: "sm",
                onClick: editContact
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Edit `);
                  } else {
                    return [
                      createTextVNode(" Edit ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-trash-2",
                color: "error",
                variant: "soft",
                size: "sm",
                onClick: deleteContact
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Delete `);
                  } else {
                    return [
                      createTextVNode(" Delete ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  icon: "i-lucide-arrow-left",
                  variant: "outline",
                  color: "neutral",
                  size: "sm",
                  onClick: ($event) => unref(router).push("/admin/contacts")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editContact
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Edit ")
                  ]),
                  _: 1
                }),
                createVNode(_component_UButton, {
                  icon: "i-lucide-trash-2",
                  color: "error",
                  variant: "soft",
                  size: "sm",
                  onClick: deleteContact
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Delete ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Contact Info</h3><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">`);
        if (unref(contact).businessName) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Business Name</div><div class="text-sm text-parchment">${ssrInterpolate(unref(contact).businessName)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(contact).firstName || unref(contact).lastName) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div><div class="text-sm text-parchment">${ssrInterpolate(unref(contact).firstName)} ${ssrInterpolate(unref(contact).lastName)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(contact).type) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Type</div><div class="text-sm text-parchment">${ssrInterpolate(unref(contact).type)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Email</div>`);
        if (unref(contact).email) {
          _push(`<a${ssrRenderAttr("href", `mailto:${unref(contact).email}`)} class="text-sm text-copper hover:text-gold transition-colors">${ssrInterpolate(unref(contact).email)}</a>`);
        } else {
          _push(`<div class="text-sm text-parchment/60">N/A</div>`);
        }
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Phone</div>`);
        if (unref(contact).phone) {
          _push(`<a${ssrRenderAttr("href", `tel:${unref(contact).phone}`)} class="text-sm text-copper hover:text-gold transition-colors">${ssrInterpolate(unref(contact).phone)}</a>`);
        } else {
          _push(`<div class="text-sm text-parchment/60">N/A</div>`);
        }
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Website</div>`);
        if (unref(contact).website) {
          _push(`<a${ssrRenderAttr("href", unref(contact).website)} target="_blank" rel="noopener noreferrer" class="text-sm text-copper hover:text-gold transition-colors">${ssrInterpolate(unref(contact).website)}</a>`);
        } else {
          _push(`<div class="text-sm text-parchment/60">N/A</div>`);
        }
        _push(`</div>`);
        if (unref(contact).address) {
          _push(`<div class="col-span-2"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Address</div><div class="text-sm text-parchment">${ssrInterpolate(unref(contact).address)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Purchase Orders</h3>`);
        if (unref(relatedPOs).length > 0) {
          _push(`<div class="divide-y divide-brown/20"><div class="grid grid-cols-3 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider hidden sm:grid"><span>Date</span><span>Status</span><span class="text-right">Total</span></div><!--[-->`);
          ssrRenderList(unref(relatedPOs), (po) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: po._id,
              to: `/admin/purchaseOrders/${po._id}`,
              class: "grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 py-2 text-sm hover:bg-brown/10 -mx-2 px-2 rounded transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="text-parchment"${_scopeId}>${ssrInterpolate(new Date(po.date).toLocaleDateString())}</span><span class="hidden sm:block"${_scopeId}><span class="${ssrRenderClass(["px-2 py-0.5 rounded-full text-[10px] font-semibold border", poStatusColor(po.status)])}"${_scopeId}>${ssrInterpolate(po.status)}</span></span><span class="text-parchment text-right"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(po.total))}</span>`);
                } else {
                  return [
                    createVNode("span", { class: "text-parchment" }, toDisplayString(new Date(po.date).toLocaleDateString()), 1),
                    createVNode("span", { class: "hidden sm:block" }, [
                      createVNode("span", {
                        class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", poStatusColor(po.status)]
                      }, toDisplayString(po.status), 3)
                    ]),
                    createVNode("span", { class: "text-parchment text-right" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(po.total)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-clipboard-list",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No purchase orders</p></div>`);
        }
        _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Supplied Items</h3>`);
        if (unref(suppliedItems).length > 0) {
          _push(`<div class="divide-y divide-brown/20"><div class="grid grid-cols-2 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider"><span>Name</span><span class="text-right">Price/Unit</span></div><!--[-->`);
          ssrRenderList(unref(suppliedItems), (item) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: item._id,
              to: `/admin/items/${item._id}`,
              class: "grid grid-cols-2 gap-4 py-2 text-sm hover:bg-brown/10 -mx-2 px-2 rounded transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="text-parchment"${_scopeId}>${ssrInterpolate(item.name)}</span><span class="text-parchment text-right"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(itemStore).latestPrice(item._id)))}</span>`);
                } else {
                  return [
                    createVNode("span", { class: "text-parchment" }, toDisplayString(item.name), 1),
                    createVNode("span", { class: "text-parchment text-right" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(itemStore).latestPrice(item._id))), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-package",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No items supplied by this contact</p></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Contact not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/contacts")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Contacts `);
            } else {
              return [
                createTextVNode(" Back to Contacts ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/contacts/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-Ck4wBBTd.mjs.map
