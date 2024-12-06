<script setup>
const items = (row) => [
  [
    {
      label: "item",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => console.log("Edit"),
    },
    {
      label: "Recipe",
      icon: "i-heroicons-document-duplicate-20-solid",
    },
    {
      label: "Bottle",
      icon: "i-heroicons-bottle-3-20-solid",
    },
  ],
  [
    {
      label: "Archive",
      icon: "i-heroicons-archive-box-20-solid",
    },
    {
      label: "Move",
      icon: "i-heroicons-arrow-right-circle-20-solid",
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
    },
  ],
];
</script>

<template>
  <div class="flex justify-between p-3 h-14">
    <div>Profile Area</div>
    <div name="Right Nav">
      <UDropdown :items="items()">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-plus-circle"
          size="xl" />
      </UDropdown>
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-calculator"
        @click="toggleCalculatorModal" />
    </div>
  </div>
</template>
