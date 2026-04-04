import { g as useOverlay } from './server.mjs';
import { defineAsyncComponent } from 'vue';

const LazyModalDeleteConfirm = defineAsyncComponent(() => import('./ModalDeleteConfirm-D2_YzExu.mjs').then((r) => r["default"] || r.default || r));
const useDeleteConfirm = () => {
  const overlay = useOverlay();
  const confirm = async (entityName, entityLabel) => {
    const modal = overlay.create(LazyModalDeleteConfirm);
    const result = await modal.open({ entityName, entityLabel });
    return result === true;
  };
  return { confirm };
};

export { useDeleteConfirm as u };
//# sourceMappingURL=useDeleteConfirm-ChUK9dnx.mjs.map
