export const useAuth = () => {
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const user = useCookie("user", {
      default: () => ({
        email: "",
        authenticated: false,
        data: {},
      }),
      sameSite: "strict" as const,
      secure: true,
    });

    console.log("Current user state:", user.value);
    console.log("Attempting login with email:", email);

    if (user.value.authenticated) {
      return true;
    }

    const data = (await $fetch("/api/users/find", {
      method: "PUT",
      body: JSON.stringify({ email, password }),
    })) as unknown as Array<{ _id: string; email: string; password: string }>;

    if (data.length > 0) {
      const { password: _, ...userData } = data[0];
      user.value.authenticated = true;
      user.value.email = email;
      user.value.data = userData;
      router.push("/admin/dashboard");
      return true;
    }

    return false;
  };

  const logout = () => {
    const user = useCookie("user");
    user.value = null;
    router.push("/login");
  };

  return { login, logout };
};
