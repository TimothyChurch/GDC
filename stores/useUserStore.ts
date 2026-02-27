import type { User } from '~/types';

export const useUserStore = defineStore('users', () => {
  const crud = useCrudStore<User>({
    name: 'User',
    apiPath: '/api/users',
    defaultItem: () => ({
      _id: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    }),
    resetOnSave: false,
    beforeUpdate: (data) => {
      // Strip empty password so it doesn't overwrite the existing hash
      const payload = { ...data };
      if (!payload.password) {
        delete (payload as any).password;
      }
      return payload;
    },
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
    getUserById: crud.getById,
  };
});
