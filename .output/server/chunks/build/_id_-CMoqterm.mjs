import { u as useRoute, a as useSeoMeta, b as __nuxt_component_2, c as __nuxt_component_1$1, e as _sfc_main$8, n as navigateTo } from './server.mjs';
import { _ as __nuxt_component_0 } from './SitePageHero-6cglFhn2.mjs';
import { defineComponent, ref, computed, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
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
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const classId = route.params.id;
    const { data: classEvent, status: fetchStatus, error: fetchError } = useFetch(
      `/api/event/public/${classId}`,
      "$1aTX182y1T"
      /* nuxt-injected */
    );
    {
      useSeoMeta({
        title: "Cocktail Class | Galveston Distilling Co",
        description: "Book your spot in a hands-on cocktail class at Galveston Distilling Co.",
        ogTitle: "Cocktail Class | Galveston Distilling Co",
        ogDescription: "Book your spot in a hands-on cocktail class at Galveston Distilling Co.",
        ogImage: "https://galvestondistilling.com/images/og-events.jpg"
      });
    }
    const quantity = ref(1);
    const selectedAddOns = ref({});
    const checkoutLoading = ref(false);
    const checkoutError = ref("");
    const customer = ref({
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    });
    const availableSeats = computed(() => {
      if (!classEvent.value?.capacity) return null;
      return classEvent.value.capacity - (classEvent.value.groupSize || 0);
    });
    const isSoldOut = computed(() => {
      return availableSeats.value !== null && availableSeats.value <= 0;
    });
    const maxQuantity = computed(() => {
      if (availableSeats.value === null) return 20;
      return Math.max(0, availableSeats.value);
    });
    const bookingTotal = computed(() => {
      if (!classEvent.value?.price) return 0;
      let total = classEvent.value.price * quantity.value;
      if (classEvent.value.addOns) {
        for (const addOn of classEvent.value.addOns) {
          if (selectedAddOns.value[addOn.name]) {
            total += addOn.price * quantity.value;
          }
        }
      }
      return total;
    });
    function formatPrice(dollars) {
      return `$${dollars.toFixed(2)}`;
    }
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
    function decrementQuantity() {
      if (quantity.value > 1) quantity.value--;
    }
    function incrementQuantity() {
      if (quantity.value < maxQuantity.value) quantity.value++;
    }
    const canSubmit = computed(() => {
      return customer.value.firstName.trim() && customer.value.lastName.trim() && customer.value.email.trim();
    });
    async function proceedToPayment() {
      if (!classEvent.value || isSoldOut.value || !canSubmit.value) return;
      checkoutLoading.value = true;
      checkoutError.value = "";
      try {
        const addOns = Object.entries(selectedAddOns.value).filter(([, selected]) => selected).map(([name]) => ({ name, quantity: quantity.value }));
        const { url, orderId } = await $fetch("/api/square/create-checkout", {
          method: "POST",
          body: {
            origin: { type: "event", id: classId },
            quantity: quantity.value,
            addOns,
            customer: {
              firstName: customer.value.firstName.trim(),
              lastName: customer.value.lastName.trim(),
              email: customer.value.email.trim(),
              phone: customer.value.phone.trim() || void 0
            }
          }
        });
        sessionStorage.setItem("square_order_id", orderId);
        await navigateTo(url, { external: true });
      } catch (e) {
        checkoutError.value = e?.data?.statusMessage || "Unable to start checkout. Please try again.";
      } finally {
        checkoutLoading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_2;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UButton = _sfc_main$8;
      const _component_SitePageHero = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(fetchStatus) === "pending") {
        _push(`<div class="min-h-screen flex items-center justify-center"><span class="text-brown/50 dark:text-parchment/50">Loading class details...</span></div>`);
      } else if (unref(fetchError) || !unref(classEvent)) {
        _push(`<div class="min-h-screen flex items-center justify-center px-4"><div class="text-center space-y-4">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:warning",
          class: "text-4xl text-brown/30 dark:text-parchment/30"
        }, null, _parent));
        _push(`<h1 class="text-2xl font-bold">Class Not Found</h1><p class="text-brown/60 dark:text-parchment/60">This class may no longer be available.</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/events/cocktailClass" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                label: "Browse Classes",
                class: "bg-gold text-espresso hover:bg-copper"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  label: "Browse Classes",
                  class: "bg-gold text-espresso hover:bg-copper"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_SitePageHero, {
          title: unref(classEvent).type,
          subtitle: `${formatClassDate(unref(classEvent).date)} at ${formatClassTime(unref(classEvent).date)}`,
          "background-image": "/images/class.jpg"
        }, null, _parent));
        _push(`<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12"><div class="grid lg:grid-cols-5 gap-12 items-start"><div class="lg:col-span-3 space-y-8"><div><h2 class="font-[Cormorant_Garamond] text-3xl font-bold mb-4">About This Class</h2><div class="w-12 h-0.5 bg-gold/40 mb-6"></div><p class="text-brown/80 dark:text-parchment/80 leading-relaxed"> Join us for a hands-on cocktail class where you&#39;ll learn the art of mixology using our house-distilled spirits. Our bartenders will walk you through techniques, flavor profiles, and the stories behind each spirit. </p></div><div class="grid sm:grid-cols-2 gap-4"><div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:calendar",
          class: "text-gold text-xl mb-2"
        }, null, _parent));
        _push(`<span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Date</span><p class="font-semibold mt-1">${ssrInterpolate(formatClassDate(unref(classEvent).date))}</p></div><div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:time",
          class: "text-gold text-xl mb-2"
        }, null, _parent));
        _push(`<span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Time</span><p class="font-semibold mt-1">${ssrInterpolate(formatClassTime(unref(classEvent).date))}</p></div><div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:drink-02",
          class: "text-gold text-xl mb-2"
        }, null, _parent));
        _push(`<span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Includes</span><p class="font-semibold mt-1">3 Cocktails</p></div><div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:location",
          class: "text-gold text-xl mb-2"
        }, null, _parent));
        _push(`<span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Location</span><p class="font-semibold mt-1">Tasting Room</p></div></div><div><h3 class="font-[Cormorant_Garamond] text-xl font-bold mb-3">What&#39;s Included</h3><ul class="space-y-2 text-brown/80 dark:text-parchment/80"><li class="flex items-start gap-2">`);
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
        _push(`<span>Discount on bottle purchases after class</span></li></ul></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/events/cocktailClass",
          class: "inline-flex items-center gap-1 text-sm text-gold hover:text-copper transition-colors"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, { name: "carbon:arrow-left" }, null, _parent2, _scopeId));
              _push2(` Back to all classes `);
            } else {
              return [
                createVNode(_component_Icon, { name: "carbon:arrow-left" }),
                createTextVNode(" Back to all classes ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="lg:col-span-2"><div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6 sticky top-8"><h3 class="font-[Cormorant_Garamond] text-2xl font-bold mb-1">Book Your Spot</h3>`);
        if (unref(classEvent).price) {
          _push(`<div class="text-2xl font-bold text-gold mb-4">${ssrInterpolate(formatPrice(unref(classEvent).price))} <span class="text-sm font-normal text-brown/60 dark:text-parchment/60">per person</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex items-center gap-2 text-sm mb-6">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:group",
          class: "text-base text-brown/50 dark:text-parchment/50"
        }, null, _parent));
        if (unref(isSoldOut)) {
          _push(`<span class="text-red-500 font-semibold">Sold Out</span>`);
        } else if (unref(availableSeats) !== null) {
          _push(`<span class="text-brown/70 dark:text-parchment/70"><strong class="text-brown dark:text-parchment">${ssrInterpolate(unref(availableSeats))}</strong> seats available </span>`);
        } else {
          _push(`<span class="text-brown/70 dark:text-parchment/70">Open enrollment</span>`);
        }
        _push(`</div>`);
        if (unref(isSoldOut)) {
          _push(`<div class="text-center py-4"><p class="text-brown/60 dark:text-parchment/60 mb-4">This class is fully booked.</p>`);
          _push(ssrRenderComponent(_component_NuxtLink, { to: "/events/cocktailClass" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UButton, {
                  label: "See Other Classes",
                  variant: "outline",
                  class: "border-gold text-gold hover:bg-gold/10"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UButton, {
                    label: "See Other Classes",
                    variant: "outline",
                    class: "border-gold text-gold hover:bg-gold/10"
                  })
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!--[--><div class="mb-6 space-y-3"><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70">Your Information</label><div class="grid grid-cols-2 gap-3"><input${ssrRenderAttr("value", unref(customer).firstName)} type="text" required placeholder="First name *" class="w-full rounded-md bg-white dark:bg-espresso/50 px-3 py-2 text-sm text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/40 dark:placeholder:text-parchment/40 focus:outline-2 focus:-outline-offset-2 focus:outline-gold"><input${ssrRenderAttr("value", unref(customer).lastName)} type="text" required placeholder="Last name *" class="w-full rounded-md bg-white dark:bg-espresso/50 px-3 py-2 text-sm text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/40 dark:placeholder:text-parchment/40 focus:outline-2 focus:-outline-offset-2 focus:outline-gold"></div><input${ssrRenderAttr("value", unref(customer).email)} type="email" required placeholder="Email address *" class="w-full rounded-md bg-white dark:bg-espresso/50 px-3 py-2 text-sm text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/40 dark:placeholder:text-parchment/40 focus:outline-2 focus:-outline-offset-2 focus:outline-gold"><input${ssrRenderAttr("value", unref(customer).phone)} type="tel" placeholder="Phone number (optional)" class="w-full rounded-md bg-white dark:bg-espresso/50 px-3 py-2 text-sm text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/40 dark:placeholder:text-parchment/40 focus:outline-2 focus:-outline-offset-2 focus:outline-gold"></div><div class="mb-6"><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-2">Number of Guests</label><div class="flex items-center gap-3">`);
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-minus",
            color: "neutral",
            variant: "outline",
            size: "sm",
            disabled: unref(quantity) <= 1,
            onClick: decrementQuantity
          }, null, _parent));
          _push(`<span class="text-xl font-bold w-12 text-center">${ssrInterpolate(unref(quantity))}</span>`);
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-plus",
            color: "neutral",
            variant: "outline",
            size: "sm",
            disabled: unref(quantity) >= unref(maxQuantity),
            onClick: incrementQuantity
          }, null, _parent));
          _push(`</div></div>`);
          if (unref(classEvent).addOns?.length) {
            _push(`<div class="mb-6"><label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-3">Add-ons</label><div class="space-y-3"><!--[-->`);
            ssrRenderList(unref(classEvent).addOns, (addOn) => {
              _push(`<label class="flex items-start gap-3 cursor-pointer group"><input${ssrIncludeBooleanAttr(Array.isArray(unref(selectedAddOns)[addOn.name]) ? ssrLooseContain(unref(selectedAddOns)[addOn.name], null) : unref(selectedAddOns)[addOn.name]) ? " checked" : ""} type="checkbox" class="mt-1 rounded border-gold/30 text-gold focus:ring-gold"><div class="flex-1"><div class="flex items-center justify-between"><span class="font-medium text-sm group-hover:text-gold transition-colors">${ssrInterpolate(addOn.name)}</span><span class="text-sm text-gold font-semibold">+${ssrInterpolate(formatPrice(addOn.price))}/person</span></div>`);
              if (addOn.description) {
                _push(`<p class="text-xs text-brown/50 dark:text-parchment/50 mt-0.5">${ssrInterpolate(addOn.description)}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></label>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="border-t border-gold/10 pt-4 mb-6 space-y-2">`);
          if (unref(classEvent).price) {
            _push(`<div class="flex justify-between text-sm text-brown/70 dark:text-parchment/70"><span>${ssrInterpolate(unref(quantity))} x ${ssrInterpolate(formatPrice(unref(classEvent).price))}</span><span>${ssrInterpolate(formatPrice(unref(classEvent).price * unref(quantity)))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(classEvent).addOns?.length) {
            _push(`<!--[-->`);
            ssrRenderList(unref(classEvent).addOns.filter((a) => unref(selectedAddOns)[a.name]), (addOn) => {
              _push(`<div class="flex justify-between text-sm text-brown/70 dark:text-parchment/70"><span>${ssrInterpolate(addOn.name)} x ${ssrInterpolate(unref(quantity))}</span><span>${ssrInterpolate(formatPrice(addOn.price * unref(quantity)))}</span></div>`);
            });
            _push(`<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex justify-between font-bold text-lg pt-2 border-t border-gold/10"><span>Total</span><span class="text-gold">${ssrInterpolate(formatPrice(unref(bookingTotal)))}</span></div></div>`);
          _push(ssrRenderComponent(_component_UButton, {
            block: "",
            loading: unref(checkoutLoading),
            disabled: !unref(classEvent).price || unref(bookingTotal) === 0 || !unref(canSubmit),
            label: "Proceed to Payment",
            class: "bg-gold text-espresso hover:bg-copper",
            onClick: proceedToPayment
          }, null, _parent));
          if (unref(checkoutError)) {
            _push(`<p class="text-center text-sm text-red-500 mt-3">${ssrInterpolate(unref(checkoutError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<p class="text-xs text-brown/40 dark:text-parchment/40 text-center mt-3"> You&#39;ll be redirected to Square for secure payment </p><!--]-->`);
        }
        _push(`</div></div></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/events/classes/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-CMoqterm.mjs.map
