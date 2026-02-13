<script setup lang="ts"></script>

<template>
  <div class="py-16 sm:py-24 lg:py-32">
    <div
      class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-8 lg:px-8"
    >
      <h2
        class="max-w-xl text-3xl font-semibold tracking-tight text-balance text-brown dark:text-parchment sm:text-4xl lg:col-span-7 font-[Cormorant_Garamond]"
      >
        Want product news and updates? Sign up for our newsletter.
      </h2>
      <form class="w-full max-w-md lg:col-span-5 lg:pt-2">
        <div class="flex gap-x-4">
          <label for="email-address" class="sr-only">Email address</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autocomplete="email"
            required=""
            class="min-w-0 flex-auto rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/40 dark:placeholder:text-parchment/40 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6"
            placeholder="Enter your email"
          />
          <button
            type="submit"
            class="flex-none rounded-md bg-gold px-3.5 py-2.5 text-sm font-semibold text-espresso shadow-xs hover:bg-copper transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Subscribe
          </button>
        </div>
        <p class="mt-4 text-sm/6 text-brown/70 dark:text-parchment/70">
          We care about your data. Read our
          <a
            href="#"
            class="font-semibold whitespace-nowrap text-gold hover:text-copper transition-colors"
            >privacy policy</a
          >.
        </p>
      </form>
    </div>
  </div>
</template>
