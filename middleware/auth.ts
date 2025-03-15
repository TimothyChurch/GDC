const { user, authorized, getStoredUser } = useAuth();
export default defineNuxtRouteMiddleware((to, from) => {
	getStoredUser();
	if (authorized.value) {
		console.log('User is authenticated');
		return;
	} else {
		console.log('User is not authenticated');
		return navigateTo('/login');
	}
});
