import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { c as __nuxt_component_1$1, e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { defineComponent, ref, withCtx, createTextVNode, createVNode, isRef, unref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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

const _sfc_main$3 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_1$1;
  const _component_UIcon = _sfc_main$e;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><h3 class="text-sm font-semibold text-parchment/70 mb-4">Quick Access — All Compliance Reports</h3><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/admin/reports/ttb-production",
    class: "flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-blue-900/20 border border-transparent hover:border-blue-500/20 transition-all text-center"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-flask-conical",
          class: "text-blue-400 text-xl"
        }, null, _parent2, _scopeId));
        _push2(`<span class="text-xs text-parchment/70"${_scopeId}>TTB Production</span><span class="text-[10px] text-parchment/60"${_scopeId}>5110.11</span>`);
      } else {
        return [
          createVNode(_component_UIcon, {
            name: "i-lucide-flask-conical",
            class: "text-blue-400 text-xl"
          }),
          createVNode("span", { class: "text-xs text-parchment/70" }, "TTB Production"),
          createVNode("span", { class: "text-[10px] text-parchment/60" }, "5110.11")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/admin/reports/ttb-storage",
    class: "flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-purple-900/20 border border-transparent hover:border-purple-500/20 transition-all text-center"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-warehouse",
          class: "text-purple-400 text-xl"
        }, null, _parent2, _scopeId));
        _push2(`<span class="text-xs text-parchment/70"${_scopeId}>TTB Storage</span><span class="text-[10px] text-parchment/60"${_scopeId}>5110.11</span>`);
      } else {
        return [
          createVNode(_component_UIcon, {
            name: "i-lucide-warehouse",
            class: "text-purple-400 text-xl"
          }),
          createVNode("span", { class: "text-xs text-parchment/70" }, "TTB Storage"),
          createVNode("span", { class: "text-[10px] text-parchment/60" }, "5110.11")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/admin/reports/ttb-processing",
    class: "flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-emerald-900/20 border border-transparent hover:border-emerald-500/20 transition-all text-center"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-package-check",
          class: "text-emerald-400 text-xl"
        }, null, _parent2, _scopeId));
        _push2(`<span class="text-xs text-parchment/70"${_scopeId}>TTB Processing</span><span class="text-[10px] text-parchment/60"${_scopeId}>5110.28</span>`);
      } else {
        return [
          createVNode(_component_UIcon, {
            name: "i-lucide-package-check",
            class: "text-emerald-400 text-xl"
          }),
          createVNode("span", { class: "text-xs text-parchment/70" }, "TTB Processing"),
          createVNode("span", { class: "text-[10px] text-parchment/60" }, "5110.28")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/admin/reports/ttb-excise-tax",
    class: "flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-gold/10 border border-transparent hover:border-gold/20 transition-all text-center"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-receipt",
          class: "text-gold text-xl"
        }, null, _parent2, _scopeId));
        _push2(`<span class="text-xs text-parchment/70"${_scopeId}>TTB Excise Tax</span><span class="text-[10px] text-parchment/60"${_scopeId}>5000.24</span>`);
      } else {
        return [
          createVNode(_component_UIcon, {
            name: "i-lucide-receipt",
            class: "text-gold text-xl"
          }),
          createVNode("span", { class: "text-xs text-parchment/70" }, "TTB Excise Tax"),
          createVNode("span", { class: "text-[10px] text-parchment/60" }, "5000.24")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/admin/reports/tabc-monthly",
    class: "flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-amber-900/20 border border-transparent hover:border-amber-500/20 transition-all text-center"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-file-text",
          class: "text-amber-400 text-xl"
        }, null, _parent2, _scopeId));
        _push2(`<span class="text-xs text-parchment/70"${_scopeId}>TABC Monthly</span><span class="text-[10px] text-parchment/60"${_scopeId}>TX Production</span>`);
      } else {
        return [
          createVNode(_component_UIcon, {
            name: "i-lucide-file-text",
            class: "text-amber-400 text-xl"
          }),
          createVNode("span", { class: "text-xs text-parchment/70" }, "TABC Monthly"),
          createVNode("span", { class: "text-[10px] text-parchment/60" }, "TX Production")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/admin/reports/tabc-excise-tax",
    class: "flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-amber-900/20 border border-transparent hover:border-amber-500/20 transition-all text-center"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-landmark",
          class: "text-amber-500 text-xl"
        }, null, _parent2, _scopeId));
        _push2(`<span class="text-xs text-parchment/70"${_scopeId}>TABC Excise Tax</span><span class="text-[10px] text-parchment/60"${_scopeId}>§ 201.43</span>`);
      } else {
        return [
          createVNode(_component_UIcon, {
            name: "i-lucide-landmark",
            class: "text-amber-500 text-xl"
          }),
          createVNode("span", { class: "text-xs text-parchment/70" }, "TABC Excise Tax"),
          createVNode("span", { class: "text-[10px] text-parchment/60" }, "§ 201.43")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></div>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportComplianceQuickLinks.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$1]]), { __name: "ReportComplianceQuickLinks" });
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, _attrs))}><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">TTB Filing Reference</h3><div class="space-y-2 text-xs text-parchment/60"><div class="flex justify-between gap-2"><span>Monthly operational reports</span><span class="text-parchment/60 shrink-0">15th of following month</span></div><div class="flex justify-between gap-2"><span>FET deposit — Period 1 (1st-15th)</span><span class="text-parchment/60 shrink-0">29th of same month</span></div><div class="flex justify-between gap-2"><span>FET deposit — Period 2 (16th-end)</span><span class="text-parchment/60 shrink-0">14th of following month</span></div><div class="flex justify-between gap-2"><span>Annual physical inventory</span><span class="text-parchment/60 shrink-0">January 15</span></div><div class="flex justify-between gap-2"><span>CBMA annual claim</span><span class="text-parchment/60 shrink-0">January 31</span></div><div class="flex justify-between gap-2"><span>Record retention</span><span class="text-parchment/60 shrink-0">3 years at premises</span></div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">TABC Filing Reference</h3><div class="space-y-2 text-xs text-parchment/60"><div class="flex justify-between gap-2"><span>Monthly production &amp; disposition report</span><span class="text-parchment/60 shrink-0">15th of following month</span></div><div class="flex justify-between gap-2"><span>Texas excise tax ($2.40/WG)</span><span class="text-parchment/60 shrink-0">15th of following month</span></div><div class="flex justify-between gap-2"><span>Permit renewal</span><span class="text-parchment/60 shrink-0">Per permit expiry date</span></div><div class="flex justify-between gap-2"><span>DTC sales limit</span><span class="text-parchment/60 shrink-0">2 bottles/person/30 days</span></div><div class="flex justify-between gap-2"><span>Tasting room sample limit</span><span class="text-parchment/60 shrink-0">1 oz/product, 3 oz total</span></div><div class="flex justify-between gap-2"><span>Record retention</span><span class="text-parchment/60 shrink-0">3 years</span></div></div></div></div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportComplianceReference.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]), { __name: "ReportComplianceReference" });
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 864e5);
}
function formatDeadlineDate(d) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function urgencyFromDays(days) {
  if (days < 0) return "overdue";
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  if (days <= 21) return "upcoming";
  return "ok";
}
function urgencyLabel(level, days) {
  if (level === "overdue") return `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`;
  if (days === 0) return "Due today";
  return `${days} day${days !== 1 ? "s" : ""}`;
}
function urgencyClasses(level) {
  return {
    badge: {
      overdue: "bg-red-900/30 text-red-400 border-red-500/30",
      critical: "bg-orange-900/30 text-orange-400 border-orange-500/30",
      warning: "bg-yellow-900/30 text-yellow-400 border-yellow-500/30",
      upcoming: "bg-blue-900/20 text-blue-400 border-blue-500/20",
      ok: "bg-green-900/20 text-green-400 border-green-500/20"
    }[level],
    row: {
      overdue: "border-l-2 border-l-red-500",
      critical: "border-l-2 border-l-orange-500",
      warning: "border-l-2 border-l-yellow-500",
      upcoming: "border-l-2 border-l-blue-500",
      ok: "border-l-0"
    }[level]
  };
}
function useComplianceDeadlines(tabcPermitExpiry) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const deadlines = computed(() => {
    const list = [];
    const windowStart = addDays(today, -30);
    const windowEnd = addDays(today, 90);
    const cursor = new Date(windowStart.getFullYear(), windowStart.getMonth(), 1);
    while (cursor <= windowEnd) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const reportingMonth = new Date(y, m - 1, 1);
      const reportingLabel = reportingMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const ttbMonthlyDue = new Date(y, m, 15);
      if (ttbMonthlyDue >= windowStart && ttbMonthlyDue <= windowEnd) {
        const daysUntilMonthly = daysBetween(today, ttbMonthlyDue);
        const monthReportingKey = `${y}-${String(m).padStart(2, "0")}`;
        list.push({
          id: `ttb-production-${monthReportingKey}`,
          agency: "TTB",
          title: "TTB Production Report",
          description: `Monthly Report of Production Operations for ${reportingLabel}`,
          dueDate: ttbMonthlyDue,
          daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: "/admin/reports/ttb-production",
          formNumber: "Form 5110.11",
          period: reportingLabel
        });
        list.push({
          id: `ttb-storage-${monthReportingKey}`,
          agency: "TTB",
          title: "TTB Storage Report",
          description: `Storage Operations Report for ${reportingLabel}`,
          dueDate: ttbMonthlyDue,
          daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: "/admin/reports/ttb-storage",
          formNumber: "Form 5110.11",
          period: reportingLabel
        });
        list.push({
          id: `ttb-processing-${monthReportingKey}`,
          agency: "TTB",
          title: "TTB Processing Report",
          description: `Monthly Report of Processing Operations for ${reportingLabel}`,
          dueDate: ttbMonthlyDue,
          daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: "/admin/reports/ttb-processing",
          formNumber: "Form 5110.28",
          period: reportingLabel
        });
        list.push({
          id: `tabc-monthly-${monthReportingKey}`,
          agency: "TABC",
          title: "TABC Monthly Report",
          description: `Texas Monthly Production and Disposition Report for ${reportingLabel}`,
          dueDate: ttbMonthlyDue,
          daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: "/admin/reports/tabc-monthly",
          period: reportingLabel
        });
        list.push({
          id: `tabc-excise-${monthReportingKey}`,
          agency: "TABC",
          title: "TABC Excise Tax Remittance",
          description: `Texas distilled spirits excise tax ($2.40/WG) for ${reportingLabel}`,
          dueDate: ttbMonthlyDue,
          daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: "/admin/reports/tabc-excise-tax",
          period: reportingLabel
        });
      }
      const fetPeriod1Month = new Date(y, m - 1, 1);
      const fetPeriod1Label = fetPeriod1Month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const fetPeriod1Due = new Date(y, m - 1, 29);
      if (fetPeriod1Due >= windowStart && fetPeriod1Due <= windowEnd) {
        const daysUntilP1 = daysBetween(today, fetPeriod1Due);
        list.push({
          id: `ttb-fet-p1-${y}-${m}`,
          agency: "TTB",
          title: "FET Period 1 Deposit",
          description: `Federal excise tax deposit for ${fetPeriod1Label} days 1-15`,
          dueDate: fetPeriod1Due,
          daysUntil: daysUntilP1,
          urgency: urgencyFromDays(daysUntilP1),
          route: "/admin/reports/ttb-excise-tax",
          formNumber: "Form 5000.24",
          period: `${fetPeriod1Label} (days 1-15)`
        });
      }
      const fetPeriod2Due = new Date(y, m, 14);
      const fetPeriod2PriorMonth = new Date(y, m - 1, 1);
      const fetPeriod2Label = fetPeriod2PriorMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (fetPeriod2Due >= windowStart && fetPeriod2Due <= windowEnd) {
        const daysUntilP2 = daysBetween(today, fetPeriod2Due);
        list.push({
          id: `ttb-fet-p2-${y}-${m}`,
          agency: "TTB",
          title: "FET Period 2 Deposit",
          description: `Federal excise tax deposit for ${fetPeriod2Label} days 16-end`,
          dueDate: fetPeriod2Due,
          daysUntil: daysUntilP2,
          urgency: urgencyFromDays(daysUntilP2),
          route: "/admin/reports/ttb-excise-tax",
          formNumber: "Form 5000.24",
          period: `${fetPeriod2Label} (days 16-end)`
        });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const yearOffset of [0, 1]) {
      const inventoryDue = new Date(today.getFullYear() + yearOffset, 0, 15);
      if (inventoryDue >= windowStart && inventoryDue <= windowEnd) {
        const daysUntil = daysBetween(today, inventoryDue);
        list.push({
          id: `ttb-inventory-${inventoryDue.getFullYear()}`,
          agency: "TTB",
          title: "Annual Physical Inventory",
          description: `Required annual physical inventory of all spirits, wines, and materials (27 CFR 19.618) for ${inventoryDue.getFullYear() - 1}`,
          dueDate: inventoryDue,
          daysUntil,
          urgency: urgencyFromDays(daysUntil),
          period: `Calendar Year ${inventoryDue.getFullYear() - 1}`
        });
      }
    }
    for (const yearOffset of [0, 1]) {
      const cbmaDue = new Date(today.getFullYear() + yearOffset, 0, 31);
      if (cbmaDue >= windowStart && cbmaDue <= windowEnd) {
        const daysUntil = daysBetween(today, cbmaDue);
        list.push({
          id: `ttb-cbma-${cbmaDue.getFullYear()}`,
          agency: "TTB",
          title: "CBMA Annual Claim",
          description: `Annual Craft Beverage Modernization Act reduced rate claim for ${cbmaDue.getFullYear() - 1} — must be filed to maintain reduced FET rates`,
          dueDate: cbmaDue,
          daysUntil,
          urgency: urgencyFromDays(daysUntil),
          period: `Calendar Year ${cbmaDue.getFullYear() - 1}`
        });
      }
    }
    if (tabcPermitExpiry?.value) {
      const expiry = new Date(tabcPermitExpiry.value);
      const renewalWarning = addDays(expiry, -90);
      if (expiry >= windowStart && expiry <= windowEnd) {
        const daysUntil = daysBetween(today, expiry);
        list.push({
          id: "tabc-permit-renewal",
          agency: "TABC",
          title: "TABC Permit Renewal",
          description: `Distiller's and Rectifier's Permit expires ${formatDeadlineDate(expiry)} — renew at least 30 days before expiry`,
          dueDate: expiry,
          daysUntil,
          urgency: urgencyFromDays(daysUntil),
          period: formatDeadlineDate(expiry)
        });
      } else if (renewalWarning >= windowStart && renewalWarning <= windowEnd) {
        const daysUntil = daysBetween(today, expiry);
        list.push({
          id: "tabc-permit-renewal-warn",
          agency: "TABC",
          title: "TABC Permit Renewal (90-day warning)",
          description: `Permit expires ${formatDeadlineDate(expiry)} — begin renewal process now`,
          dueDate: expiry,
          daysUntil,
          urgency: "upcoming",
          period: formatDeadlineDate(expiry)
        });
      }
    }
    return list.sort((a, b) => {
      if (a.urgency === "overdue" && b.urgency !== "overdue") return -1;
      if (b.urgency === "overdue" && a.urgency !== "overdue") return 1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  });
  const overdueCounts = computed(() => ({
    ttb: deadlines.value.filter((d) => d.urgency === "overdue" && d.agency === "TTB").length,
    tabc: deadlines.value.filter((d) => d.urgency === "overdue" && d.agency === "TABC").length
  }));
  const criticalCount = computed(
    () => deadlines.value.filter((d) => d.urgency === "critical").length
  );
  const upcomingCount = computed(
    () => deadlines.value.filter((d) => d.urgency === "upcoming" || d.urgency === "warning").length
  );
  return {
    deadlines,
    overdueCounts,
    criticalCount,
    upcomingCount
  };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportComplianceDeadlines",
  __ssrInlineRender: true,
  props: {
    tabcPermitExpiry: {}
  },
  setup(__props) {
    const props = __props;
    const tabcPermitExpiryRef = computed(() => props.tabcPermitExpiry);
    const {
      deadlines,
      overdueCounts,
      criticalCount,
      upcomingCount
    } = useComplianceDeadlines(tabcPermitExpiryRef);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_ReportComplianceQuickLinks = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UButton = _sfc_main$8;
      const _component_ReportComplianceReference = __nuxt_component_4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="${ssrRenderClass([unref(overdueCounts).ttb + unref(overdueCounts).tabc > 0 ? "border-red-500/40 bg-red-900/10" : "border-green-500/20 bg-green-900/10", "rounded-xl border p-4 flex items-center gap-3"])}">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: unref(overdueCounts).ttb + unref(overdueCounts).tabc > 0 ? "i-lucide-alert-circle" : "i-lucide-check-circle",
        class: unref(overdueCounts).ttb + unref(overdueCounts).tabc > 0 ? "text-red-400 text-2xl" : "text-green-400 text-2xl"
      }, null, _parent));
      _push(`<div><div class="${ssrRenderClass([unref(overdueCounts).ttb + unref(overdueCounts).tabc > 0 ? "text-red-400" : "text-green-400", "text-sm font-semibold"])}">${ssrInterpolate(unref(overdueCounts).ttb + unref(overdueCounts).tabc > 0 ? `${unref(overdueCounts).ttb + unref(overdueCounts).tabc} Overdue` : "Nothing Overdue")}</div><div class="text-xs text-parchment/50">`);
      if (unref(overdueCounts).ttb > 0) {
        _push(`<span>TTB: ${ssrInterpolate(unref(overdueCounts).ttb)}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(overdueCounts).tabc > 0) {
        _push(`<span>TABC: ${ssrInterpolate(unref(overdueCounts).tabc)}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(overdueCounts).ttb + unref(overdueCounts).tabc === 0) {
        _push(`<span>All filings current</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="${ssrRenderClass([unref(criticalCount) > 0 ? "border-orange-500/30 bg-orange-900/10" : "border-brown/30 bg-charcoal", "rounded-xl border p-4 flex items-center gap-3"])}">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-clock",
        class: unref(criticalCount) > 0 ? "text-orange-400 text-2xl" : "text-parchment/50 text-2xl"
      }, null, _parent));
      _push(`<div><div class="${ssrRenderClass([unref(criticalCount) > 0 ? "text-orange-400" : "text-parchment/50", "text-sm font-semibold"])}">${ssrInterpolate(unref(criticalCount))} Due Within 3 Days </div><div class="text-xs text-parchment/50">Requires immediate action</div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-4 flex items-center gap-3">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-calendar",
        class: "text-blue-400 text-2xl"
      }, null, _parent));
      _push(`<div><div class="text-sm font-semibold text-parchment">${ssrInterpolate(unref(upcomingCount))} Upcoming</div><div class="text-xs text-parchment/50">Within 21 days</div></div></div></div>`);
      _push(ssrRenderComponent(_component_ReportComplianceQuickLinks, null, null, _parent));
      _push(`<div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden"><div class="p-4 border-b border-brown/20"><h3 class="text-sm font-semibold text-parchment/70">Filing Deadlines — 90 Day Window</h3><p class="text-xs text-parchment/60 mt-0.5">Showing deadlines from 30 days ago through 90 days ahead</p></div>`);
      if (unref(deadlines).length > 0) {
        _push(`<div><!--[-->`);
        ssrRenderList(unref(deadlines), (deadline) => {
          _push(`<div class="${ssrRenderClass([[
            unref(urgencyClasses)(deadline.urgency).row,
            deadline.urgency !== "ok" ? "pl-3" : "pl-4"
          ], "flex items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-brown/10 last:border-0 transition-colors"])}"><div class="flex items-start gap-3 min-w-0 flex-1"><span class="${ssrRenderClass([deadline.agency === "TTB" ? "text-blue-400 bg-blue-900/20 border-blue-500/30" : "text-amber-400 bg-amber-900/20 border-amber-500/30", "shrink-0 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border mt-0.5"])}">${ssrInterpolate(deadline.agency)}</span><div class="min-w-0"><div class="flex items-center gap-2 flex-wrap"><span class="text-sm font-medium text-parchment truncate">${ssrInterpolate(deadline.title)}</span>`);
          if (deadline.formNumber) {
            _push(`<span class="text-[10px] text-parchment/60 shrink-0">${ssrInterpolate(deadline.formNumber)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-xs text-parchment/50 mt-0.5 truncate">${ssrInterpolate(deadline.description)}</div><div class="text-xs text-parchment/60 mt-0.5">Due: ${ssrInterpolate(unref(formatDeadlineDate)(deadline.dueDate))}</div></div></div><div class="flex items-center gap-2 shrink-0"><span class="${ssrRenderClass([unref(urgencyClasses)(deadline.urgency).badge, "text-xs font-semibold px-2 py-1 rounded-full border"])}">${ssrInterpolate(unref(urgencyLabel)(deadline.urgency, deadline.daysUntil))}</span>`);
          if (deadline.route) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: deadline.route
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UButton, {
                    size: "xs",
                    variant: "ghost",
                    icon: "i-lucide-arrow-right",
                    class: "text-parchment/50 hover:text-parchment"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      size: "xs",
                      variant: "ghost",
                      icon: "i-lucide-arrow-right",
                      class: "text-parchment/50 hover:text-parchment"
                    })
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-center py-10 text-parchment/50 text-sm"> No deadlines in window </div>`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_ReportComplianceReference, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportComplianceDeadlines.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$1, { __name: "ReportComplianceDeadlines" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "compliance-calendar",
  __ssrInlineRender: true,
  setup(__props) {
    const tabcPermitExpiry = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UButton = _sfc_main$8;
      const _component_UIcon = _sfc_main$e;
      const _component_UInput = _sfc_main$4;
      const _component_ReportComplianceDeadlines = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Compliance Calendar",
        subtitle: "TTB and TABC filing deadlines — 90-day rolling window",
        icon: "i-lucide-calendar-days"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, { to: "/admin/reports" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UButton, {
                    variant: "outline",
                    icon: "i-lucide-arrow-left",
                    size: "sm"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Back`);
                      } else {
                        return [
                          createTextVNode("Back")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      variant: "outline",
                      icon: "i-lucide-arrow-left",
                      size: "sm"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Back")
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, { to: "/admin/reports" }, {
                default: withCtx(() => [
                  createVNode(_component_UButton, {
                    variant: "outline",
                    icon: "i-lucide-arrow-left",
                    size: "sm"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Back")
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex items-center gap-3 mb-6 bg-brown/10 rounded-lg p-3 border border-brown/20 w-fit print:hidden">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-shield-check",
        class: "text-amber-400 text-sm shrink-0"
      }, null, _parent));
      _push(`<span class="text-xs text-parchment/60">TABC Permit Expiry Date:</span>`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(tabcPermitExpiry),
        "onUpdate:modelValue": ($event) => isRef(tabcPermitExpiry) ? tabcPermitExpiry.value = $event : null,
        type: "date",
        size: "sm",
        placeholder: "YYYY-MM-DD",
        class: "w-40"
      }, null, _parent));
      _push(`<span class="text-xs text-parchment/60">Optional — enables permit renewal deadline</span></div>`);
      _push(ssrRenderComponent(_component_ReportComplianceDeadlines, {
        "tabc-permit-expiry": unref(tabcPermitExpiry) || void 0
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/compliance-calendar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=compliance-calendar-W1ixTzEC.mjs.map
