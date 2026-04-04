import { defineAsyncComponent } from 'vue';

const LazyPanelItem = defineAsyncComponent(() => import('./PanelItem-AlsDew3f.mjs').then((r) => r["default"] || r.default || r));

export { LazyPanelItem as L };
//# sourceMappingURL=PanelItem-B6mZ28UD.mjs.map
