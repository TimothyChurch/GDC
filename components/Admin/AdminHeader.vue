<script setup>
const { logout } = useAuth();
const user = useCookie("user", {
  default: () => ({ email: "", authenticated: false, data: {} }),
});
const items = () => [
  [
    {
      label: "Contact",
      click: () => {
        formSelection.value = "FormContact";
        toggleFormModal();
      },
    },
    {
      label: "Item",
      click: () => {
        formSelection.value = "FormItem";
        toggleFormModal();
      },
    },
    {
      label: "Recipe",
      click: () => {
        formSelection.value = "FormRecipe";
        toggleFormModal();
      },
    },
    {
      label: "Batch",
      click: () => {
        formSelection.value = "FormBatch";
        toggleFormModal();
      },
    },
    {
      label: "Vessel",
      click: () => {
        formSelection.value = "FormVessel";
        toggleFormModal();
      },
    },
    {
      label: "Inventory",
      click: () => {
        formSelection.value = "FormInventory";
        toggleFormModal();
      },
    },
    {
      label: "Purchase Order",
      click: () => {
        formSelection.value = "FormPurchaseOrder";
        toggleFormModal();
      },
    },
    {
      label: "Inventory",
      click: () => {
        formSelection.value = "FormInventory";
        toggleFormModal();
      },
    },
  ],
];
</script>

<template>
  <div class="flex justify-between p-3 h-14 bg-[var(--shadow)]">
    <div class="flex items-center gap-2">
      <span>{{ user.email }}</span>
      <UButton color="gray" variant="ghost" size="sm" @click="logout">Logout</UButton>
    </div>
    <!-- <AdminSearch /> -->
    <div name="Right Nav" class="flex">
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-bug-ant-solid"
        size="xl"
      />
      <!-- <UDropdownMenu :items="items()">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-plus-circle"
          size="xl"
        />
      </UDropdownMenu> -->
      <ModalCalculators />
    </div>
  </div>
</template>
