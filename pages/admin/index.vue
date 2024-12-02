<script setup>
definePageMeta({
  layout: "admin",
});
</script>

<template>
  <div class="grid grid-cols-2 gap-2">
    <UCard class="col-span-2">
      <TableInventorySummary />
    </UCard>
    <UCard>
      <template #header>Contacts</template>
      <TableContacts />
    </UCard>
    <UCard>
      <template #header>items</template>
      <TableItems />
    </UCard>
    <UCard>
      <template #header>Recipes</template>
      <TableRecipes />
    </UCard>
    <UCard>
      <template #header>Bottles</template>
      <TableBottles />
    </UCard>
  </div>
</template>
