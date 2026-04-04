import { _ as _sfc_main$1 } from './Modal-GBrZNdlF.mjs';
import { e as _sfc_main$8, h as useRouter, g as useOverlay, J as useState } from './server.mjs';
import { defineComponent, computed, mergeProps, isRef, unref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useCommandPalette } from './admin-7-JjfVWL.mjs';
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
import './Kbd-C22JBoFL.mjs';
import './Slideover-CyjfVfmV.mjs';
import './Proofing-C6nhpVFe.mjs';
import './FormField-DcXe0kwN.mjs';
import './Input-Fd8Vd_4J.mjs';
import './Select-xxK8NqZT.mjs';
import './conversions-t0mnZFvt.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useMessageStore-BW2XxQau.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './PanelBatch-B7qrC1Ly.mjs';
import './Form-B0crAOcM.mjs';
import './SelectMenu-DljUyjmT.mjs';
import './BaseQuantityInput-Bo8QfULy.mjs';
import './FieldGroup-bwPzB93U.mjs';
import './units-DWysHFem.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';
import './formatting-DpuwJPOk.mjs';
import './useBatchStore-C5x8JeHz.mjs';
import './batchPipeline-br9pdPdU.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useFormPanel-DspW7Iuy.mjs';
import './helpers-pfHQ8kqT.mjs';
import './useProductionStore-SZxhegcf.mjs';
import './useBottleStore-NPRWrMTA.mjs';
import './PanelProduction-Bh5tM8Ym.mjs';
import './SiteDatePicker-pVMyeD61.mjs';
import './Popover-BvOOk09Z.mjs';
import 'reka-ui/namespaced';
import 'v-calendar';
import 'date-fns';
import './BaseItemSelect-8IgvW2BX.mjs';
import './Separator-C6vDFXmY.mjs';
import './Switch-BH6j8VnQ.mjs';
import './useProductionCosts-BgHwywl6.mjs';
import './PanelPurchaseOrder-DD0_jEGc.mjs';
import './useEventStore-LoZhbbHY.mjs';

