<script setup></script>

<template>
  <div class="flex flex-col w-screen h-screen w-max-screen h-max-screen">
    <AdminHeader class="print:hidden"/>
    <div class="flex flex-grow overflow-y-hidden">
      <AdminSidebar class="print:hidden"/>
      <div class="overflow-y-auto flex-grow mx-auto">
        <slot />
      </div>
    </div>
    <!-- <AdminModals /> -->
  </div>
</template>
