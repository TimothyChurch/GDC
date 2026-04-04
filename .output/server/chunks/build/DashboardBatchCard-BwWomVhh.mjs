import { c as __nuxt_component_1$1, f as _sfc_main$e } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createVNode, toDisplayString, createTextVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { c as STAGE_DISPLAY, s as stageBgColor, e as stageTextColor } from './batchPipeline-br9pdPdU.mjs';
import { g as getBatchBorderClass } from './useRecipeColors-C1dzeggx.mjs';
import { a as useBatchStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DashboardBatchCard",
  __ssrInlineRender: true,
  props: {
    batchId: {}
  },
  setup(__props) {
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const props = __props;
    const batch = computed(() => batchStore.getBatchById(props.batchId));
    const stageDisplay = computed(() => {
      if (!batch.value) return { icon: "i-lucide-circle", color: "neutral" };
      return STAGE_DISPLAY[batch.value.currentStage] || { icon: "i-lucide-circle", color: "neutral" };
    });
    computed(() => {
      switch (batch.value?.status) {
        case "active":
          return "bg-blue-500/15 text-blue-400 border-blue-500/25";
        case "completed":
          return "bg-green-500/15 text-green-400 border-green-500/25";
        case "cancelled":
          return "bg-red-500/15 text-red-400 border-red-500/25";
        default:
          return "bg-brown/15 text-parchment/50 border-brown/25";
      }
    });
    const batchBorder = computed(
      () => batch.value ? getBatchBorderClass(batch.value._id) : ""
    );
    const startDate = computed(() => {
      if (!batch.value?.createdAt) return null;
      return new Date(batch.value.createdAt).toLocaleDateString();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      if (unref(batch)) {
        _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
          to: `/admin/batch/${unref(batch)._id}`,
          class: ["block w-full rounded-r-lg rounded-l border border-brown/25 bg-brown/15 p-3 hover:border-gold/40 hover:bg-brown/25 transition-all duration-200 cursor-pointer group border-l-4", unref(batchBorder)]
        }, _attrs), {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-sm font-medium text-parchment mb-2 group-hover:text-gold transition-colors duration-200"${_scopeId}>${ssrInterpolate(unref(recipeStore).getRecipeById(unref(batch)?.recipe)?.name || "Unknown Recipe")}</div><div class="flex flex-col gap-1.5 text-xs"${_scopeId}><div class="flex justify-between items-center"${_scopeId}><span class="text-parchment/60"${_scopeId}>Stage</span><span class="${ssrRenderClass([unref(stageBgColor)(unref(stageDisplay).color), "px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1"])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: unref(stageDisplay).icon,
                class: [unref(stageTextColor)(unref(stageDisplay).color), "text-xs"]
              }, null, _parent2, _scopeId));
              _push2(` ${ssrInterpolate(unref(batch).currentStage)}</span></div><div class="flex justify-between"${_scopeId}><span class="text-parchment/60"${_scopeId}>Size</span><span class="text-parchment/70"${_scopeId}>${ssrInterpolate(unref(batch).batchSize)} ${ssrInterpolate(unref(batch).batchSizeUnit)}</span></div>`);
              if (unref(batch).batchCost) {
                _push2(`<div class="flex justify-between"${_scopeId}><span class="text-parchment/60"${_scopeId}>Cost</span><span class="text-parchment/70"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(batch).batchCost))}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(startDate)) {
                _push2(`<div class="flex justify-between"${_scopeId}><span class="text-parchment/60"${_scopeId}>Created</span><span class="text-parchment/70"${_scopeId}>${ssrInterpolate(unref(startDate))}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "text-sm font-medium text-parchment mb-2 group-hover:text-gold transition-colors duration-200" }, toDisplayString(unref(recipeStore).getRecipeById(unref(batch)?.recipe)?.name || "Unknown Recipe"), 1),
                createVNode("div", { class: "flex flex-col gap-1.5 text-xs" }, [
                  createVNode("div", { class: "flex justify-between items-center" }, [
                    createVNode("span", { class: "text-parchment/60" }, "Stage"),
                    createVNode("span", {
                      class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1", unref(stageBgColor)(unref(stageDisplay).color)]
                    }, [
                      createVNode(_component_UIcon, {
                        name: unref(stageDisplay).icon,
                        class: [unref(stageTextColor)(unref(stageDisplay).color), "text-xs"]
                      }, null, 8, ["name", "class"]),
                      createTextVNode(" " + toDisplayString(unref(batch).currentStage), 1)
                    ], 2)
                  ]),
                  createVNode("div", { class: "flex justify-between" }, [
                    createVNode("span", { class: "text-parchment/60" }, "Size"),
                    createVNode("span", { class: "text-parchment/70" }, toDisplayString(unref(batch).batchSize) + " " + toDisplayString(unref(batch).batchSizeUnit), 1)
                  ]),
                  unref(batch).batchCost ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex justify-between"
                  }, [
                    createVNode("span", { class: "text-parchment/60" }, "Cost"),
                    createVNode("span", { class: "text-parchment/70" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(batch).batchCost)), 1)
                  ])) : createCommentVNode("", true),
                  unref(startDate) ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "flex justify-between"
                  }, [
                    createVNode("span", { class: "text-parchment/60" }, "Created"),
                    createVNode("span", { class: "text-parchment/70" }, toDisplayString(unref(startDate)), 1)
                  ])) : createCommentVNode("", true)
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard/DashboardBatchCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_7 = Object.assign(_sfc_main, { __name: "DashboardBatchCard" });

export { __nuxt_component_7 as _ };
//# sourceMappingURL=DashboardBatchCard-BwWomVhh.mjs.map
