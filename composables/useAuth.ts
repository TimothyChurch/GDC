export const useAuth = () => {
  const router = useRouter();
  const login = async () => {
    const user = useCookie("user", {
      default: () => ({
        email: "",
        password: "",
        authenticated: false,
        data: {},
      }),
    });

    if (user.value.authenticated) {
      return;
    } else {
      console.log("Logging in...");
      console.log("User:", user.value.password);
      const data = (await $fetch("/api/users/find", {
        method: "PUT",
        body: JSON.stringify({
          email: user.value.email,
          password: user.value.password,
        }),
      })) as unknown as Array<{ _id: string; email: string; password: string }>;
      console.log(data);
      if (data.length > 0) {
        user.value.authenticated = true;
        user.value.data = data[0];
        router.push("/admin/dashboard");
        return true;
      }
    }
    return false;
  };
  return { login };
};
