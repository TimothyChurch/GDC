import { u as useRoute, c as __nuxt_component_1$1, d as __nuxt_component_0$2, b as __nuxt_component_2$1, a2 as isDark, e as _sfc_main$8, a3 as toggleDark, J as useState } from './server.mjs';
import { _ as _sfc_main$4 } from './Slideover-CyjfVfmV.mjs';
import { withAsyncContext, mergeProps, defineComponent, ref, withCtx, createTextVNode, toDisplayString, createVNode, unref, isRef, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { A as ALL_STAGES, c as STAGE_DISPLAY } from './batchPipeline-br9pdPdU.mjs';
import { c as callOnce } from './once-B2M6dIGV.mjs';
import { u as usePublicBottleStore } from './usePublicBottleStore-BpJ-2ITR.mjs';
import { u as usePublicCocktailStore } from './usePublicCocktailStore-Bf4dI_bQ.mjs';
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
import './conversions-t0mnZFvt.mjs';

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SiteHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const mobileOpen = ref(false);
    const navList = [
      { label: "Home", link: "/", icon: "carbon:home" },
      { label: "Menu", link: "/menu", icon: "carbon:restaurant" },
      { label: "Bottles", link: "/bottles", icon: "lucide:wine" },
      { label: "Events", link: "/events", icon: "carbon:calendar" },
      { label: "Contact", link: "/contact", icon: "carbon:email" }
    ];
    const isActive = (link) => {
      if (link === "/") return route.path === "/";
      return route.path.startsWith(link);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_NuxtImg = __nuxt_component_0$2;
      const _component_Icon = __nuxt_component_2$1;
      const _component_UButton = _sfc_main$8;
      const _component_USlideover = _sfc_main$4;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "sticky top-0 z-50 bg-charcoal/95 backdrop-blur-sm border-b border-gold/20" }, _attrs))}><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div class="hidden lg:grid grid-cols-3 items-center py-2"><nav class="flex gap-6"><!--[-->`);
      ssrRenderList(navList, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.link,
          to: item.link,
          class: ["text-sm font-semibold tracking-wide uppercase transition-colors duration-300", isActive(item.link) ? "text-gold" : "text-parchment/70 hover:text-gold"]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(item.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><div class="flex justify-center">`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: "/images/Logo.png",
              alt: "Galveston Distilling Company",
              class: "h-20 w-auto px-2",
              width: "160",
              height: "80",
              format: "webp"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtImg, {
                src: "/images/Logo.png",
                alt: "Galveston Distilling Company",
                class: "h-20 w-auto px-2",
                width: "160",
                height: "80",
                format: "webp"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex items-center gap-4 justify-end text-xl"><button class="text-parchment/70 hover:text-gold transition-colors cursor-pointer" aria-label="Toggle dark mode">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: ("isDark" in _ctx ? _ctx.isDark : unref(isDark)) ? "carbon:moon" : "carbon:sun"
      }, null, _parent));
      _push(`</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin",
        class: "text-parchment/70 hover:text-gold transition-colors",
        "aria-label": "Admin panel"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, { name: "carbon:user" }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Icon, { name: "carbon:user" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="flex items-center justify-between py-3 lg:hidden">`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: "/images/Logo.png",
              alt: "Galveston Distilling Company",
              class: "h-14 w-auto",
              width: "112",
              height: "56",
              format: "webp"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtImg, {
                src: "/images/Logo.png",
                alt: "Galveston Distilling Company",
                class: "h-14 w-auto",
                width: "112",
                height: "56",
                format: "webp"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        variant: "ghost",
        icon: "carbon:menu",
        size: "lg",
        class: "text-parchment/80 hover:text-gold",
        "aria-label": "Open menu",
        onClick: ($event) => mobileOpen.value = true
      }, null, _parent));
      _push(`</div></div>`);
      _push(ssrRenderComponent(_component_USlideover, {
        open: unref(mobileOpen),
        "onUpdate:open": ($event) => isRef(mobileOpen) ? mobileOpen.value = $event : null,
        side: "right",
        class: "lg:hidden"
      }, {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full bg-charcoal p-6"${_scopeId}><div class="flex items-center justify-between mb-8"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: "/images/Logo.png",
              alt: "Galveston Distilling Company",
              class: "h-16 w-auto",
              width: "128",
              height: "64",
              format: "webp"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "ghost",
              icon: "carbon:close",
              size: "lg",
              class: "text-parchment/60 hover:text-gold",
              "aria-label": "Close menu",
              onClick: ($event) => mobileOpen.value = false
            }, null, _parent2, _scopeId));
            _push2(`</div><nav class="flex flex-col gap-1"${_scopeId}><!--[-->`);
            ssrRenderList(navList, (item) => {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                key: item.link,
                to: item.link,
                onClick: ($event) => mobileOpen.value = false,
                class: ["flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-200", isActive(item.link) ? "text-gold bg-gold/10" : "text-parchment/80 hover:text-gold hover:bg-gold/5"]
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_Icon, {
                      name: item.icon,
                      class: "text-xl"
                    }, null, _parent3, _scopeId2));
                    _push3(` ${ssrInterpolate(item.label)}`);
                  } else {
                    return [
                      createVNode(_component_Icon, {
                        name: item.icon,
                        class: "text-xl"
                      }, null, 8, ["name"]),
                      createTextVNode(" " + toDisplayString(item.label), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></nav><div class="border-t border-parchment/10 mt-6 pt-6 flex flex-col gap-1"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/admin",
              onClick: ($event) => mobileOpen.value = false,
              class: "flex items-center gap-3 px-4 py-3 rounded-lg text-parchment/80 hover:text-gold hover:bg-gold/5 transition-colors"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_Icon, {
                    name: "carbon:user",
                    class: "text-xl"
                  }, null, _parent3, _scopeId2));
                  _push3(`<span class="text-lg font-semibold"${_scopeId2}>Admin</span>`);
                } else {
                  return [
                    createVNode(_component_Icon, {
                      name: "carbon:user",
                      class: "text-xl"
                    }),
                    createVNode("span", { class: "text-lg font-semibold" }, "Admin")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "ghost",
              icon: ("isDark" in _ctx ? _ctx.isDark : unref(isDark)) ? "carbon:moon" : "carbon:sun",
              label: ("isDark" in _ctx ? _ctx.isDark : unref(isDark)) ? "Dark Mode" : "Light Mode",
              block: "",
              class: "justify-start px-4 py-3 text-parchment/80 hover:text-gold hover:bg-gold/5 text-lg font-semibold",
              onClick: ($event) => {
                ("toggleDark" in _ctx ? _ctx.toggleDark : unref(toggleDark))();
                mobileOpen.value = false;
              }
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col h-full bg-charcoal p-6" }, [
                createVNode("div", { class: "flex items-center justify-between mb-8" }, [
                  createVNode(_component_NuxtImg, {
                    src: "/images/Logo.png",
                    alt: "Galveston Distilling Company",
                    class: "h-16 w-auto",
                    width: "128",
                    height: "64",
                    format: "webp"
                  }),
                  createVNode(_component_UButton, {
                    variant: "ghost",
                    icon: "carbon:close",
                    size: "lg",
                    class: "text-parchment/60 hover:text-gold",
                    "aria-label": "Close menu",
                    onClick: ($event) => mobileOpen.value = false
                  }, null, 8, ["onClick"])
                ]),
                createVNode("nav", { class: "flex flex-col gap-1" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(navList, (item) => {
                    return createVNode(_component_NuxtLink, {
                      key: item.link,
                      to: item.link,
                      onClick: ($event) => mobileOpen.value = false,
                      class: ["flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-200", isActive(item.link) ? "text-gold bg-gold/10" : "text-parchment/80 hover:text-gold hover:bg-gold/5"]
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_Icon, {
                          name: item.icon,
                          class: "text-xl"
                        }, null, 8, ["name"]),
                        createTextVNode(" " + toDisplayString(item.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["to", "onClick", "class"]);
                  }), 64))
                ]),
                createVNode("div", { class: "border-t border-parchment/10 mt-6 pt-6 flex flex-col gap-1" }, [
                  createVNode(_component_NuxtLink, {
                    to: "/admin",
                    onClick: ($event) => mobileOpen.value = false,
                    class: "flex items-center gap-3 px-4 py-3 rounded-lg text-parchment/80 hover:text-gold hover:bg-gold/5 transition-colors"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_Icon, {
                        name: "carbon:user",
                        class: "text-xl"
                      }),
                      createVNode("span", { class: "text-lg font-semibold" }, "Admin")
                    ]),
                    _: 1
                  }, 8, ["onClick"]),
                  createVNode(_component_UButton, {
                    variant: "ghost",
                    icon: ("isDark" in _ctx ? _ctx.isDark : unref(isDark)) ? "carbon:moon" : "carbon:sun",
                    label: ("isDark" in _ctx ? _ctx.isDark : unref(isDark)) ? "Dark Mode" : "Light Mode",
                    block: "",
                    class: "justify-start px-4 py-3 text-parchment/80 hover:text-gold hover:bg-gold/5 text-lg font-semibold",
                    onClick: ($event) => {
                      ("toggleDark" in _ctx ? _ctx.toggleDark : unref(toggleDark))();
                      mobileOpen.value = false;
                    }
                  }, null, 8, ["icon", "label", "onClick"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SiteHeader.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$3, { __name: "SiteHeader" });
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtImg = __nuxt_component_0$2;
  const _component_NuxtLink = __nuxt_component_1$1;
  const _component_Icon = __nuxt_component_2$1;
  _push(`<footer${ssrRenderAttrs(mergeProps({ class: "bg-charcoal text-parchment/90" }, _attrs))}><div class="mx-auto max-w-7xl px-6 py-12 lg:px-8"><div class="flex justify-center mb-8">`);
  _push(ssrRenderComponent(_component_NuxtImg, {
    src: "/images/Logo.png",
    alt: "Galveston Distilling Company",
    class: "h-24 w-auto",
    width: "192",
    height: "96",
    loading: "lazy",
    format: "webp"
  }, null, _parent));
  _push(`</div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left"><div class="flex flex-col gap-2"><span class="text-lg font-bold text-gold font-[Cormorant_Garamond]">Location</span><span class="text-sm">2618 Market St.</span><span class="text-sm">Galveston, TX 77550</span><a href="https://maps.google.com/?q=2618+Market+St+Galveston+TX+77550" target="_blank" rel="noopener noreferrer" class="text-sm text-gold hover:text-copper transition-colors mt-1"> Get Directions </a></div><div class="flex flex-col gap-2"><span class="text-lg font-bold text-gold font-[Cormorant_Garamond]">Hours</span><span class="text-sm">Monday - Saturday</span><span class="text-sm">11:00 AM - 11:00 PM</span></div><div class="flex flex-col gap-2"><span class="text-lg font-bold text-gold font-[Cormorant_Garamond]">Quick Links</span>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/menu",
    class: "text-sm text-parchment/80 hover:text-gold transition-colors"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Cocktail Menu`);
      } else {
        return [
          createTextVNode("Cocktail Menu")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/bottles",
    class: "text-sm text-parchment/80 hover:text-gold transition-colors"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Our Spirits`);
      } else {
        return [
          createTextVNode("Our Spirits")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/events",
    class: "text-sm text-parchment/80 hover:text-gold transition-colors"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Events`);
      } else {
        return [
          createTextVNode("Events")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/contact",
    class: "text-sm text-parchment/80 hover:text-gold transition-colors"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Contact`);
      } else {
        return [
          createTextVNode("Contact")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><div class="flex flex-col gap-2"><span class="text-lg font-bold text-gold font-[Cormorant_Garamond]">Contact</span><a href="mailto:Timothy@GalvestonDistillingCo.com" class="text-sm text-parchment/80 hover:text-gold transition-colors break-all"> Timothy@GalvestonDistillingCo.com </a><a href="tel:14093513248" class="text-sm text-parchment/80 hover:text-gold transition-colors"> (409) 351-3248 </a></div></div><div class="flex justify-center gap-6 mt-10"><a href="https://www.instagram.com/galvestondistillingco/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="text-parchment/60 hover:text-gold transition-colors">`);
  _push(ssrRenderComponent(_component_Icon, {
    name: "carbon:logo-instagram",
    class: "text-xl"
  }, null, _parent));
  _push(`</a><a href="https://www.facebook.com/GalvestonDistillingCo/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="text-parchment/60 hover:text-gold transition-colors">`);
  _push(ssrRenderComponent(_component_Icon, {
    name: "carbon:logo-facebook",
    class: "text-xl"
  }, null, _parent));
  _push(`</a></div><div class="border-t border-parchment/10 mt-8 pt-6 text-center"><p class="text-xs text-parchment/60"> © ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} Galveston Distilling Company. All rights reserved. </p></div></div></footer>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SiteFooter.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]), { __name: "SiteFooter" });
const useAgeVerification = () => {
  const ageVerified = useState("ageVerified", () => false);
  return { ageVerified };
};
ALL_STAGES.map((name) => ({
  name,
  icon: STAGE_DISPLAY[name].icon,
  color: STAGE_DISPLAY[name].color
}));
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ModalAge",
  __ssrInlineRender: true,
  setup(__props) {
    const { ageVerified } = useAgeVerification();
    const denied = ref(false);
    const over21 = () => {
      ageVerified.value = true;
    };
    const under21 = () => {
      denied.value = true;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_0$2;
      const _component_UButton = _sfc_main$8;
      if (!unref(ageVerified)) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "age-modal-title",
          class: "fixed inset-0 z-[100] flex items-center justify-center bg-espresso/95 backdrop-blur-sm"
        }, _attrs))}><div class="bg-charcoal rounded-xl shadow-2xl border border-gold/20 max-w-md w-full mx-4 p-8 text-center">`);
        _push(ssrRenderComponent(_component_NuxtImg, {
          src: "/images/Logo.png",
          alt: "Galveston Distilling Company",
          class: "h-24 w-auto mx-auto mb-6",
          width: "192",
          height: "96",
          format: "webp"
        }, null, _parent));
        if (!unref(denied)) {
          _push(`<!--[--><h2 id="age-modal-title" class="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-bold text-parchment mb-2"> Welcome </h2><p class="text-parchment/70 mb-8"> You must be of legal drinking age to enter this site. </p><p class="text-parchment text-lg font-semibold mb-6"> Are you 21 or older? </p><div class="flex justify-center gap-4">`);
          _push(ssrRenderComponent(_component_UButton, {
            label: "Yes, I'm 21+",
            size: "xl",
            class: "px-8 bg-gold text-espresso font-semibold hover:bg-copper transition-colors duration-300",
            onClick: over21
          }, null, _parent));
          _push(ssrRenderComponent(_component_UButton, {
            label: "No, I'm not",
            variant: "outline",
            color: "neutral",
            size: "xl",
            class: "px-8 border-parchment/30 text-parchment/70 font-semibold hover:border-parchment/50 transition-colors duration-300",
            onClick: under21
          }, null, _parent));
          _push(`</div><!--]-->`);
        } else {
          _push(`<!--[--><h2 class="font-[Cormorant_Garamond] text-2xl font-bold text-parchment mb-4"> Sorry </h2><p class="text-parchment/70 mb-6"> You must be 21 or older to access this site. Please visit again when you are of legal drinking age. </p><p class="text-parchment/60 text-sm"> Enjoy responsibly. </p><!--]-->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Modal/ModalAge.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "ModalAge" });
const _sfc_main = {
  __name: "default",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    [__temp, __restore] = withAsyncContext(async () => callOnce(
      "public-stores",
      async () => {
        await Promise.all([
          usePublicBottleStore().ensureLoaded(),
          usePublicCocktailStore().ensureLoaded()
        ]);
      },
      "$7raKzqmhv4"
      /* nuxt-injected */
    )), await __temp, __restore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SiteHeader = __nuxt_component_0;
      const _component_SiteFooter = __nuxt_component_1;
      const _component_ModalAge = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col" }, _attrs))}><a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-gold focus:text-espresso focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold"> Skip to main content </a>`);
      _push(ssrRenderComponent(_component_SiteHeader, null, null, _parent));
      _push(`<main id="main-content" class="flex-1">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      _push(ssrRenderComponent(_component_SiteFooter, null, null, _parent));
      _push(ssrRenderComponent(_component_ModalAge, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-Bt-7nJE5.mjs.map
