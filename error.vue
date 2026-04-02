<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps<{ error: NuxtError }>();

useHead({ title: 'Page Not Found | Galveston Distilling Co' });

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <p class="text-7xl font-bold text-neutral-300 dark:text-neutral-700 font-serif">
        {{ error.statusCode }}
      </p>
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-serif">
        {{ error.statusCode === 404 ? 'Page Not Found' : 'Something Went Wrong' }}
      </h1>
      <p class="text-neutral-600 dark:text-neutral-400">
        {{
          error.statusCode === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : 'An unexpected error occurred. Please try again.'
        }}
      </p>
      <button
        class="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
        @click="handleError"
      >
        Back to Home
      </button>
    </div>
  </div>
</template>
