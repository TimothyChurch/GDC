import type { User } from '~/types';

export const useUserStore = defineStore('users', () => {
  const toast = useToast();

  const users = ref<User[]>([]);
  const loaded = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const user = ref<User>({
    _id: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const getUsers = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch('/api/users');
      users.value = response as User[];
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await getUsers();
        loaded.value = true;
      } catch {
        // loaded stays false — will retry on next call
      }
    }
  };

  const getUserById = (id: string): User | undefined =>
    users.value.find((u) => u._id === id);

  const setUser = (id: string) => {
    const found = users.value.find((u) => u._id === id);
    if (found) {
      user.value = { ...found };
    }
  };

  const resetUser = () => {
    user.value = {
      _id: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    };
  };

  const updateUser = async (): Promise<void> => {
    saving.value = true;
    try {
      const isNew = !user.value._id;
      if (isNew) {
        const { _id, ...createData } = user.value;
        const response = await $fetch('/api/users/create', {
          method: 'POST',
          body: JSON.stringify(createData),
        });
        users.value.push(response as User);
      } else {
        const payload = { ...user.value };
        if (!payload.password) {
          delete (payload as any).password;
        }
        const response = await $fetch(`/api/users/${user.value._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        const index = users.value.findIndex((u) => u._id === user.value._id);
        if (index !== -1) {
          users.value[index] = response as User;
        }
      }
      toast.add({ title: `User ${!user.value._id ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
    } catch (error: any) {
      toast.add({ title: 'Failed to save user', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      await $fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      users.value = users.value.filter((u) => u._id !== id);
      toast.add({ title: 'User deleted', color: 'success', icon: 'i-lucide-check-circle' });
    } catch (error: any) {
      toast.add({ title: 'Failed to delete user', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  return {
    users,
    user,
    loaded,
    loading,
    saving,
    ensureLoaded,
    getUsers,
    getUserById,
    setUser,
    resetUser,
    updateUser,
    deleteUser,
  };
});
