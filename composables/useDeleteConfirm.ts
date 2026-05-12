import { LazyModalDeleteConfirm } from '#components';

interface ConfirmOptions {
  verb?: string;
  warningText?: string;
}

export const useDeleteConfirm = () => {
  const overlay = useOverlay();

  const confirm = async (
    entityName: string,
    entityLabel?: string,
    options?: ConfirmOptions
  ): Promise<boolean> => {
    const modal = overlay.create(LazyModalDeleteConfirm);
    const result = await modal.open({
      entityName,
      entityLabel,
      verb: options?.verb,
      warningText: options?.warningText,
    });
    return result === true;
  };

  return { confirm };
};
