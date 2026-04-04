import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$5 } from './Tabs-rL7xWWdN.mjs';
import { e as _sfc_main$8$1, f as _sfc_main$e, m as useToast } from './server.mjs';
import { _ as _sfc_main$9 } from './Badge-BJMjvXJU.mjs';
import { _ as _sfc_main$6 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$7 } from './Input-Fd8Vd_4J.mjs';
import { defineComponent, withAsyncContext, unref, withCtx, createVNode, ref, watch, mergeProps, openBlock, createBlock, createCommentVNode, isRef, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useSettingsStore } from './useSettingsStore-CJPFEN69.mjs';
import { _ as _sfc_main$8 } from './Textarea-f7RIzcnS.mjs';
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
import './errorMessage-C32Dqgoz.mjs';

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SettingsCategories",
  __ssrInlineRender: true,
  setup(__props) {
    const settingsStore = useSettingsStore();
    const toast = useToast();
    const localCategories = ref([]);
    const editingIndex = ref(null);
    const categoryForm = ref({
      key: "",
      label: "",
      category: "",
      icon: "i-lucide-box",
      description: ""
    });
    function resetCategories() {
      localCategories.value = settingsStore.itemCategories.map((c) => ({ ...c }));
      editingIndex.value = null;
      resetCategoryForm();
    }
    resetCategories();
    watch(() => settingsStore.itemCategories, resetCategories);
    function resetCategoryForm() {
      categoryForm.value = { key: "", label: "", category: "", icon: "i-lucide-box", description: "" };
    }
    function autoGenerateKey() {
      if (!editingIndex.value && editingIndex.value !== 0) {
        categoryForm.value.key = categoryForm.value.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
    }
    function startEditing(index) {
      editingIndex.value = index;
      categoryForm.value = { ...localCategories.value[index] };
    }
    function cancelEditing() {
      editingIndex.value = null;
      resetCategoryForm();
    }
    function addOrUpdateCategory() {
      const form = categoryForm.value;
      if (!form.key.trim() || !form.label.trim() || !form.category.trim()) {
        toast.add({ title: "Key, label, and category are required", color: "warning", icon: "i-lucide-alert-triangle" });
        return;
      }
      const duplicate = localCategories.value.findIndex((c) => c.key === form.key.trim());
      if (duplicate !== -1 && duplicate !== editingIndex.value) {
        toast.add({ title: "A category with this key already exists", color: "warning", icon: "i-lucide-alert-triangle" });
        return;
      }
      const entry = {
        key: form.key.trim(),
        label: form.label.trim(),
        category: form.category.trim(),
        icon: form.icon.trim() || "i-lucide-box",
        description: form.description.trim()
      };
      if (editingIndex.value !== null) {
        localCategories.value[editingIndex.value] = entry;
        editingIndex.value = null;
      } else {
        localCategories.value.push(entry);
      }
      resetCategoryForm();
    }
    function removeCategory(index) {
      localCategories.value.splice(index, 1);
      if (editingIndex.value === index) {
        editingIndex.value = null;
        resetCategoryForm();
      } else if (editingIndex.value !== null && editingIndex.value > index) {
        editingIndex.value--;
      }
    }
    async function saveCategories() {
      if (localCategories.value.length === 0) {
        toast.add({ title: "At least one category is required", color: "warning", icon: "i-lucide-alert-triangle" });
        return;
      }
      await settingsStore.updateSettings({ itemCategories: localCategories.value });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_UBadge = _sfc_main$9;
      const _component_UButton = _sfc_main$8$1;
      const _component_UFormField = _sfc_main$6;
      const _component_UInput = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-6 mt-4" }, _attrs))}><div class="mb-4"><h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Item Categories</h3><p class="text-sm text-parchment/60 mt-1"> Manage the inventory categories. Each category has a name, label, icon, and description used across the inventory pages. </p></div><div class="space-y-2 mb-6"><!--[-->`);
      ssrRenderList(unref(localCategories), (cat, i) => {
        _push(`<div class="${ssrRenderClass([
          "flex items-center gap-3 rounded-lg px-4 py-3 border transition-colors",
          unref(editingIndex) === i ? "bg-primary/10 border-primary/40" : "bg-espresso/50 border-brown/20"
        ])}">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: cat.icon || "i-lucide-box",
          class: "text-lg text-parchment/70 shrink-0"
        }, null, _parent));
        _push(`<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-sm font-medium text-parchment">${ssrInterpolate(cat.label)}</span>`);
        _push(ssrRenderComponent(_component_UBadge, {
          label: cat.category,
          variant: "subtle",
          color: "neutral",
          size: "xs"
        }, null, _parent));
        _push(`</div>`);
        if (cat.description) {
          _push(`<p class="text-xs text-parchment/50 mt-0.5 truncate">${ssrInterpolate(cat.description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex items-center gap-1 shrink-0">`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-pencil",
          color: "neutral",
          variant: "ghost",
          size: "xs",
          onClick: ($event) => startEditing(i)
        }, null, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-x",
          color: "error",
          variant: "ghost",
          size: "xs",
          disabled: unref(localCategories).length <= 1,
          onClick: ($event) => removeCategory(i)
        }, null, _parent));
        _push(`</div></div>`);
      });
      _push(`<!--]--></div>`);
      if (unref(localCategories).length === 0) {
        _push(`<div class="text-center py-6 mb-4">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-tags",
          class: "text-3xl text-parchment/50 mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">No categories defined</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="bg-espresso/30 rounded-lg border border-brown/20 p-4"><h4 class="text-sm font-medium text-parchment/80 mb-3">${ssrInterpolate(unref(editingIndex) !== null ? "Edit Category" : "Add New Category")}</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-3">`);
      _push(ssrRenderComponent(_component_UFormField, {
        label: "Category",
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(categoryForm).category,
              "onUpdate:modelValue": ($event) => unref(categoryForm).category = $event,
              placeholder: "e.g. Bottling",
              class: "w-full",
              onInput: autoGenerateKey
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(categoryForm).category,
                "onUpdate:modelValue": ($event) => unref(categoryForm).category = $event,
                placeholder: "e.g. Bottling",
                class: "w-full",
                onInput: autoGenerateKey
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, {
        label: "Label",
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(categoryForm).label,
              "onUpdate:modelValue": ($event) => unref(categoryForm).label = $event,
              placeholder: "e.g. Bottling Supplies",
              class: "w-full"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(categoryForm).label,
                "onUpdate:modelValue": ($event) => unref(categoryForm).label = $event,
                placeholder: "e.g. Bottling Supplies",
                class: "w-full"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, {
        label: "Key (URL slug)",
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(categoryForm).key,
              "onUpdate:modelValue": ($event) => unref(categoryForm).key = $event,
              placeholder: "e.g. bottling",
              class: "w-full"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(categoryForm).key,
                "onUpdate:modelValue": ($event) => unref(categoryForm).key = $event,
                placeholder: "e.g. bottling",
                class: "w-full"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "Icon" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(categoryForm).icon,
              "onUpdate:modelValue": ($event) => unref(categoryForm).icon = $event,
              placeholder: "i-lucide-box",
              class: "w-full"
            }, {
              leading: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UIcon, {
                    name: unref(categoryForm).icon || "i-lucide-box",
                    class: "text-parchment/50"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UIcon, {
                      name: unref(categoryForm).icon || "i-lucide-box",
                      class: "text-parchment/50"
                    }, null, 8, ["name"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(categoryForm).icon,
                "onUpdate:modelValue": ($event) => unref(categoryForm).icon = $event,
                placeholder: "i-lucide-box",
                class: "w-full"
              }, {
                leading: withCtx(() => [
                  createVNode(_component_UIcon, {
                    name: unref(categoryForm).icon || "i-lucide-box",
                    class: "text-parchment/50"
                  }, null, 8, ["name"])
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, {
        label: "Description",
        class: "md:col-span-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(categoryForm).description,
              "onUpdate:modelValue": ($event) => unref(categoryForm).description = $event,
              placeholder: "Brief description of this category...",
              class: "w-full"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(categoryForm).description,
                "onUpdate:modelValue": ($event) => unref(categoryForm).description = $event,
                placeholder: "Brief description of this category...",
                class: "w-full"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex justify-end gap-2 mt-3">`);
      if (unref(editingIndex) !== null) {
        _push(ssrRenderComponent(_component_UButton, {
          label: "Cancel",
          variant: "ghost",
          color: "neutral",
          size: "sm",
          onClick: cancelEditing
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UButton, {
        icon: unref(editingIndex) !== null ? "i-lucide-check" : "i-lucide-plus",
        label: unref(editingIndex) !== null ? "Update" : "Add Category",
        color: "primary",
        size: "sm",
        disabled: !unref(categoryForm).key.trim() || !unref(categoryForm).label.trim() || !unref(categoryForm).category.trim(),
        onClick: addOrUpdateCategory
      }, null, _parent));
      _push(`</div></div><div class="flex justify-end mt-6 pt-4 border-t border-brown/20"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        label: "Reset",
        variant: "ghost",
        color: "neutral",
        onClick: resetCategories
      }, null, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        label: "Save Categories",
        icon: "i-lucide-save",
        color: "primary",
        loading: unref(settingsStore).saving,
        onClick: saveCategories
      }, null, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Settings/SettingsCategories.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$4, { __name: "SettingsCategories" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SettingsBarrelDefaults",
  __ssrInlineRender: true,
  setup(__props) {
    const settingsStore = useSettingsStore();
    const toast = useToast();
    const localBarrels = ref([]);
    const newBarrelSize = ref("");
    const newBarrelMonths = ref(12);
    function resetBarrels() {
      localBarrels.value = Object.entries(settingsStore.barrelAgeDefaults).map(
        ([size, months]) => ({ size, months })
      );
    }
    resetBarrels();
    watch(() => settingsStore.barrelAgeDefaults, resetBarrels);
    function addBarrelEntry() {
      const trimmed = newBarrelSize.value.trim();
      if (!trimmed) return;
      if (localBarrels.value.some((b) => b.size === trimmed)) {
        toast.add({ title: "Size already exists", color: "warning", icon: "i-lucide-alert-triangle" });
        return;
      }
      localBarrels.value.push({ size: trimmed, months: newBarrelMonths.value });
      newBarrelSize.value = "";
      newBarrelMonths.value = 12;
    }
    function removeBarrelEntry(index) {
      localBarrels.value.splice(index, 1);
    }
    async function saveBarrels() {
      const map = {};
      for (const entry of localBarrels.value) {
        map[entry.size] = entry.months;
      }
      await settingsStore.updateSettings({ barrelAgeDefaults: map });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UInput = _sfc_main$7;
      const _component_UButton = _sfc_main$8$1;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-6 mt-4" }, _attrs))}><div class="mb-4"><h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Barrel Age Defaults</h3><p class="text-sm text-parchment/60 mt-1"> Default aging targets (in months) by barrel size. These are used as suggested aging goals when a barrel is filled. </p></div><div class="space-y-2 mb-4"><!--[-->`);
      ssrRenderList(unref(localBarrels), (entry, i) => {
        _push(`<div class="flex items-center gap-3 bg-espresso/50 rounded-lg px-4 py-2.5 border border-brown/20"><span class="text-sm text-parchment flex-1">${ssrInterpolate(entry.size)}</span><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: entry.months,
          "onUpdate:modelValue": ($event) => entry.months = $event,
          modelModifiers: { number: true },
          type: "number",
          min: 1,
          class: "w-20"
        }, null, _parent));
        _push(`<span class="text-xs text-parchment/50">months</span></div>`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-x",
          color: "error",
          variant: "ghost",
          size: "xs",
          onClick: ($event) => removeBarrelEntry(i)
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
      if (unref(localBarrels).length === 0) {
        _push(`<div class="text-center py-6">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-cylinder",
          class: "text-3xl text-parchment/50 mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">No barrel defaults defined</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center gap-2 mt-4">`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(newBarrelSize),
        "onUpdate:modelValue": ($event) => isRef(newBarrelSize) ? newBarrelSize.value = $event : null,
        placeholder: "Barrel size (e.g., 5 Gallon)",
        class: "flex-1",
        onKeydown: addBarrelEntry
      }, null, _parent));
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(newBarrelMonths),
        "onUpdate:modelValue": ($event) => isRef(newBarrelMonths) ? newBarrelMonths.value = $event : null,
        modelModifiers: { number: true },
        type: "number",
        min: 1,
        placeholder: "Months",
        class: "w-24"
      }, null, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        icon: "i-lucide-plus",
        label: "Add",
        color: "primary",
        disabled: !unref(newBarrelSize).trim(),
        onClick: addBarrelEntry
      }, null, _parent));
      _push(`</div><div class="flex justify-end mt-6 pt-4 border-t border-brown/20"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        label: "Reset",
        variant: "ghost",
        color: "neutral",
        onClick: resetBarrels
      }, null, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        label: "Save Barrel Defaults",
        icon: "i-lucide-save",
        color: "primary",
        loading: unref(settingsStore).saving,
        onClick: saveBarrels
      }, null, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Settings/SettingsBarrelDefaults.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$3, { __name: "SettingsBarrelDefaults" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SettingsTheme",
  __ssrInlineRender: true,
  setup(__props) {
    const settingsStore = useSettingsStore();
    const NUXT_UI_COLORS = [
      "red",
      "orange",
      "amber",
      "yellow",
      "lime",
      "green",
      "emerald",
      "teal",
      "cyan",
      "sky",
      "blue",
      "indigo",
      "violet",
      "purple",
      "fuchsia",
      "pink",
      "rose"
    ];
    const localPrimaryColor = ref("");
    function resetTheme() {
      localPrimaryColor.value = settingsStore.theme.primaryColor || "amber";
    }
    resetTheme();
    watch(() => settingsStore.theme, resetTheme);
    async function saveTheme() {
      await settingsStore.updateSettings({ theme: { primaryColor: localPrimaryColor.value } });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8$1;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-6 mt-4" }, _attrs))}><div class="mb-4"><h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Theme</h3><p class="text-sm text-parchment/60 mt-1"> Customize the application&#39;s accent color. This changes the primary color used across the admin interface. </p></div><div class="mb-2"><label class="text-sm font-medium text-parchment/70 mb-3 block">Primary Color</label><div class="flex flex-wrap gap-2"><!--[-->`);
      ssrRenderList(NUXT_UI_COLORS, (color) => {
        _push(ssrRenderComponent(_component_UButton, {
          key: color,
          variant: "ghost",
          class: [
            "w-10 h-10 rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center justify-center !p-0",
            unref(localPrimaryColor) === color ? "border-parchment scale-110 ring-2 ring-parchment/30" : "border-transparent hover:scale-105"
          ],
          style: { backgroundColor: `var(--color-${color}-500, ${color})` },
          title: color,
          onClick: ($event) => localPrimaryColor.value = color
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(localPrimaryColor) === color) {
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-check",
                  class: "text-white text-lg drop-shadow-md"
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(localPrimaryColor) === color ? (openBlock(), createBlock(_component_UIcon, {
                  key: 0,
                  name: "i-lucide-check",
                  class: "text-white text-lg drop-shadow-md"
                })) : createCommentVNode("", true)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><p class="text-xs text-parchment/50 mt-2"> Selected: <span class="font-semibold text-parchment/70 capitalize">${ssrInterpolate(unref(localPrimaryColor))}</span></p></div><div class="flex justify-end mt-6 pt-4 border-t border-brown/20"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        label: "Reset",
        variant: "ghost",
        color: "neutral",
        onClick: resetTheme
      }, null, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        label: "Save Theme",
        icon: "i-lucide-save",
        color: "primary",
        loading: unref(settingsStore).saving,
        onClick: saveTheme
      }, null, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Settings/SettingsTheme.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$2, { __name: "SettingsTheme" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SettingsDistillery",
  __ssrInlineRender: true,
  setup(__props) {
    const settingsStore = useSettingsStore();
    const localDistillery = ref({
      name: "",
      address: "",
      permitNumbers: { ttb: "", tabc: "" }
    });
    function resetDistillery() {
      localDistillery.value = structuredClone(toRaw(settingsStore.distillery));
    }
    resetDistillery();
    watch(() => settingsStore.distillery, resetDistillery);
    async function saveDistillery() {
      await settingsStore.updateSettings({ distillery: localDistillery.value });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UFormField = _sfc_main$6;
      const _component_UInput = _sfc_main$7;
      const _component_UTextarea = _sfc_main$8;
      const _component_UButton = _sfc_main$8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-6 mt-4" }, _attrs))}><div class="mb-4"><h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Distillery Information</h3><p class="text-sm text-parchment/60 mt-1"> Business details used in reports and compliance documents. </p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4">`);
      _push(ssrRenderComponent(_component_UFormField, {
        label: "Distillery Name",
        class: "md:col-span-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(localDistillery).name,
              "onUpdate:modelValue": ($event) => unref(localDistillery).name = $event,
              placeholder: "Galveston Distilling Co",
              class: "w-full"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(localDistillery).name,
                "onUpdate:modelValue": ($event) => unref(localDistillery).name = $event,
                placeholder: "Galveston Distilling Co",
                class: "w-full"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, {
        label: "Address",
        class: "md:col-span-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UTextarea, {
              modelValue: unref(localDistillery).address,
              "onUpdate:modelValue": ($event) => unref(localDistillery).address = $event,
              placeholder: "123 Main St, Galveston, TX 77550",
              rows: 2,
              class: "w-full"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UTextarea, {
                modelValue: unref(localDistillery).address,
                "onUpdate:modelValue": ($event) => unref(localDistillery).address = $event,
                placeholder: "123 Main St, Galveston, TX 77550",
                rows: 2,
                class: "w-full"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "TTB Permit Number" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(localDistillery).permitNumbers.ttb,
              "onUpdate:modelValue": ($event) => unref(localDistillery).permitNumbers.ttb = $event,
              placeholder: "DSP-TX-XXXXX",
              class: "w-full"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(localDistillery).permitNumbers.ttb,
                "onUpdate:modelValue": ($event) => unref(localDistillery).permitNumbers.ttb = $event,
                placeholder: "DSP-TX-XXXXX",
                class: "w-full"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "TABC Permit Number" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(localDistillery).permitNumbers.tabc,
              "onUpdate:modelValue": ($event) => unref(localDistillery).permitNumbers.tabc = $event,
              placeholder: "MB-XXXXXX",
              class: "w-full"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(localDistillery).permitNumbers.tabc,
                "onUpdate:modelValue": ($event) => unref(localDistillery).permitNumbers.tabc = $event,
                placeholder: "MB-XXXXXX",
                class: "w-full"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex justify-end mt-6 pt-4 border-t border-brown/20"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        label: "Reset",
        variant: "ghost",
        color: "neutral",
        onClick: resetDistillery
      }, null, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        label: "Save Distillery Info",
        icon: "i-lucide-save",
        color: "primary",
        loading: unref(settingsStore).saving,
        onClick: saveDistillery
      }, null, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Settings/SettingsDistillery.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$1, { __name: "SettingsDistillery" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const settingsStore = useSettingsStore();
    [__temp, __restore] = withAsyncContext(() => settingsStore.ensureLoaded()), await __temp, __restore();
    const tabs = [
      { label: "Categories", icon: "i-lucide-tags", value: "categories", slot: "categories" },
      { label: "Barrel Defaults", icon: "i-lucide-cylinder", value: "barrels", slot: "barrels" },
      { label: "Theme", icon: "i-lucide-palette", value: "theme", slot: "theme" },
      { label: "Distillery Info", icon: "i-lucide-building-2", value: "distillery", slot: "distillery" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UTabs = _sfc_main$5;
      const _component_SettingsCategories = __nuxt_component_2;
      const _component_SettingsBarrelDefaults = __nuxt_component_3;
      const _component_SettingsTheme = __nuxt_component_4;
      const _component_SettingsDistillery = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Settings",
        subtitle: "Application-wide configuration",
        icon: "i-lucide-settings"
      }, null, _parent));
      if (unref(settingsStore).loading) {
        _push(`<div class="space-y-4"><div class="h-10 bg-charcoal rounded-lg animate-pulse"></div><div class="h-64 bg-charcoal rounded-xl animate-pulse"></div></div>`);
      } else {
        _push(ssrRenderComponent(_component_UTabs, {
          items: tabs,
          class: "w-full"
        }, {
          categories: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_SettingsCategories, null, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_SettingsCategories)
              ];
            }
          }),
          barrels: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_SettingsBarrelDefaults, null, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_SettingsBarrelDefaults)
              ];
            }
          }),
          theme: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_SettingsTheme, null, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_SettingsTheme)
              ];
            }
          }),
          distillery: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_SettingsDistillery, null, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_SettingsDistillery)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-Bc0c0V9K.mjs.map
