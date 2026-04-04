import { _ as _sfc_main$1 } from './Form-B0crAOcM.mjs';
import { _ as _sfc_main$2 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$3 } from './Input-Fd8Vd_4J.mjs';
import { a as useSeoMeta, h as useRouter, e as _sfc_main$8 } from './server.mjs';
import { defineComponent, withAsyncContext, ref, mergeProps, unref, withCtx, isRef, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-DX6ojG3V.mjs';
import { c as callOnce } from './once-B2M6dIGV.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    {
      useSeoMeta({
        title: "Sign In | Galveston Distilling Co",
        robots: "noindex, nofollow"
      });
    }
    const router = useRouter();
    const { user, login, fetchUser } = useAuth();
    [__temp, __restore] = withAsyncContext(async () => callOnce(
      async () => {
        await fetchUser();
        if (user.value) {
          router.push("/admin/dashboard");
        }
      },
      "$5cVGSCSXKA"
      /* nuxt-injected */
    )), await __temp, __restore();
    const email = ref("");
    const password = ref("");
    const error = ref("");
    const loading = ref(false);
    const handleLogin = async () => {
      error.value = "";
      loading.value = true;
      try {
        await login(email.value, password.value);
        router.push("/admin/dashboard");
      } catch (e) {
        if (e?.statusCode === 401) {
          error.value = "Invalid email or password.";
        } else {
          error.value = "An error occurred during login. Please try again.";
        }
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UForm = _sfc_main$1;
      const _component_UFormField = _sfc_main$2;
      const _component_UInput = _sfc_main$3;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8" }, _attrs))}><div class="max-w-md w-full space-y-8"><div><h2 class="mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-100"> Sign in to your account </h2></div>`);
      _push(ssrRenderComponent(_component_UForm, {
        state: { email: unref(email), password: unref(password) },
        onSubmit: handleLogin,
        class: "mt-8 space-y-6"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Email address",
              name: "email"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(email),
                    "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
                    type: "email",
                    autocomplete: "email",
                    required: "",
                    placeholder: "Email address",
                    onInput: ($event) => error.value = ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(email),
                      "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
                      type: "email",
                      autocomplete: "email",
                      required: "",
                      placeholder: "Email address",
                      onInput: ($event) => error.value = ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "onInput"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Password",
              name: "password"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(password),
                    "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                    type: "password",
                    autocomplete: "current-password",
                    required: "",
                    placeholder: "Password",
                    onInput: ($event) => error.value = ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(password),
                      "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                      type: "password",
                      autocomplete: "current-password",
                      required: "",
                      placeholder: "Password",
                      onInput: ($event) => error.value = ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "onInput"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              type: "submit",
              color: "primary",
              block: "",
              loading: unref(loading),
              disabled: unref(loading)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Sign in `);
                } else {
                  return [
                    createTextVNode(" Sign in ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode(_component_UFormField, {
                label: "Email address",
                name: "email"
              }, {
                default: withCtx(() => [
                  createVNode(_component_UInput, {
                    modelValue: unref(email),
                    "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
                    type: "email",
                    autocomplete: "email",
                    required: "",
                    placeholder: "Email address",
                    onInput: ($event) => error.value = ""
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "onInput"])
                ]),
                _: 1
              }),
              createVNode(_component_UFormField, {
                label: "Password",
                name: "password"
              }, {
                default: withCtx(() => [
                  createVNode(_component_UInput, {
                    modelValue: unref(password),
                    "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                    type: "password",
                    autocomplete: "current-password",
                    required: "",
                    placeholder: "Password",
                    onInput: ($event) => error.value = ""
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "onInput"])
                ]),
                _: 1
              }),
              createVNode("div", null, [
                createVNode(_component_UButton, {
                  type: "submit",
                  color: "primary",
                  block: "",
                  loading: unref(loading),
                  disabled: unref(loading)
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Sign in ")
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(error)) {
        _push(`<p class="mt-2 text-center text-sm text-red-600">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-DtEbSQoy.mjs.map
