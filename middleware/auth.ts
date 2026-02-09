export default defineNuxtRouteMiddleware((to, from) => {
  const user = useCookie("user", {
    default: () => ({
      email: "",
      authenticated: false,
      data: {},
    }),
  });

  if (user.value.authenticated) {
    return;
  } else {
    return navigateTo("/login");
  }
});
