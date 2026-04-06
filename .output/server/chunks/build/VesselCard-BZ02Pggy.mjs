import { c as __nuxt_component_1$1, f as _sfc_main$e } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, mergeProps, withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, createTextVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
import { a as useBatchStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VesselCard",
  __ssrInlineRender: true,
  props: {
    vessel: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const displayUnit = computed(() => props.vessel.stats?.volumeUnit || props.vessel.current?.volumeUnit || "gal");
    const currentVolumeConverted = computed(() => {
      const current = props.vessel.current?.volume;
      if (!current) return 0;
      const fromUnit = props.vessel.current?.volumeUnit || displayUnit.value;
      return current * convertUnitRatio(fromUnit, displayUnit.value);
    });
    const fillPercent = computed(() => {
      const max = props.vessel.stats?.volume;
      if (!max || !currentVolumeConverted.value) return 0;
      return Math.min(100, currentVolumeConverted.value / max * 100);
    });
    const contentsNames = computed(() => {
      if (!props.vessel.contents?.length) return [];
      return props.vessel.contents.map((c) => {
        const batch = batchStore.getBatchById(c.batch);
        if (!batch?.recipe) return "Unknown";
        return recipeStore.getRecipeById(batch.recipe)?.name || "Unknown";
      }).filter((name, i, arr) => arr.indexOf(name) === i);
    });
    const typeIcon = computed(() => {
      switch (props.vessel.type) {
        case "Mash Tun":
          return "i-lucide-flame";
        case "Fermenter":
          return "i-lucide-beaker";
        case "Still":
          return "i-lucide-flask-conical";
        case "Tank":
          return "i-lucide-cylinder";
        case "Barrel":
          return "i-lucide-cylinder";
        default:
          return "i-lucide-container";
      }
    });
    const displayAbv = computed(() => {
      if (props.vessel.current?.abv) return props.vessel.current.abv;
      const contents = props.vessel.contents;
      if (!contents?.length) return null;
      const withAbv = contents.filter((c) => c.abv && c.volume);
      if (withAbv.length === 0) return null;
      if (withAbv.length === 1) return withAbv[0].abv;
      const totalVol = withAbv.reduce((sum, c) => sum + c.volume, 0);
      if (totalVol <= 0) return null;
      const weighted = withAbv.reduce((sum, c) => sum + c.volume * c.abv, 0);
      return +(weighted / totalVol).toFixed(1);
    });
    const fillColor = computed(() => {
      if (fillPercent.value === 0) return "bg-brown/20";
      if (fillPercent.value < 30) return "bg-blue-500/60";
      if (fillPercent.value < 70) return "bg-copper/60";
      return "bg-gold/60";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: `/admin/vessels/${__props.vessel._id}`,
        class: "block bg-charcoal rounded-xl border border-brown/30 p-4 hover:border-brown/50 transition-colors cursor-pointer"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-start justify-between mb-3"${_scopeId}><div class="flex items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: unref(typeIcon),
              class: "text-lg text-copper"
            }, null, _parent2, _scopeId));
            _push2(`<div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(__props.vessel.name)}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(__props.vessel.type)}</div></div></div>`);
            if (unref(displayAbv)) {
              _push2(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-500/15 text-blue-400 border-blue-500/25"${_scopeId}>${ssrInterpolate(unref(displayAbv))}% ABV </span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="mb-3"${_scopeId}><div class="flex justify-between text-xs mb-1"${_scopeId}><span class="text-parchment/60"${_scopeId}>Fill Level</span><span class="text-parchment/60"${_scopeId}>${ssrInterpolate(+unref(currentVolumeConverted).toFixed(2))} ${ssrInterpolate(unref(displayUnit))} `);
            if (__props.vessel.stats?.volume) {
              _push2(`<span class="text-parchment/50"${_scopeId}>/ ${ssrInterpolate(__props.vessel.stats.volume)} ${ssrInterpolate(unref(displayUnit))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</span></div><div class="w-full h-2 rounded-full bg-brown/20 overflow-hidden"${_scopeId}><div class="${ssrRenderClass([unref(fillColor), "h-full rounded-full transition-all duration-300"])}" style="${ssrRenderStyle({ width: `${unref(fillPercent)}%` })}"${_scopeId}></div></div></div>`);
            if (unref(contentsNames).length > 0) {
              _push2(`<div class="mb-2"${_scopeId}><div class="text-xs text-parchment/60 mb-1"${_scopeId}>Contents</div><div class="flex flex-wrap gap-1"${_scopeId}><!--[-->`);
              ssrRenderList(unref(contentsNames), (name) => {
                _push2(`<span class="px-1.5 py-0.5 rounded text-[10px] bg-brown/20 text-parchment/60"${_scopeId}>${ssrInterpolate(name)}</span>`);
              });
              _push2(`<!--]--></div></div>`);
            } else {
              _push2(`<div class="text-xs text-parchment/20 mb-2"${_scopeId}>Empty</div>`);
            }
            if (__props.vessel.current?.value) {
              _push2(`<div class="text-right"${_scopeId}><span class="text-xs text-parchment/60"${_scopeId}>Value: </span><span class="text-xs text-parchment font-medium"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.vessel.current.value))}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "flex items-start justify-between mb-3" }, [
                createVNode("div", { class: "flex items-center gap-2" }, [
                  createVNode(_component_UIcon, {
                    name: unref(typeIcon),
                    class: "text-lg text-copper"
                  }, null, 8, ["name"]),
                  createVNode("div", null, [
                    createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(__props.vessel.name), 1),
                    createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(__props.vessel.type), 1)
                  ])
                ]),
                unref(displayAbv) ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-500/15 text-blue-400 border-blue-500/25"
                }, toDisplayString(unref(displayAbv)) + "% ABV ", 1)) : createCommentVNode("", true)
              ]),
              createVNode("div", { class: "mb-3" }, [
                createVNode("div", { class: "flex justify-between text-xs mb-1" }, [
                  createVNode("span", { class: "text-parchment/60" }, "Fill Level"),
                  createVNode("span", { class: "text-parchment/60" }, [
                    createTextVNode(toDisplayString(+unref(currentVolumeConverted).toFixed(2)) + " " + toDisplayString(unref(displayUnit)) + " ", 1),
                    __props.vessel.stats?.volume ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-parchment/50"
                    }, "/ " + toDisplayString(__props.vessel.stats.volume) + " " + toDisplayString(unref(displayUnit)), 1)) : createCommentVNode("", true)
                  ])
                ]),
                createVNode("div", { class: "w-full h-2 rounded-full bg-brown/20 overflow-hidden" }, [
                  createVNode("div", {
                    class: ["h-full rounded-full transition-all duration-300", unref(fillColor)],
                    style: { width: `${unref(fillPercent)}%` }
                  }, null, 6)
                ])
              ]),
              unref(contentsNames).length > 0 ? (openBlock(), createBlock("div", {
                key: 0,
                class: "mb-2"
              }, [
                createVNode("div", { class: "text-xs text-parchment/60 mb-1" }, "Contents"),
                createVNode("div", { class: "flex flex-wrap gap-1" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(contentsNames), (name) => {
                    return openBlock(), createBlock("span", {
                      key: name,
                      class: "px-1.5 py-0.5 rounded text-[10px] bg-brown/20 text-parchment/60"
                    }, toDisplayString(name), 1);
                  }), 128))
                ])
              ])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "text-xs text-parchment/20 mb-2"
              }, "Empty")),
              __props.vessel.current?.value ? (openBlock(), createBlock("div", {
                key: 2,
                class: "text-right"
              }, [
                createVNode("span", { class: "text-xs text-parchment/60" }, "Value: "),
                createVNode("span", { class: "text-xs text-parchment font-medium" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.vessel.current.value)), 1)
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Vessel/VesselCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main, { __name: "VesselCard" });

export { __nuxt_component_2 as _ };
//# sourceMappingURL=VesselCard-BZ02Pggy.mjs.map
