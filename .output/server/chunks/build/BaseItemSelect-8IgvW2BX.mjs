import { _ as _sfc_main$1 } from './SelectMenu-DljUyjmT.mjs';
import { defineComponent, ref, computed, mergeProps, unref, isRef, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { m as useToast } from './server.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BaseItemSelect",
  __ssrInlineRender: true,
  props: {
    modelValue: { default: null },
    filterByType: {},
    filterByCategory: {},
    filterFn: {},
    placeholder: { default: "Select item..." },
    size: { default: "md" },
    disabled: { type: Boolean, default: false },
    allowCreate: { type: Boolean, default: true },
    createCategory: { default: "Other" },
    createType: { default: "" }
  },
  emits: ["update:modelValue", "created"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const itemStore = useItemStore();
    const toast = useToast();
    const creating = ref(false);
    const filteredItems = computed(() => {
      let result = itemStore.items;
      if (props.filterByType) {
        const types = Array.isArray(props.filterByType) ? props.filterByType.map((t) => t.toLowerCase()) : [props.filterByType.toLowerCase()];
        result = result.filter((i) => types.includes(i.type?.toLowerCase() || ""));
      }
      if (props.filterByCategory) {
        const categories = Array.isArray(props.filterByCategory) ? props.filterByCategory : [props.filterByCategory];
        result = result.filter((i) => categories.includes(i.category || "Other"));
      }
      if (props.filterFn) {
        result = result.filter(props.filterFn);
      }
      return result;
    });
    const selectItems = computed(
      () => filteredItems.value.map((i) => ({ label: i.name, value: i._id }))
    );
    const selected = computed({
      get: () => props.modelValue || void 0,
      set: (val) => emit("update:modelValue", val || null)
    });
    const handleCreate = async (name) => {
      if (creating.value) return;
      creating.value = true;
      try {
        const body = {
          name,
          category: props.createCategory
        };
        if (props.createType) {
          body.type = props.createType;
        }
        const newItem = await $fetch("/api/item/create", {
          method: "POST",
          body
        });
        itemStore.items.push(newItem);
        emit("update:modelValue", newItem._id);
        emit("created", newItem);
        toast.add({
          title: `Created "${newItem.name}"`,
          color: "success",
          icon: "i-lucide-check-circle"
        });
      } catch (error) {
        toast.add({
          title: "Failed to create item",
          description: getErrorMessage(error),
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        creating.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USelectMenu = _sfc_main$1;
      _push(ssrRenderComponent(_component_USelectMenu, mergeProps({
        modelValue: unref(selected),
        "onUpdate:modelValue": ($event) => isRef(selected) ? selected.value = $event : null,
        items: unref(selectItems),
        "value-key": "value",
        placeholder: __props.placeholder,
        size: __props.size,
        disabled: __props.disabled || unref(creating),
        loading: unref(creating),
        searchable: "",
        "create-item": __props.allowCreate ? { position: "bottom" } : false,
        onCreate: handleCreate
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Base/BaseItemSelect.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_8 = Object.assign(_sfc_main, { __name: "BaseItemSelect" });

export { __nuxt_component_8 as _ };
//# sourceMappingURL=BaseItemSelect-8IgvW2BX.mjs.map
