import nuxtStorage from 'nuxt-storage';

const authorized = ref(false);
const user = ref(null);
const error = ref('');

export const useAuth = () => {
	console.log('useAuth initialized');
	const getStoredUser = () => {
		try {
			user.value = nuxtStorage.localStorage.getData('user');
			if (user.value) {
				authorized.value = true;
			}
		} catch (error) {
			nuxtStorage.localStorage.clear;
			console.error('Failed to retrieve user from localStorage:', error);
		}
	};

	const login = async (email: string, password: string) => {
		if (email === '' || password === '') {
			return 'Please fill in all fields';
		}
		if (nuxtStorage.localStorage.getData('user')?.value) {
			user.value = nuxtStorage.localStorage.getData('user').value;
			console.log(user.value);
		} else {
			user.value = await $fetch('/api/users/find', {
				method: 'PUT',
				body: JSON.stringify({
					email: email,
					password: password,
				}),
			});
			console.log(user.value);
		}
		if (user.value) {
			console.log(user.value);
			nuxtStorage.localStorage.setData('user', user.value, 5, 'd');
			authorized.value = true;
		} else {
			error.value = 'Invalid email or password';
		}
		return;
	};
	return { login, user, authorized, getStoredUser, error };
};
