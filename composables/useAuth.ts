interface AuthUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const user = useState<AuthUser | null>('auth-user', () => null);

  const isAuthenticated = computed(() => !!user.value);

  const fetchUser = async () => {
    try {
      const data = await $fetch<AuthUser>('/api/auth/me');
      user.value = data;
    } catch {
      user.value = null;
    }
  };

  const login = async (email: string, password: string) => {
    const data = await $fetch<AuthUser>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    user.value = data;
  };

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;
    router.push('/login');
  };

  return { user, isAuthenticated, login, logout, fetchUser };
};
