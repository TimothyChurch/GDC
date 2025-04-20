export default defineNuxtRouteMiddleware((to, from) => {
  const user = useCookie("user", {
    default: () => ({
      email: "",
      password: "",
      authenticated: false,
      data: {},
    }),
  });
  if (user.value.authenticated) {
    console.log("User is authenticated");
    return;
  } else {
    console.log("User is not authenticated");
    return navigateTo("/login");
  }
});
