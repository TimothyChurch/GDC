import { d as __nuxt_component_0$2, e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { defineComponent, ref, computed, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';

function useCloudinaryUpload() {
  const uploading = ref(false);
  const error = ref(null);
  const upload = async (file, folder = "general") => {
    uploading.value = true;
    error.value = null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    try {
      const result = await $fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      return result;
    } catch (e) {
      error.value = e?.data?.statusMessage || e?.message || "Upload failed";
      return null;
    } finally {
      uploading.value = false;
    }
  };
  const remove = async (publicId) => {
    error.value = null;
    try {
      await $fetch(`/api/upload/delete`, {
        method: "DELETE",
        params: { fullId: publicId }
      });
      return true;
    } catch (e) {
      error.value = e?.data?.statusMessage || e?.message || "Delete failed";
      return false;
    }
  };
  return { upload, remove, uploading, error };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FormImageUpload",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    folder: { default: "general" },
    label: { default: "Image" }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { remove, uploading, error } = useCloudinaryUpload();
    const dragOver = ref(false);
    const fileInput = ref(null);
    const hasImage = computed(() => !!props.modelValue);
    const onBrowse = () => {
      fileInput.value?.click();
    };
    const removeImage = async () => {
      if (props.modelValue?.includes("cloudinary.com")) {
        const parts = props.modelValue.split("/upload/");
        if (parts[1]) {
          const path = parts[1].replace(/^v\d+\//, "").replace(/\.\w+$/, "");
          await remove(path);
        }
      }
      emit("update:modelValue", void 0);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_0$2;
      const _component_UButton = _sfc_main$8;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (__props.label) {
        _push(`<label class="block text-sm font-medium text-parchment/70 mb-1.5">${ssrInterpolate(__props.label)}</label>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(hasImage) && !unref(uploading)) {
        _push(`<div class="relative group mb-2">`);
        _push(ssrRenderComponent(_component_NuxtImg, {
          src: __props.modelValue,
          alt: __props.label,
          class: "w-full max-w-xs h-40 object-cover rounded-lg border border-brown/30",
          width: "320",
          height: "160"
        }, null, _parent));
        _push(`<div class="absolute inset-0 max-w-xs h-40 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-replace",
          variant: "solid",
          size: "xs",
          onClick: onBrowse
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Replace `);
            } else {
              return [
                createTextVNode(" Replace ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-trash-2",
          color: "error",
          variant: "solid",
          size: "xs",
          onClick: removeImage
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Remove `);
            } else {
              return [
                createTextVNode(" Remove ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(hasImage) || unref(uploading)) {
        _push(`<div class="${ssrRenderClass([[
          unref(dragOver) ? "border-gold bg-gold/10" : "border-brown/30 hover:border-brown/50 bg-brown/5",
          unref(uploading) ? "pointer-events-none opacity-60" : ""
        ], "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"])}"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden">`);
        if (unref(uploading)) {
          _push(`<div class="flex flex-col items-center gap-2">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-loader-2",
            class: "text-2xl text-gold animate-spin"
          }, null, _parent));
          _push(`<span class="text-sm text-parchment/60">Uploading...</span></div>`);
        } else {
          _push(`<div class="flex flex-col items-center gap-2">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-image-plus",
            class: "text-2xl text-parchment/50"
          }, null, _parent));
          _push(`<span class="text-sm text-parchment/60"> Drag &amp; drop or <span class="text-gold">browse</span></span><span class="text-xs text-parchment/50">JPEG, PNG, WebP, GIF (max 5MB)</span></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-1.5 text-xs text-red-400">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Form/FormImageUpload.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_9 = Object.assign(_sfc_main, { __name: "FormImageUpload" });

export { __nuxt_component_9 as _ };
//# sourceMappingURL=FormImageUpload-CmE9buSH.mjs.map
