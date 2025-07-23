<script setup></script>

<template>
  <div class="flex flex-col w-screen h-screen max-w-max-screen max-h-screen">
    <AdminHeader class="print:hidden" />
    <div class="flex flex-grow overflow-y-hidden">
      <AdminSidebar class="print:hidden" />
      <div class="overflow-y-auto flex-grow mx-auto">
        <slot />
      </div>
    </div>
    <!-- <AdminModals /> -->
  </div>
</template>
