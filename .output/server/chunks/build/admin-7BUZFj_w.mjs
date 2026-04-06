import { u as useRoute, e as _sfc_main$8, c as __nuxt_component_1$1, d as __nuxt_component_0$2, H as _sfc_main$c, f as _sfc_main$e, g as useOverlay, J as useState, y as useLocale, i as useAppConfig, t as tv, O as _sfc_main$9$1, P as pickLinkProps, Q as _sfc_main$a, w as _sfc_main$b, G as get } from './server.mjs';
import { _ as _sfc_main$6 } from './Kbd-C22JBoFL.mjs';
import { _ as _sfc_main$7 } from './Slideover-CyjfVfmV.mjs';
import { _ as _sfc_main$9 } from './Proofing-C6nhpVFe.mjs';
import { ref, computed, mergeProps, unref, defineAsyncComponent, defineComponent, withCtx, createVNode, openBlock, createBlock, createCommentVNode, toDisplayString, isRef, createTextVNode, useSlots, renderSlot, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-DX6ojG3V.mjs';
import { u as useMessageStore } from './useMessageStore-BW2XxQau.mjs';
import __nuxt_component_0$1 from './PanelBatch-BfUvkOd1.mjs';
import __nuxt_component_1$2 from './PanelProduction-Hs6SJXU5.mjs';
import __nuxt_component_2$1 from './PanelPurchaseOrder-aaUzpc3l.mjs';
import { a as useBatchStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useItemStore, b as usePurchaseOrderStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useEventStore } from './useEventStore-LoZhbbHY.mjs';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { Primitive } from 'reka-ui';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
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
import './FormField-DcXe0kwN.mjs';
import './Input-Fd8Vd_4J.mjs';
import './Select-xxK8NqZT.mjs';
import './conversions-t0mnZFvt.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './Form-DifyhlgS.mjs';
import './SelectMenu-DljUyjmT.mjs';
import './BaseQuantityInput-Bo8QfULy.mjs';
import './FieldGroup-bwPzB93U.mjs';
import './units-DWysHFem.mjs';
import './formatting-DpuwJPOk.mjs';
import './useFormPanel-DspW7Iuy.mjs';
import './helpers-pfHQ8kqT.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './useProductionStore-SZxhegcf.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './SiteDatePicker-pVMyeD61.mjs';
import './Popover-BvOOk09Z.mjs';
import 'reka-ui/namespaced';
import 'v-calendar';
import 'date-fns';
import './BaseItemSelect-8IgvW2BX.mjs';
import './Separator-C6vDFXmY.mjs';
import './Switch-BH6j8VnQ.mjs';
import './useProductionCosts-BgHwywl6.mjs';
import './definitions-C7fnFA_u.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './batchPipeline-Dr1IalWc.mjs';

const useCalculatorModal = () => {
  const calculatorModalStatus = useState("calculatorModalStatus", () => false);
  const toggleCalculatorModal = () => {
    calculatorModalStatus.value = !calculatorModalStatus.value;
  };
  return { calculatorModalStatus, toggleCalculatorModal };
};
const _sfc_main$5 = {
  __name: "ModalCalculators",
  __ssrInlineRender: true,
  setup(__props) {
    const { calculatorModalStatus, toggleCalculatorModal } = useCalculatorModal();
    const isOpen = calculatorModalStatus;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$7;
      const _component_UButton = _sfc_main$8;
      const _component_Proofing = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_USlideover, {
        open: unref(isOpen),
        "onUpdate:open": ($event) => isRef(isOpen) ? isOpen.value = $event : null
      }, {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Proofing, { class: "w-full" }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              onClick: unref(toggleCalculatorModal),
              class: "py-3 px-8 m-3 self-center"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Exit`);
                } else {
                  return [
                    createTextVNode("Exit")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Proofing, { class: "w-full" }),
              createVNode(_component_UButton, {
                onClick: unref(toggleCalculatorModal),
                class: "py-3 px-8 m-3 self-center"
              }, {
                default: withCtx(() => [
                  createTextVNode("Exit")
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "ghost",
              icon: "i-lucide-calculator"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                color: "neutral",
                variant: "ghost",
                icon: "i-lucide-calculator"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalCalculators.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
function useCommandPalette() {
  const isOpen = useState("commandPaletteOpen", () => false);
  const open = () => {
    isOpen.value = true;
  };
  const close = () => {
    isOpen.value = false;
  };
  return { isOpen, open, close };
}
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "AdminHeader",
  __ssrInlineRender: true,
  emits: ["toggleSidebar"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { user, logout } = useAuth();
    const { open } = useCommandPalette();
    const messageStore = useMessageStore();
    const unreadCount = computed(() => messageStore.unreadCount);
    const isMac = computed(
      () => false
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_NuxtImg = __nuxt_component_0$2;
      const _component_UKbd = _sfc_main$6;
      const _component_ModalCalculators = _sfc_main$5;
      const _component_UChip = _sfc_main$c;
      const _component_UIcon = _sfc_main$e;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-between px-4 lg:px-6 h-16 bg-charcoal border-b border-brown/50 shrink-0" }, _attrs))}><div class="flex items-center gap-3">`);
      _push(ssrRenderComponent(_component_UButton, {
        class: "lg:hidden",
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-menu",
        size: "lg",
        onClick: ($event) => emit("toggleSidebar")
      }, null, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/dashboard",
        class: "flex items-center gap-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: "/images/Logo.png",
              alt: "GDC",
              class: "h-8 w-auto rounded",
              width: "64",
              height: "32",
              format: "webp"
            }, null, _parent2, _scopeId));
            _push2(`<span class="hidden md:inline text-sm font-semibold text-parchment tracking-wide"${_scopeId}> GDC Operations </span>`);
          } else {
            return [
              createVNode(_component_NuxtImg, {
                src: "/images/Logo.png",
                alt: "GDC",
                class: "h-8 w-auto rounded",
                width: "64",
                height: "32",
                format: "webp"
              }),
              createVNode("span", { class: "hidden md:inline text-sm font-semibold text-parchment tracking-wide" }, " GDC Operations ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UButton, {
        variant: "outline",
        color: "neutral",
        size: "md",
        icon: "i-lucide-search",
        class: "hidden md:flex border-brown/30 bg-espresso/50 hover:bg-brown/20 hover:border-brown/50 transition-all duration-200 text-parchment/60 hover:text-parchment/60",
        onClick: ($event) => unref(open)()
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-sm"${_scopeId}>Search...</span><div class="flex items-center gap-0.5 ml-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UKbd, {
              value: unref(isMac) ? "meta" : "ctrl",
              size: "sm"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UKbd, {
              value: "K",
              size: "sm"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("span", { class: "text-sm" }, "Search..."),
              createVNode("div", { class: "flex items-center gap-0.5 ml-4" }, [
                createVNode(_component_UKbd, {
                  value: unref(isMac) ? "meta" : "ctrl",
                  size: "sm"
                }, null, 8, ["value"]),
                createVNode(_component_UKbd, {
                  value: "K",
                  size: "sm"
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        class: "md:hidden",
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-search",
        size: "md",
        onClick: ($event) => unref(open)()
      }, null, _parent));
      _push(`<div class="flex items-center gap-3">`);
      _push(ssrRenderComponent(_component_ModalCalculators, null, null, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/admin/inbox" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UChip, {
              show: unref(unreadCount) > 0,
              text: unref(unreadCount),
              color: "error",
              size: "lg"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UButton, {
                    color: "neutral",
                    variant: "ghost",
                    size: "md",
                    icon: "i-lucide-bell",
                    class: "text-parchment/60 hover:text-parchment"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      color: "neutral",
                      variant: "ghost",
                      size: "md",
                      icon: "i-lucide-bell",
                      class: "text-parchment/60 hover:text-parchment"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UChip, {
                show: unref(unreadCount) > 0,
                text: unref(unreadCount),
                color: "error",
                size: "lg"
              }, {
                default: withCtx(() => [
                  createVNode(_component_UButton, {
                    color: "neutral",
                    variant: "ghost",
                    size: "md",
                    icon: "i-lucide-bell",
                    class: "text-parchment/60 hover:text-parchment"
                  })
                ]),
                _: 1
              }, 8, ["show", "text"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="hidden sm:flex items-center gap-2 text-sm text-parchment/70">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-user",
        class: "text-copper size-5"
      }, null, _parent));
      _push(`<span>${ssrInterpolate(unref(user)?.email)}</span></div>`);
      _push(ssrRenderComponent(_component_UButton, {
        color: "neutral",
        variant: "ghost",
        size: "md",
        icon: "i-lucide-log-out",
        class: "text-parchment/60 hover:text-parchment",
        onClick: unref(logout)
      }, null, _parent));
      _push(`</div></header>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Admin/AdminHeader.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$4, { __name: "AdminHeader" });
function useSidebarBadges() {
  const batchStore = useBatchStore();
  const purchaseOrderStore = usePurchaseOrderStore();
  const itemStore = useItemStore();
  const eventStore = useEventStore();
  const contactStore = useContactStore();
  const messageStore = useMessageStore();
  const activeBatches = computed(() => batchStore.activeBatches.length);
  const pendingPOs = computed(
    () => purchaseOrderStore.purchaseOrders.filter(
      (po) => ["Pending", "Confirmed", "Shipped"].includes(po.status)
    ).length
  );
  const lowInventoryCount = computed(() => itemStore.shoppingListItems.length);
  const pendingEvents = computed(() => eventStore.pendingEvents);
  const totalCustomers = computed(
    () => contactStore.contacts.filter((c) => c.type === "Customer").length
  );
  const unreadMessages = computed(() => messageStore.unreadCount);
  return { activeBatches, pendingPOs, lowInventoryCount, pendingEvents, totalCustomers, unreadMessages };
}
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "AdminSidebar",
  __ssrInlineRender: true,
  props: {
    sidebarOpen: { type: Boolean },
    collapsed: { type: Boolean }
  },
  emits: ["close", "toggleCollapse"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const route = useRoute();
    const overlay = useOverlay();
    const {
      activeBatches,
      pendingPOs,
      lowInventoryCount,
      pendingEvents,
      totalCustomers,
      unreadMessages
    } = useSidebarBadges();
    const productionLinks = [
      {
        label: "Dashboard",
        icon: "i-lucide-layout-dashboard",
        to: "/admin/dashboard"
      },
      { label: "Recipes", icon: "i-lucide-book-open", to: "/admin/recipes" },
      {
        label: "Batches",
        icon: "i-lucide-flask-conical",
        to: "/admin/batch",
        badge: activeBatches
      },
      { label: "Vessels", icon: "i-lucide-container", to: "/admin/vessels" },
      { label: "Barrels", icon: "i-lucide-cylinder", to: "/admin/barrels" },
      { label: "Bulk Spirits", icon: "i-lucide-archive", to: "/admin/bulk-spirits" },
      { label: "Production", icon: "i-lucide-factory", to: "/admin/production" },
      { label: "Proofing", icon: "i-lucide-calculator", to: "/admin/proofing" }
    ];
    const productLinks = [
      { label: "Bottles", icon: "i-lucide-wine", to: "/admin/bottles" },
      { label: "Cocktails", icon: "i-lucide-martini", to: "/admin/cocktails" },
      {
        label: "Cheat Sheets",
        icon: "i-lucide-file-text",
        to: "/admin/cocktails/grid"
      }
    ];
    const shoppingListCount = computed(() => {
      const itemStore = useItemStore();
      return itemStore.shoppingListItems.length;
    });
    const inventoryLinks = [
      {
        label: "Inventory",
        icon: "i-lucide-warehouse",
        to: "/admin/inventory",
        badge: lowInventoryCount
      },
      {
        label: "Shopping List",
        icon: "i-lucide-shopping-cart",
        to: "/admin/inventory/shopping-list",
        badge: shoppingListCount
      },
      {
        label: "Count Inventory",
        icon: "i-lucide-clipboard-check",
        to: "/admin/inventory/input"
      },
      {
        label: "Items",
        icon: "i-lucide-package",
        to: "/admin/items"
      },
      {
        label: "Bottle Inventory",
        icon: "i-lucide-clipboard-list",
        to: "/admin/bottles/inventory"
      },
      {
        label: "Purchase Orders",
        icon: "i-lucide-receipt",
        to: "/admin/purchaseOrders",
        badge: pendingPOs
      }
    ];
    const reportLinks = [
      { label: "Reports", icon: "i-lucide-bar-chart-3", to: "/admin/reports" }
    ];
    const adminLinks = [
      {
        label: "Inbox",
        icon: "i-lucide-inbox",
        to: "/admin/inbox",
        badge: unreadMessages
      },
      {
        label: "Events",
        icon: "i-lucide-calendar",
        to: "/admin/events",
        badge: pendingEvents
      },
      {
        label: "Customers",
        icon: "i-lucide-heart-handshake",
        to: "/admin/customers",
        badge: totalCustomers
      },
      { label: "Contacts", icon: "i-lucide-users", to: "/admin/contacts" },
      { label: "Users", icon: "i-lucide-user-cog", to: "/admin/users" },
      { label: "Controls", icon: "i-lucide-sliders-horizontal", to: "/admin/controls" },
      { label: "Settings", icon: "i-lucide-settings", to: "/admin/settings" }
    ];
    const sections = [
      { title: "Production", links: productionLinks },
      { title: "Products", links: productLinks },
      { title: "Inventory", links: inventoryLinks },
      { title: "Reports", links: reportLinks },
      { title: "Admin", links: adminLinks }
    ];
    const isActive = (to) => {
      return route.path === to || route.path.startsWith(to + "/");
    };
    const quickActions = [
      { icon: "i-lucide-flask-conical", label: "Batch", panel: "PanelBatch" },
      { icon: "i-lucide-factory", label: "Production", panel: "PanelProduction" },
      { icon: "i-lucide-receipt", label: "PO", panel: "PanelPurchaseOrder" }
    ];
    async function openQuickAdd(panelName) {
      const components = {
        PanelBatch: __nuxt_component_0$1,
        PanelProduction: __nuxt_component_1$2,
        PanelPurchaseOrder: __nuxt_component_2$1
      };
      const comp = components[panelName];
      if (comp) {
        const panel = overlay.create(comp);
        await panel.open();
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      _push(`<nav${ssrRenderAttrs(mergeProps({
        class: [
          "flex flex-col bg-charcoal border-r border-brown/30 overflow-y-auto overflow-x-hidden transition-all duration-300",
          "fixed inset-y-0 left-0 z-40 lg:static lg:z-auto",
          __props.collapsed ? "w-16" : "w-64",
          __props.sidebarOpen ? "flex" : "hidden lg:flex"
        ]
      }, _attrs))}>`);
      if (!__props.collapsed) {
        _push(`<div class="flex items-center gap-1.5 px-3 pt-3 pb-1"><!--[-->`);
        ssrRenderList(quickActions, (action) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: action.panel,
            icon: action.icon,
            label: action.label,
            variant: "ghost",
            color: "neutral",
            size: "xs",
            class: "flex-1 bg-brown/20 hover:bg-gold/15 text-parchment/50 hover:text-gold border border-transparent hover:border-gold/20 transition-all duration-200",
            title: `New ${action.label}`,
            onClick: ($event) => openQuickAdd(action.panel)
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="flex flex-col items-center gap-1 px-2 pt-3 pb-1"><!--[-->`);
        ssrRenderList(quickActions, (action) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: action.panel,
            icon: "i-lucide-plus",
            variant: "ghost",
            color: "neutral",
            size: "xs",
            square: "",
            class: "w-10 h-8 bg-brown/20 hover:bg-gold/15 text-parchment/50 hover:text-gold border border-transparent hover:border-gold/20 transition-all duration-200",
            title: `New ${action.label}`,
            onClick: ($event) => openQuickAdd(action.panel)
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`<div class="flex flex-col gap-1 p-3 flex-grow"><!--[-->`);
      ssrRenderList(sections, (section, sectionIdx) => {
        _push(`<!--[-->`);
        if (sectionIdx > 0) {
          _push(`<div class="my-2 border-t border-brown/20"></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!__props.collapsed) {
          _push(`<div class="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-copper/60">${ssrInterpolate(section.title)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(section.links, (link) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: link.to,
            to: link.to,
            class: [
              "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
              isActive(link.to) ? "bg-gold/15 text-gold border border-gold/20" : "text-parchment/60 hover:text-parchment hover:bg-brown/30 border border-transparent",
              __props.collapsed ? "justify-center" : ""
            ],
            onClick: ($event) => emit("close")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="relative shrink-0"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: link.icon,
                  class: [
                    "text-lg transition-colors duration-200",
                    isActive(link.to) ? "text-gold" : "text-parchment/60 group-hover:text-copper"
                  ]
                }, null, _parent2, _scopeId));
                if (__props.collapsed && link.badge?.value) {
                  _push2(`<span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-copper"${_scopeId}></span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
                if (!__props.collapsed) {
                  _push2(`<span class="truncate"${_scopeId}>${ssrInterpolate(link.label)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (!__props.collapsed && link.badge?.value) {
                  _push2(`<span class="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-copper/20 text-copper text-[10px] font-bold flex items-center justify-center"${_scopeId}>${ssrInterpolate(link.badge.value)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("div", { class: "relative shrink-0" }, [
                    createVNode(_component_UIcon, {
                      name: link.icon,
                      class: [
                        "text-lg transition-colors duration-200",
                        isActive(link.to) ? "text-gold" : "text-parchment/60 group-hover:text-copper"
                      ]
                    }, null, 8, ["name", "class"]),
                    __props.collapsed && link.badge?.value ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-copper"
                    })) : createCommentVNode("", true)
                  ]),
                  !__props.collapsed ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "truncate"
                  }, toDisplayString(link.label), 1)) : createCommentVNode("", true),
                  !__props.collapsed && link.badge?.value ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: "ml-auto min-w-5 h-5 px-1.5 rounded-full bg-copper/20 text-copper text-[10px] font-bold flex items-center justify-center"
                  }, toDisplayString(link.badge.value), 1)) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--><!--]-->`);
      });
      _push(`<!--]--></div><div class="p-3 border-t border-brown/20">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: ["group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-parchment/50 hover:text-parchment hover:bg-brown/30 transition-all duration-200", __props.collapsed ? "justify-center" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-home",
              class: "shrink-0 text-lg text-parchment/50 group-hover:text-copper"
            }, null, _parent2, _scopeId));
            if (!__props.collapsed) {
              _push2(`<span${_scopeId}>Main Site</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-lucide-home",
                class: "shrink-0 text-lg text-parchment/50 group-hover:text-copper"
              }),
              !__props.collapsed ? (openBlock(), createBlock("span", { key: 0 }, "Main Site")) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        icon: __props.collapsed ? "i-lucide-chevrons-right" : "i-lucide-chevrons-left",
        label: __props.collapsed ? void 0 : "Collapse",
        variant: "ghost",
        color: "neutral",
        size: "sm",
        block: "",
        class: ["hidden lg:flex mt-1 text-parchment/60 hover:text-parchment/70 hover:bg-brown/20 transition-all duration-200", __props.collapsed ? "justify-center" : ""],
        onClick: ($event) => emit("toggleCollapse")
      }, null, _parent));
      _push(`</div></nav>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Admin/AdminSidebar.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$3, { __name: "AdminSidebar" });
const theme = {
  "slots": {
    "root": "relative min-w-0",
    "list": "flex items-center gap-1.5",
    "item": "flex min-w-0",
    "link": "group relative flex items-center gap-1.5 text-sm min-w-0 focus-visible:outline-primary",
    "linkLeadingIcon": "shrink-0 size-5",
    "linkLeadingAvatar": "shrink-0",
    "linkLeadingAvatarSize": "2xs",
    "linkLabel": "truncate",
    "separator": "flex",
    "separatorIcon": "shrink-0 size-5 text-muted"
  },
  "variants": {
    "active": {
      "true": {
        "link": "text-primary font-semibold"
      },
      "false": {
        "link": "text-muted font-medium"
      }
    },
    "disabled": {
      "true": {
        "link": "cursor-not-allowed opacity-75"
      }
    },
    "to": {
      "true": ""
    }
  },
  "compoundVariants": [
    {
      "disabled": false,
      "active": false,
      "to": true,
      "class": {
        "link": [
          "hover:text-default",
          "transition-colors"
        ]
      }
    }
  ]
};
const _sfc_main$2 = {
  __name: "UBreadcrumb",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false, default: "nav" },
    items: { type: Array, required: false },
    separatorIcon: { type: null, required: false },
    labelKey: { type: null, required: false, default: "label" },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const { dir } = useLocale();
    const appConfig = useAppConfig();
    const separatorIcon = computed(() => props.separatorIcon || (dir.value === "rtl" ? appConfig.ui.icons.chevronLeft : appConfig.ui.icons.chevronRight));
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.breadcrumb || {} })());
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "aria-label": "breadcrumb",
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<ol data-slot="list" class="${ssrRenderClass(ui.value.list({ class: props.ui?.list }))}"${_scopeId}><!--[-->`);
            ssrRenderList(__props.items, (item, index) => {
              _push2(`<!--[--><li data-slot="item" class="${ssrRenderClass(ui.value.item({ class: [props.ui?.item, item.ui?.item] }))}"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$9$1, mergeProps({ ref_for: true }, unref(pickLinkProps)(item), { custom: "" }), {
                default: withCtx(({ active, ...slotProps }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_sfc_main$a, mergeProps({ ref_for: true }, slotProps, {
                      as: "span",
                      "aria-current": (item.active ?? active) && index === __props.items.length - 1 ? "page" : void 0,
                      "data-slot": "link",
                      class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: item.active ?? index === __props.items.length - 1, disabled: !!item.disabled, to: !!item.to })
                    }), {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          ssrRenderSlot(_ctx.$slots, item.slot || "item", {
                            item,
                            active: item.active ?? index === __props.items.length - 1,
                            index,
                            ui: ui.value
                          }, () => {
                            ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : "item-leading", {
                              item,
                              active: item.active ?? index === __props.items.length - 1,
                              index,
                              ui: ui.value
                            }, () => {
                              if (item.icon) {
                                _push4(ssrRenderComponent(_sfc_main$e, {
                                  name: item.icon,
                                  "data-slot": "linkLeadingIcon",
                                  class: ui.value.linkLeadingIcon({ class: [props.ui?.linkLeadingIcon, item.ui?.linkLeadingIcon], active: item.active ?? index === __props.items.length - 1 })
                                }, null, _parent4, _scopeId3));
                              } else if (item.avatar) {
                                _push4(ssrRenderComponent(_sfc_main$b, mergeProps({
                                  size: props.ui?.linkLeadingAvatarSize || ui.value.linkLeadingAvatarSize()
                                }, { ref_for: true }, item.avatar, {
                                  "data-slot": "linkLeadingAvatar",
                                  class: ui.value.linkLeadingAvatar({ class: [props.ui?.linkLeadingAvatar, item.ui?.linkLeadingAvatar], active: item.active ?? index === __props.items.length - 1 })
                                }), null, _parent4, _scopeId3));
                              } else {
                                _push4(`<!---->`);
                              }
                            }, _push4, _parent4, _scopeId3);
                            if (unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : "item-label"]) {
                              _push4(`<span data-slot="linkLabel" class="${ssrRenderClass(ui.value.linkLabel({ class: [props.ui?.linkLabel, item.ui?.linkLabel] }))}"${_scopeId3}>`);
                              ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : "item-label", {
                                item,
                                active: item.active ?? index === __props.items.length - 1,
                                index
                              }, () => {
                                _push4(`${ssrInterpolate(unref(get)(item, props.labelKey))}`);
                              }, _push4, _parent4, _scopeId3);
                              _push4(`</span>`);
                            } else {
                              _push4(`<!---->`);
                            }
                            ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : "item-trailing", {
                              item,
                              active: item.active ?? index === __props.items.length - 1,
                              index
                            }, null, _push4, _parent4, _scopeId3);
                          }, _push4, _parent4, _scopeId3);
                        } else {
                          return [
                            renderSlot(_ctx.$slots, item.slot || "item", {
                              item,
                              active: item.active ?? index === __props.items.length - 1,
                              index,
                              ui: ui.value
                            }, () => [
                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : "item-leading", {
                                item,
                                active: item.active ?? index === __props.items.length - 1,
                                index,
                                ui: ui.value
                              }, () => [
                                item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                                  key: 0,
                                  name: item.icon,
                                  "data-slot": "linkLeadingIcon",
                                  class: ui.value.linkLeadingIcon({ class: [props.ui?.linkLeadingIcon, item.ui?.linkLeadingIcon], active: item.active ?? index === __props.items.length - 1 })
                                }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                  key: 1,
                                  size: props.ui?.linkLeadingAvatarSize || ui.value.linkLeadingAvatarSize()
                                }, { ref_for: true }, item.avatar, {
                                  "data-slot": "linkLeadingAvatar",
                                  class: ui.value.linkLeadingAvatar({ class: [props.ui?.linkLeadingAvatar, item.ui?.linkLeadingAvatar], active: item.active ?? index === __props.items.length - 1 })
                                }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                              ]),
                              unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : "item-label"] ? (openBlock(), createBlock("span", {
                                key: 0,
                                "data-slot": "linkLabel",
                                class: ui.value.linkLabel({ class: [props.ui?.linkLabel, item.ui?.linkLabel] })
                              }, [
                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : "item-label", {
                                  item,
                                  active: item.active ?? index === __props.items.length - 1,
                                  index
                                }, () => [
                                  createTextVNode(toDisplayString(unref(get)(item, props.labelKey)), 1)
                                ])
                              ], 2)) : createCommentVNode("", true),
                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : "item-trailing", {
                                item,
                                active: item.active ?? index === __props.items.length - 1,
                                index
                              })
                            ])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_sfc_main$a, mergeProps({ ref_for: true }, slotProps, {
                        as: "span",
                        "aria-current": (item.active ?? active) && index === __props.items.length - 1 ? "page" : void 0,
                        "data-slot": "link",
                        class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: item.active ?? index === __props.items.length - 1, disabled: !!item.disabled, to: !!item.to })
                      }), {
                        default: withCtx(() => [
                          renderSlot(_ctx.$slots, item.slot || "item", {
                            item,
                            active: item.active ?? index === __props.items.length - 1,
                            index,
                            ui: ui.value
                          }, () => [
                            renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : "item-leading", {
                              item,
                              active: item.active ?? index === __props.items.length - 1,
                              index,
                              ui: ui.value
                            }, () => [
                              item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                                key: 0,
                                name: item.icon,
                                "data-slot": "linkLeadingIcon",
                                class: ui.value.linkLeadingIcon({ class: [props.ui?.linkLeadingIcon, item.ui?.linkLeadingIcon], active: item.active ?? index === __props.items.length - 1 })
                              }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                key: 1,
                                size: props.ui?.linkLeadingAvatarSize || ui.value.linkLeadingAvatarSize()
                              }, { ref_for: true }, item.avatar, {
                                "data-slot": "linkLeadingAvatar",
                                class: ui.value.linkLeadingAvatar({ class: [props.ui?.linkLeadingAvatar, item.ui?.linkLeadingAvatar], active: item.active ?? index === __props.items.length - 1 })
                              }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                            ]),
                            unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : "item-label"] ? (openBlock(), createBlock("span", {
                              key: 0,
                              "data-slot": "linkLabel",
                              class: ui.value.linkLabel({ class: [props.ui?.linkLabel, item.ui?.linkLabel] })
                            }, [
                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : "item-label", {
                                item,
                                active: item.active ?? index === __props.items.length - 1,
                                index
                              }, () => [
                                createTextVNode(toDisplayString(unref(get)(item, props.labelKey)), 1)
                              ])
                            ], 2)) : createCommentVNode("", true),
                            renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : "item-trailing", {
                              item,
                              active: item.active ?? index === __props.items.length - 1,
                              index
                            })
                          ])
                        ]),
                        _: 2
                      }, 1040, ["aria-current", "class"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</li>`);
              if (index < __props.items.length - 1) {
                _push2(`<li role="presentation" aria-hidden="true" data-slot="separator" class="${ssrRenderClass(ui.value.separator({ class: [props.ui?.separator, item.ui?.separator] }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "separator", { ui: ui.value }, () => {
                  _push2(ssrRenderComponent(_sfc_main$e, {
                    name: separatorIcon.value,
                    "data-slot": "separatorIcon",
                    class: ui.value.separatorIcon({ class: [props.ui?.separatorIcon, item.ui?.separatorIcon] })
                  }, null, _parent2, _scopeId));
                }, _push2, _parent2, _scopeId);
                _push2(`</li>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--]-->`);
            });
            _push2(`<!--]--></ol>`);
          } else {
            return [
              createVNode("ol", {
                "data-slot": "list",
                class: ui.value.list({ class: props.ui?.list })
              }, [
                (openBlock(true), createBlock(Fragment, null, renderList(__props.items, (item, index) => {
                  return openBlock(), createBlock(Fragment, { key: index }, [
                    createVNode("li", {
                      "data-slot": "item",
                      class: ui.value.item({ class: [props.ui?.item, item.ui?.item] })
                    }, [
                      createVNode(_sfc_main$9$1, mergeProps({ ref_for: true }, unref(pickLinkProps)(item), { custom: "" }), {
                        default: withCtx(({ active, ...slotProps }) => [
                          createVNode(_sfc_main$a, mergeProps({ ref_for: true }, slotProps, {
                            as: "span",
                            "aria-current": (item.active ?? active) && index === __props.items.length - 1 ? "page" : void 0,
                            "data-slot": "link",
                            class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: item.active ?? index === __props.items.length - 1, disabled: !!item.disabled, to: !!item.to })
                          }), {
                            default: withCtx(() => [
                              renderSlot(_ctx.$slots, item.slot || "item", {
                                item,
                                active: item.active ?? index === __props.items.length - 1,
                                index,
                                ui: ui.value
                              }, () => [
                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : "item-leading", {
                                  item,
                                  active: item.active ?? index === __props.items.length - 1,
                                  index,
                                  ui: ui.value
                                }, () => [
                                  item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                                    key: 0,
                                    name: item.icon,
                                    "data-slot": "linkLeadingIcon",
                                    class: ui.value.linkLeadingIcon({ class: [props.ui?.linkLeadingIcon, item.ui?.linkLeadingIcon], active: item.active ?? index === __props.items.length - 1 })
                                  }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                    key: 1,
                                    size: props.ui?.linkLeadingAvatarSize || ui.value.linkLeadingAvatarSize()
                                  }, { ref_for: true }, item.avatar, {
                                    "data-slot": "linkLeadingAvatar",
                                    class: ui.value.linkLeadingAvatar({ class: [props.ui?.linkLeadingAvatar, item.ui?.linkLeadingAvatar], active: item.active ?? index === __props.items.length - 1 })
                                  }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                                ]),
                                unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : "item-label"] ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  "data-slot": "linkLabel",
                                  class: ui.value.linkLabel({ class: [props.ui?.linkLabel, item.ui?.linkLabel] })
                                }, [
                                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : "item-label", {
                                    item,
                                    active: item.active ?? index === __props.items.length - 1,
                                    index
                                  }, () => [
                                    createTextVNode(toDisplayString(unref(get)(item, props.labelKey)), 1)
                                  ])
                                ], 2)) : createCommentVNode("", true),
                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : "item-trailing", {
                                  item,
                                  active: item.active ?? index === __props.items.length - 1,
                                  index
                                })
                              ])
                            ]),
                            _: 2
                          }, 1040, ["aria-current", "class"])
                        ]),
                        _: 2
                      }, 1040)
                    ], 2),
                    index < __props.items.length - 1 ? (openBlock(), createBlock("li", {
                      key: 0,
                      role: "presentation",
                      "aria-hidden": "true",
                      "data-slot": "separator",
                      class: ui.value.separator({ class: [props.ui?.separator, item.ui?.separator] })
                    }, [
                      renderSlot(_ctx.$slots, "separator", { ui: ui.value }, () => [
                        createVNode(_sfc_main$e, {
                          name: separatorIcon.value,
                          "data-slot": "separatorIcon",
                          class: ui.value.separatorIcon({ class: [props.ui?.separatorIcon, item.ui?.separatorIcon] })
                        }, null, 8, ["name", "class"])
                      ])
                    ], 2)) : createCommentVNode("", true)
                  ], 64);
                }), 128))
              ], 2)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/Breadcrumb.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdminBreadcrumbs",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const bottleStore = useBottleStore();
    const itemStore = useItemStore();
    const labelMap = {
      admin: "Admin",
      dashboard: "Dashboard",
      batch: "Batches",
      bottles: "Bottles",
      cocktails: "Cocktails",
      contacts: "Contacts",
      controls: "Controls",
      items: "Items",
      production: "Production",
      proofing: "Proofing",
      purchaseOrders: "Purchase Orders",
      recipes: "Recipes",
      vessels: "Vessels",
      inventory: "Inventory",
      grid: "Cheat Sheets",
      bottling: "Bottling Supplies",
      ingredients: "Base Ingredients",
      botanicals: "Botanicals",
      other: "Other Supplies",
      input: "Count Inventory",
      print: "Print Sheet"
    };
    function resolveInventoryLabel(segments) {
      const inventoryIdx = segments.indexOf("inventory");
      if (inventoryIdx === -1) return "Inventory";
      if (inventoryIdx > 0 && segments[inventoryIdx - 1] === "bottles") return "Bottle Inventory";
      return "Inventory";
    }
    function resolveEntityName(parentSegment, id) {
      switch (parentSegment) {
        case "batch": {
          const batch = batchStore.getBatchById(id);
          if (batch) {
            const recipe = recipeStore.getRecipeById(batch.recipe);
            return recipe?.name || "Batch";
          }
          return "Batch";
        }
        case "bottles": {
          const bottle = bottleStore.getBottleById(id);
          return bottle?.name || "Bottle";
        }
        case "recipes": {
          const recipe = recipeStore.getRecipeById(id);
          return recipe?.name || "Recipe";
        }
        case "items": {
          const item = itemStore.items.find((i) => i._id === id);
          return item?.name || "Item";
        }
        default:
          return id;
      }
    }
    const breadcrumbs = computed(() => {
      const segments = route.path.split("/").filter(Boolean);
      const adminIdx = segments.indexOf("admin");
      if (adminIdx === -1) return [];
      const pathSegments = segments.slice(adminIdx + 1);
      const items = [
        { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/admin/dashboard" }
      ];
      let currentPath = "/admin";
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        currentPath += `/${segment}`;
        const isLast = i === pathSegments.length - 1;
        const isId = segment.length > 10 && !labelMap[segment];
        if (isId) {
          const parentSegment = pathSegments[i - 1] || "";
          const entityName = resolveEntityName(parentSegment, segment);
          items.push({
            label: entityName,
            ...isLast ? {} : { to: currentPath }
          });
        } else if (segment !== "dashboard") {
          const label = segment === "inventory" ? resolveInventoryLabel(pathSegments) : labelMap[segment] || segment;
          items.push({
            label,
            ...isLast ? {} : { to: currentPath }
          });
        }
      }
      return items;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UBreadcrumb = _sfc_main$2;
      _push(ssrRenderComponent(_component_UBreadcrumb, mergeProps({ items: unref(breadcrumbs) }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Admin/AdminBreadcrumbs.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "AdminBreadcrumbs" });
const __nuxt_component_3_lazy = defineAsyncComponent(() => import('./AdminCommandPalette-CgLazsMy.mjs').then((c) => c.default || c));
const __nuxt_component_4_lazy = defineAsyncComponent(() => import('./AdminShortcutsHelp-KYtBSb8A.mjs').then((c) => c.default || c));
const _sfc_main = {
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const sidebarOpen = ref(false);
    const sidebarCollapsed = ref(false);
    const showBreadcrumbs = computed(() => route.path !== "/admin/dashboard" && route.path !== "/admin");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminHeader = __nuxt_component_0;
      const _component_AdminSidebar = __nuxt_component_1;
      const _component_AdminBreadcrumbs = __nuxt_component_2;
      const _component_LazyAdminCommandPalette = __nuxt_component_3_lazy;
      const _component_LazyAdminShortcutsHelp = __nuxt_component_4_lazy;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col w-screen h-screen max-h-screen bg-espresso print:h-auto print:max-h-none print:overflow-visible print:bg-white" }, _attrs))}><a href="#admin-main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-gold focus:text-espresso focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold"> Skip to main content </a>`);
      _push(ssrRenderComponent(_component_AdminHeader, {
        class: "print:hidden",
        onToggleSidebar: ($event) => sidebarOpen.value = !unref(sidebarOpen)
      }, null, _parent));
      _push(`<div class="flex flex-grow overflow-y-hidden relative print:overflow-visible">`);
      if (unref(sidebarOpen)) {
        _push(`<div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_AdminSidebar, {
        "sidebar-open": unref(sidebarOpen),
        collapsed: unref(sidebarCollapsed),
        class: "print:hidden",
        onClose: ($event) => sidebarOpen.value = false,
        onToggleCollapse: ($event) => sidebarCollapsed.value = !unref(sidebarCollapsed)
      }, null, _parent));
      _push(`<div id="admin-main" class="overflow-y-auto flex-grow bg-espresso print:overflow-visible print:bg-white"><div class="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">`);
      if (unref(showBreadcrumbs)) {
        _push(ssrRenderComponent(_component_AdminBreadcrumbs, { class: "mb-4" }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div></div>`);
      _push(ssrRenderComponent(_component_LazyAdminCommandPalette, null, null, _parent));
      _push(ssrRenderComponent(_component_LazyAdminShortcutsHelp, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const admin = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main
}, Symbol.toStringTag, { value: "Module" }));

export { admin as a, useCommandPalette as u };
//# sourceMappingURL=admin-7BUZFj_w.mjs.map