function useKeyboardShortcuts() {
  useRouter();
  useCommandPalette();
  useOverlay();
  const showHelp = useState("shortcutHelpOpen", () => false);
  const shortcuts = [
    { keys: ["Ctrl+K", "Cmd+K"], label: "Command Palette", group: "General" },
    { keys: ["?"], label: "Show Shortcuts", group: "General" },
    { keys: ["Escape"], label: "Close Dialog", group: "General" },
    { keys: ["g d"], label: "Go to Dashboard", group: "Navigation" },
    { keys: ["g b"], label: "Go to Batches", group: "Navigation" },
    { keys: ["g r"], label: "Go to Recipes", group: "Navigation" },
    { keys: ["g v"], label: "Go to Vessels", group: "Navigation" },
    { keys: ["g p"], label: "Go to Production", group: "Navigation" },
    { keys: ["g o"], label: "Go to Bottles", group: "Navigation" },
    { keys: ["g i"], label: "Go to Items", group: "Navigation" },
    { keys: ["g c"], label: "Go to Contacts", group: "Navigation" },
    { keys: ["g t"], label: "Go to Reports", group: "Navigation" },
    { keys: ["n b"], label: "New Batch", group: "Actions" },
    { keys: ["n p"], label: "New Production", group: "Actions" },
    { keys: ["n o"], label: "New Purchase Order", group: "Actions" }
  ];
  return { shortcuts, showHelp };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminShortcutsHelp",
  __ssrInlineRender: true,
  setup(__props) {
    const { shortcuts, showHelp } = useKeyboardShortcuts();
    const isMac = computed(
      () => false
    );
    const groupedShortcuts = computed(() => {
      const groups = /* @__PURE__ */ new Map();
      shortcuts.forEach((s) => {
        const list = groups.get(s.group) || [];
        list.push(s);
        groups.set(s.group, list);
      });
      return groups;
    });
    function formatKey(key) {
      if (isMac.value) {
        return key.replace("Ctrl", "⌘").replace("Cmd", "⌘");
      }
      return key.replace("Cmd+", "Ctrl+");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        open: unref(showHelp),
        "onUpdate:open": ($event) => isRef(showHelp) ? showHelp.value = $event : null
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-5 max-w-lg"${_scopeId}><div class="flex items-center justify-between mb-5"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>Keyboard Shortcuts</h2>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-x",
              color: "neutral",
              variant: "ghost",
              size: "xs",
              onClick: ($event) => showHelp.value = false
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="space-y-5"${_scopeId}><!--[-->`);
            ssrRenderList(unref(groupedShortcuts), ([group, items]) => {
              _push2(`<div${_scopeId}><h3 class="text-xs font-semibold uppercase tracking-widest text-copper/60 mb-2"${_scopeId}>${ssrInterpolate(group)}</h3><div class="space-y-1.5"${_scopeId}><!--[-->`);
              ssrRenderList(items, (shortcut) => {
                _push2(`<div class="flex items-center justify-between py-1"${_scopeId}><span class="text-sm text-parchment/70"${_scopeId}>${ssrInterpolate(shortcut.label)}</span><div class="flex items-center gap-1"${_scopeId}><!--[-->`);
                ssrRenderList(shortcut.keys, (key, ki) => {
                  _push2(`<!--[-->`);
                  if (ki > 0) {
                    _push2(`<span class="text-xs text-parchment/20 mx-0.5"${_scopeId}>/</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`<span class="inline-flex items-center gap-0.5"${_scopeId}><!--[-->`);
                  ssrRenderList(formatKey(key).split("+"), (part, pi) => {
                    _push2(`<!--[-->`);
                    if (pi > 0) {
                      _push2(`<span class="text-xs text-parchment/20"${_scopeId}>+</span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`<kbd class="px-1.5 py-0.5 rounded bg-brown/30 border border-brown/40 text-xs text-parchment/60 font-mono min-w-[1.5rem] text-center"${_scopeId}>${ssrInterpolate(part.trim())}</kbd><!--]-->`);
                  });
                  _push2(`<!--]--></span><!--]-->`);
                });
                _push2(`<!--]--></div></div>`);
              });
              _push2(`<!--]--></div></div>`);
            });
            _push2(`<!--]--></div><p class="text-xs text-parchment/50 mt-4 text-center"${_scopeId}> Press <kbd class="px-1 py-0.5 rounded bg-brown/30 border border-brown/40 text-xs text-parchment/50 font-mono"${_scopeId}>?</kbd> to toggle this dialog </p></div>`);
          } else {
            return [
              createVNode("div", { class: "p-5 max-w-lg" }, [
                createVNode("div", { class: "flex items-center justify-between mb-5" }, [
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, "Keyboard Shortcuts"),
                  createVNode(_component_UButton, {
                    icon: "i-lucide-x",
                    color: "neutral",
                    variant: "ghost",
                    size: "xs",
                    onClick: ($event) => showHelp.value = false
                  }, null, 8, ["onClick"])
                ]),
                createVNode("div", { class: "space-y-5" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(groupedShortcuts), ([group, items]) => {
                    return openBlock(), createBlock("div", { key: group }, [
                      createVNode("h3", { class: "text-xs font-semibold uppercase tracking-widest text-copper/60 mb-2" }, toDisplayString(group), 1),
                      createVNode("div", { class: "space-y-1.5" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(items, (shortcut) => {
                          return openBlock(), createBlock("div", {
                            key: shortcut.label,
                            class: "flex items-center justify-between py-1"
                          }, [
                            createVNode("span", { class: "text-sm text-parchment/70" }, toDisplayString(shortcut.label), 1),
                            createVNode("div", { class: "flex items-center gap-1" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(shortcut.keys, (key, ki) => {
                                return openBlock(), createBlock(Fragment, { key: ki }, [
                                  ki > 0 ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "text-xs text-parchment/20 mx-0.5"
                                  }, "/")) : createCommentVNode("", true),
                                  createVNode("span", { class: "inline-flex items-center gap-0.5" }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(formatKey(key).split("+"), (part, pi) => {
                                      return openBlock(), createBlock(Fragment, { key: pi }, [
                                        pi > 0 ? (openBlock(), createBlock("span", {
                                          key: 0,
                                          class: "text-xs text-parchment/20"
                                        }, "+")) : createCommentVNode("", true),
                                        createVNode("kbd", { class: "px-1.5 py-0.5 rounded bg-brown/30 border border-brown/40 text-xs text-parchment/60 font-mono min-w-[1.5rem] text-center" }, toDisplayString(part.trim()), 1)
                                      ], 64);
                                    }), 128))
                                  ])
                                ], 64);
                              }), 128))
                            ])
                          ]);
                        }), 128))
                      ])
                    ]);
                  }), 128))
                ]),
                createVNode("p", { class: "text-xs text-parchment/50 mt-4 text-center" }, [
                  createTextVNode(" Press "),
                  createVNode("kbd", { class: "px-1 py-0.5 rounded bg-brown/30 border border-brown/40 text-xs text-parchment/50 font-mono" }, "?"),
                  createTextVNode(" to toggle this dialog ")
                ])
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Admin/AdminShortcutsHelp.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const AdminShortcutsHelp = Object.assign(_sfc_main, { __name: "AdminShortcutsHelp" });

export { AdminShortcutsHelp as default };
//# sourceMappingURL=AdminShortcutsHelp-Cr5vMlqJ.mjs.map
