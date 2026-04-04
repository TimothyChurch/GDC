import { e as _sfc_main$8 } from './server.mjs';
import { defineComponent, ref, computed, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { b as buildBatchLegend } from './useRecipeColors-C1dzeggx.mjs';
import { a as useBatchStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BatchRecipeLegend",
  __ssrInlineRender: true,
  props: {
    batches: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const collapsed = ref(false);
    const source = computed(() => props.batches ?? batchStore.activeBatches);
    const legend = computed(
      () => buildBatchLegend(source.value, (id) => recipeStore.getRecipeById(id)?.name || "Unknown")
    );
    const show = computed(() => legend.value.length >= 2);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8;
      if (unref(show)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-3" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "link",
          size: "xs",
          icon: unref(collapsed) ? "i-lucide-chevron-right" : "i-lucide-chevron-down",
          label: "Batch Colors",
          class: "text-[10px] uppercase tracking-wider text-parchment/60 hover:text-parchment/60",
          onClick: ($event) => collapsed.value = !unref(collapsed)
        }, null, _parent));
        if (!unref(collapsed)) {
          _push(`<div class="flex flex-wrap gap-x-3 gap-y-1 mt-1.5"><!--[-->`);
          ssrRenderList(unref(legend), (entry) => {
            _push(`<div class="flex items-center gap-1.5"><div class="${ssrRenderClass(["w-2.5 h-2.5 rounded-sm shrink-0", entry.color.dot])}"></div><span class="text-[11px] text-parchment/60">${ssrInterpolate(entry.name)}</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchRecipeLegend.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "BatchRecipeLegend" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=BatchRecipeLegend-DPlKPDfc.mjs.map
