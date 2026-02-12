import { ModalDeleteConfirm } from '#components';

export const useDeleteConfirm = () => {
  const overlay = useOverlay();

  const confirm = async (entityName: string, entityLabel?: string): Promise<boolean> => {
    const modal = overlay.create(ModalDeleteConfirm);
    const result = await modal.open({ entityName, entityLabel });
    return result === true;
  };

  return { confirm };
};
