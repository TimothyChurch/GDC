import { h as useRouter, J as useState } from './server.mjs';
import { computed } from 'vue';

const useAuth = () => {
  const router = useRouter();
  const user = useState("auth-user", () => null);
  const isAuthenticated = computed(() => !!user.value);
  const fetchUser = async () => {
    try {
      const data = await $fetch("/api/auth/me");
      user.value = data;
    } catch {
      user.value = null;
    }
  };
  const login = async (email, password) => {
    const data = await $fetch("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });
    user.value = data;
  };
  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
    router.push("/login");
  };
  return { user, isAuthenticated, login, logout, fetchUser };
};

export { useAuth as u };
//# sourceMappingURL=useAuth-DX6ojG3V.mjs.map
