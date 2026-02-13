<script setup lang="ts">
const router = useRouter();
const { login } = useAuth();

const user = useCookie("user", {
  default: () => ({
    email: "",
    authenticated: false,
    data: {},
  }),
});

onMounted(() => {
  if (user.value.authenticated) {
    router.push("/admin/dashboard");
  }
});

const email = ref("");
const password = ref("");
const error = ref("");

const handleLogin = async () => {
  error.value = "";
  try {
    const success = await login(email.value, password.value);
    if (!success) {
      error.value = "Invalid email or password.";
    }
  } catch (e) {
    error.value = "An error occurred during login. Please try again.";
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <UForm
        :state="{ email, password }"
        @submit="handleLogin"
        class="mt-8 space-y-6"
      >
        <UFormField label="Email address" name="email">
          <UInput
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="Email address"
          />
        </UFormField>
        <UFormField label="Password" name="password">
          <UInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="Password"
          />
        </UFormField>
        <div>
          <UButton type="submit" color="primary" block> Sign in </UButton>
        </div>
      </UForm>
      <p v-if="error" class="mt-2 text-center text-sm text-red-600">
        {{ error }}
      </p>
    </div>
  </div>
</template>
