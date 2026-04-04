import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, g as useOverlay } from './server.mjs';
import { _ as __nuxt_component_4 } from './TableWrapper-DhLG7m1v.mjs';
import { _ as _sfc_main$2 } from './Table-HT3K8pYo.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { defineComponent, ref, withCtx, unref, createTextVNode, createVNode, computed, mergeProps, isRef, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, defineAsyncComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
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
import './Input-Fd8Vd_4J.mjs';
import './FormField-DcXe0kwN.mjs';
import './Select-xxK8NqZT.mjs';
import '@tanstack/vue-virtual';
import './errorMessage-C32Dqgoz.mjs';

const useUserStore = defineStore("users", () => {
  const crud = useCrudStore({
    name: "User",
    apiPath: "/api/users",
    defaultItem: () => ({
      _id: "",
      email: "",
      password: "",
      firstName: "",
      lastName: ""
    }),
    resetOnSave: false,
    beforeUpdate: (data) => {
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }
      return payload;
    }
  });
  return {
    ...crud,
    // Domain aliases for backward compatibility
    users: crud.items,
    user: crud.item,
    getUsers: crud.getAll,
    updateUser: crud.saveItem,
    deleteUser: crud.deleteItem,
    resetUser: crud.resetItem,
    setUser: crud.setItem,
    getUserById: crud.getById
  };
});
const LazyPanelUser = defineAsyncComponent(() => import('./PanelUser-BakvmDSA.mjs').then((r) => r["default"] || r.default || r));
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TableUsers",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const userStore = useUserStore();
    const { confirm } = useDeleteConfirm();
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => userStore.users.length)
    );
    const columns = [
      sortableColumn("firstName", "Name", {
        id: "firstName",
        accessorFn: (row) => `${row.firstName || ""} ${row.lastName || ""}`.trim(),
        cell: ({ row }) => {
          const first = row.original.firstName || "";
          const last = row.original.lastName || "";
          return `${first} ${last}`.trim() || "N/A";
        }
      }),
      sortableColumn("email", "Email"),
      actionsColumn((row) => [
        {
          label: "Edit user",
          onSelect() {
            userStore.setUser(row.original._id);
            openPanel();
          }
        },
        {
          label: "Delete user",
          variant: "danger",
          async onClick() {
            const name = `${row.original.firstName || ""} ${row.original.lastName || ""}`.trim() || row.original.email;
            const confirmed = await confirm("User", name);
            if (confirmed) {
              userStore.deleteUser(row.original._id);
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelUser);
    const openPanel = async () => await panel.open();
    const addUser = () => {
      userStore.resetUser();
      openPanel();
    };
    __expose({ addUser });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4;
      const _component_UTable = _sfc_main$2;
      const _component_BaseEmptyState = __nuxt_component_6;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(userStore).loading,
        "search-placeholder": "Search users..."
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="hidden sm:block"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UTable, {
              ref_key: "tableRef",
              ref: tableRef,
              "global-filter": unref(search),
              "onUpdate:globalFilter": ($event) => isRef(search) ? search.value = $event : null,
              pagination: unref(pagination),
              "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
              "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
              data: unref(userStore).users,
              columns,
              loading: unref(userStore).loading,
              onSelect: (_e, row) => {
                unref(userStore).setUser(row.original._id);
                openPanel();
              },
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-user",
                    title: "No users found",
                    description: "Add users to manage admin access",
                    "action-label": "Add User",
                    onAction: addUser
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-user",
                      title: "No users found",
                      description: "Add users to manage admin access",
                      "action-label": "Add User",
                      onAction: addUser
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(userStore).users.filter((u) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return (u.firstName || "").toLowerCase().includes(term) || (u.lastName || "").toLowerCase().includes(term) || (u.email || "").toLowerCase().includes(term);
            }), (user) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-center gap-3"${_scopeId}><div class="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper"${_scopeId}>${ssrInterpolate((user.firstName?.[0] || user.email?.[0] || "?").toUpperCase())}</div><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(`${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A")}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(user.email)}</div></div></div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(userStore).users.length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-user",
                title: "No users found",
                description: "Add users to manage admin access",
                "action-label": "Add User",
                onAction: addUser
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "hidden sm:block" }, [
                createVNode(_component_UTable, {
                  ref_key: "tableRef",
                  ref: tableRef,
                  "global-filter": unref(search),
                  "onUpdate:globalFilter": ($event) => isRef(search) ? search.value = $event : null,
                  pagination: unref(pagination),
                  "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
                  "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
                  data: unref(userStore).users,
                  columns,
                  loading: unref(userStore).loading,
                  onSelect: (_e, row) => {
                    unref(userStore).setUser(row.original._id);
                    openPanel();
                  },
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-user",
                      title: "No users found",
                      description: "Add users to manage admin access",
                      "action-label": "Add User",
                      onAction: addUser
                    })
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(userStore).users.filter((u) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return (u.firstName || "").toLowerCase().includes(term) || (u.lastName || "").toLowerCase().includes(term) || (u.email || "").toLowerCase().includes(term);
                }), (user) => {
                  return openBlock(), createBlock("div", {
                    key: user._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => {
                      unref(userStore).setUser(user._id);
                      openPanel();
                    }
                  }, [
                    createVNode("div", { class: "flex items-center gap-3" }, [
                      createVNode("div", { class: "w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper" }, toDisplayString((user.firstName?.[0] || user.email?.[0] || "?").toUpperCase()), 1),
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(`${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(user.email), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(userStore).users.length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-user",
                  title: "No users found",
                  description: "Add users to manage admin access",
                  "action-label": "Add User",
                  onAction: addUser
                })) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableUsers.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "TableUsers" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "users",
  __ssrInlineRender: true,
  setup(__props) {
    const tableRef = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableUsers = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Users",
        subtitle: "Manage admin user accounts",
        icon: "i-lucide-users-round"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: ($event) => unref(tableRef)?.addUser()
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add User`);
                } else {
                  return [
                    createTextVNode("Add User")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-plus",
                onClick: ($event) => unref(tableRef)?.addUser()
              }, {
                default: withCtx(() => [
                  createTextVNode("Add User")
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TableUsers, {
        ref_key: "tableRef",
        ref: tableRef
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const users = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main
}, Symbol.toStringTag, { value: "Module" }));

export { users as a, useUserStore as u };
//# sourceMappingURL=users-eiVLLlBy.mjs.map
