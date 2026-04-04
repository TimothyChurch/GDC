import { _ as __nuxt_component_0 } from './SitePageHero-6cglFhn2.mjs';
import { a as useSeoMeta, b as __nuxt_component_2, c as __nuxt_component_1$1, e as _sfc_main$8 } from './server.mjs';
import { defineComponent, ref, withCtx, createVNode, createTextVNode, unref, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DKhDg1g7.mjs';
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
import '@vue/shared';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "cocktailClass",
  __ssrInlineRender: true,
  setup(__props) {
    {
      useSeoMeta({
        title: "Cocktail Classes | Galveston Distilling Co",
        description: "Join our hands-on cocktail classes and learn to craft drinks with Galveston-made spirits.",
        ogTitle: "Cocktail Classes | Galveston Distilling Co",
        ogDescription: "Join our hands-on cocktail classes and learn to craft drinks with Galveston-made spirits.",
        ogImage: "https://galvestondistilling.com/images/og-events.jpg",
        ogUrl: "https://galvestondistilling.com/events/cocktailClass"
      });
    }
    const { data: upcomingClasses, status: classesStatus } = useFetch(
      "/api/event/upcoming",
      "$2bN5NjLIh1"
      /* nuxt-injected */
    );
    function formatClassDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    }
    function formatClassTime(dateStr) {
      return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      });
    }
    function availableSeats(event) {
      if (!event.capacity) return null;
      return event.capacity - (event.groupSize || 0);
    }
    function isSoldOut(event) {
      const seats = availableSeats(event);
      return seats !== null && seats <= 0;
    }
    function formatPrice(dollars) {
      return `$${dollars.toFixed(2)}`;
    }
    const requestForm = ref({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      date: "",
      groupSize: null,
      notes: ""
    });
    const requestStatus = ref("idle");
    const requestMessage = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SitePageHero = __nuxt_component_0;
      const _component_Icon = __nuxt_component_2;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_SitePageHero, {
        title: "Cocktail Classes",
        subtitle: "Learn to craft cocktails from our expert bartenders",
        "background-image": "/images/class.jpg"
      }, null, _parent));
      _push(`<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12"><div class="grid lg:grid-cols-2 gap-12 items-start"><div><h2 class="font-[Cormorant_Garamond] text-3xl font-bold mb-6"> What to Expect </h2><div class="w-12 h-0.5 bg-gold/40 mb-6"></div><div class="space-y-6 text-brown/80 dark:text-parchment/80"><p class="leading-relaxed"> Join us for a hands-on cocktail class where you&#39;ll learn the art of mixology using our house-distilled spirits. Our bartenders will walk you through techniques, flavor profiles, and the stories behind each spirit. </p><div class="grid grid-cols-2 gap-4"><div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:time",
        class: "text-gold text-xl mb-2"
      }, null, _parent));
      _push(`<span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Duration</span><p class="font-semibold mt-1">~2 Hours</p></div><div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:group",
        class: "text-gold text-xl mb-2"
      }, null, _parent));
      _push(`<span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Group Size</span><p class="font-semibold mt-1">Up to 12</p></div><div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:drink-02",
        class: "text-gold text-xl mb-2"
      }, null, _parent));
      _push(`<span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Includes</span><p class="font-semibold mt-1">3 Cocktails</p></div><div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:location",
        class: "text-gold text-xl mb-2"
      }, null, _parent));
      _push(`<span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Location</span><p class="font-semibold mt-1">Tasting Room</p></div></div><div><h3 class="font-[Cormorant_Garamond] text-xl font-bold mb-3">What&#39;s Included</h3><ul class="space-y-2"><li class="flex items-start gap-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:checkmark",
        class: "text-gold mt-0.5 shrink-0"
      }, null, _parent));
      _push(`<span>Guided instruction from our bartenders</span></li><li class="flex items-start gap-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:checkmark",
        class: "text-gold mt-0.5 shrink-0"
      }, null, _parent));
      _push(`<span>Three handcrafted cocktails to make and enjoy</span></li><li class="flex items-start gap-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:checkmark",
        class: "text-gold mt-0.5 shrink-0"
      }, null, _parent));
      _push(`<span>Recipe cards to take home</span></li><li class="flex items-start gap-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:checkmark",
        class: "text-gold mt-0.5 shrink-0"
      }, null, _parent));
      _push(`<span>Discount on bottle purchases after class</span></li></ul></div></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/events",
        class: "inline-flex items-center gap-1 text-sm text-gold hover:text-copper transition-colors mt-8"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, { name: "carbon:arrow-left" }, null, _parent2, _scopeId));
            _push2(` Back to all events `);
          } else {
            return [
              createVNode(_component_Icon, { name: "carbon:arrow-left" }),
              createTextVNode(" Back to all events ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div><h2 class="font-[Cormorant_Garamond] text-3xl font-bold mb-6"> Upcoming Classes </h2><div class="w-12 h-0.5 bg-gold/40 mb-6"></div>`);
      if (unref(classesStatus) === "pending") {
        _push(`<div class="flex justify-center py-8"><span class="text-brown/50 dark:text-parchment/50">Loading classes...</span></div>`);
      } else if (unref(upcomingClasses)?.length) {
        _push(`<div class="space-y-6"><!--[-->`);
        ssrRenderList(unref(upcomingClasses), (cls) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: cls._id,
            to: `/events/classes/${cls._id}`,
            class: "block bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6 hover:border-gold/30 hover:shadow-lg transition-all duration-300 group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center gap-2 text-gold mb-3"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "carbon:calendar",
                  class: "text-lg"
                }, null, _parent2, _scopeId));
                _push2(`<span class="text-sm font-semibold uppercase tracking-wider"${_scopeId}>${ssrInterpolate(cls.type)}</span></div><h3 class="font-[Cormorant_Garamond] text-xl font-bold mb-1 group-hover:text-gold transition-colors"${_scopeId}>${ssrInterpolate(formatClassDate(cls.date))}</h3><p class="text-sm text-brown/60 dark:text-parchment/60 mb-4"${_scopeId}>${ssrInterpolate(formatClassTime(cls.date))}</p><div class="flex items-center justify-between"${_scopeId}><div class="flex items-center gap-2 text-sm text-brown/70 dark:text-parchment/70"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "carbon:group",
                  class: "text-base"
                }, null, _parent2, _scopeId));
                if (isSoldOut(cls)) {
                  _push2(`<span class="text-red-500 font-semibold"${_scopeId}>Sold Out</span>`);
                } else if (availableSeats(cls) !== null) {
                  _push2(`<span${_scopeId}><strong class="text-brown dark:text-parchment"${_scopeId}>${ssrInterpolate(availableSeats(cls))}</strong> seats available </span>`);
                } else {
                  _push2(`<span${_scopeId}>Open enrollment</span>`);
                }
                _push2(`</div><div class="flex items-center gap-3"${_scopeId}>`);
                if (cls.price) {
                  _push2(`<span class="text-lg font-bold text-gold"${_scopeId}>${ssrInterpolate(formatPrice(cls.price))}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (!isSoldOut(cls)) {
                  _push2(`<span class="text-sm font-semibold text-gold group-hover:text-copper transition-colors"${_scopeId}> Book Now → </span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-center gap-2 text-gold mb-3" }, [
                    createVNode(_component_Icon, {
                      name: "carbon:calendar",
                      class: "text-lg"
                    }),
                    createVNode("span", { class: "text-sm font-semibold uppercase tracking-wider" }, toDisplayString(cls.type), 1)
                  ]),
                  createVNode("h3", { class: "font-[Cormorant_Garamond] text-xl font-bold mb-1 group-hover:text-gold transition-colors" }, toDisplayString(formatClassDate(cls.date)), 1),
                  createVNode("p", { class: "text-sm text-brown/60 dark:text-parchment/60 mb-4" }, toDisplayString(formatClassTime(cls.date)), 1),
                  createVNode("div", { class: "flex items-center justify-between" }, [
                    createVNode("div", { class: "flex items-center gap-2 text-sm text-brown/70 dark:text-parchment/70" }, [
                      createVNode(_component_Icon, {
                        name: "carbon:group",
                        class: "text-base"
                      }),
                      isSoldOut(cls) ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "text-red-500 font-semibold"
                      }, "Sold Out")) : availableSeats(cls) !== null ? (openBlock(), createBlock("span", { key: 1 }, [
                        createVNode("strong", { class: "text-brown dark:text-parchment" }, toDisplayString(availableSeats(cls)), 1),
                        createTextVNode(" seats available ")
                      ])) : (openBlock(), createBlock("span", { key: 2 }, "Open enrollment"))
                    ]),
                    createVNode("div", { class: "flex items-center gap-3" }, [
                      cls.price ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "text-lg font-bold text-gold"
                      }, toDisplayString(formatPrice(cls.price)), 1)) : createCommentVNode("", true),
                      !isSoldOut(cls) ? (openBlock(), createBlock("span", {
                        key: 1,
                        class: "text-sm font-semibold text-gold group-hover:text-copper transition-colors"
                      }, " Book Now → ")) : createCommentVNode("", true)
                    ])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-8 text-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:calendar",
          class: "text-3xl text-brown/20 dark:text-parchment/20 mb-3"
        }, null, _parent));
        _push(`<p class="text-brown/60 dark:text-parchment/60"> No upcoming classes scheduled right now. Check back soon or request a private class below! </p></div>`);
      }
      _push(`</div></div><div class="lg:col-span-2 mt-12 pt-12 border-t border-gold/10"><div class="max-w-2xl mx-auto text-center mb-8"><h2 class="font-[Cormorant_Garamond] text-3xl font-bold mb-4"> Request a Private Class </h2><div class="w-12 h-0.5 bg-gold/40 mx-auto mb-4"></div><p class="text-brown/80 dark:text-parchment/80"> Want an exclusive experience for your group? Fill out the form below and we&#39;ll get back to you to arrange your private cocktail class. </p></div>`);
      if (unref(requestStatus) === "success") {
        _push(`<div class="max-w-2xl mx-auto"><div class="bg-green-900/20 border border-green-500/30 rounded-xl p-8 text-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:checkmark-filled",
          class: "text-green-500 text-3xl mb-3"
        }, null, _parent));
        _push(`<p class="text-green-400 font-semibold text-lg">${ssrInterpolate(unref(requestMessage))}</p></div></div>`);
      } else {
        _push(`<form class="max-w-2xl mx-auto space-y-4"><div class="grid sm:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">First Name *</label><input${ssrRenderAttr("value", unref(requestForm).firstName)} type="text" required${ssrIncludeBooleanAttr(unref(requestStatus) === "loading") ? " disabled" : ""} class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="First name"></div><div><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Last Name *</label><input${ssrRenderAttr("value", unref(requestForm).lastName)} type="text" required${ssrIncludeBooleanAttr(unref(requestStatus) === "loading") ? " disabled" : ""} class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="Last name"></div></div><div class="grid sm:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Email *</label><input${ssrRenderAttr("value", unref(requestForm).email)} type="email" required${ssrIncludeBooleanAttr(unref(requestStatus) === "loading") ? " disabled" : ""} class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="you@email.com"></div><div><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Phone</label><input${ssrRenderAttr("value", unref(requestForm).phone)} type="tel"${ssrIncludeBooleanAttr(unref(requestStatus) === "loading") ? " disabled" : ""} class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="(555) 555-5555"></div></div><div class="grid sm:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Preferred Date *</label><input${ssrRenderAttr("value", unref(requestForm).date)} type="date" required${ssrIncludeBooleanAttr(unref(requestStatus) === "loading") ? " disabled" : ""} class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6"></div><div><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Group Size *</label><input${ssrRenderAttr("value", unref(requestForm).groupSize)} type="number" min="1" required${ssrIncludeBooleanAttr(unref(requestStatus) === "loading") ? " disabled" : ""} class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="Number of guests"></div></div><div><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Notes</label><textarea rows="3"${ssrIncludeBooleanAttr(unref(requestStatus) === "loading") ? " disabled" : ""} class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="Any special requests or details...">${ssrInterpolate(unref(requestForm).notes)}</textarea></div><div class="flex justify-center pt-2">`);
        _push(ssrRenderComponent(_component_UButton, {
          type: "submit",
          disabled: unref(requestStatus) === "loading",
          loading: unref(requestStatus) === "loading",
          label: unref(requestStatus) === "loading" ? "Submitting..." : "Submit Request",
          class: "bg-gold text-espresso hover:bg-copper"
        }, null, _parent));
        _push(`</div>`);
        if (unref(requestStatus) === "error") {
          _push(`<p class="text-center text-sm text-red-500">${ssrInterpolate(unref(requestMessage))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</form>`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/events/cocktailClass.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=cocktailClass-CJEkFoxV.mjs.map
