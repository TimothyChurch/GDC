<script setup lang="ts">
import type { InventoryCategoryDef } from "~/types";

const settingsStore = useSettingsStore();
const toast = useToast();

const localCategories = ref<InventoryCategoryDef[]>([]);
const editingIndex = ref<number | null>(null);
const categoryForm = ref<InventoryCategoryDef>({
  key: "",
  label: "",
  category: "",
  icon: "i-lucide-box",
  description: "",
});

function resetCategories() {
  localCategories.value = settingsStore.itemCategories.map((c) => ({ ...c }));
  editingIndex.value = null;
  resetCategoryForm();
}
resetCategories();

watch(() => settingsStore.itemCategories, resetCategories);

function resetCategoryForm() {
  categoryForm.value = { key: "", label: "", category: "", icon: "i-lucide-box", description: "" };
}

function autoGenerateKey() {
  if (!editingIndex.value && editingIndex.value !== 0) {
    categoryForm.value.key = categoryForm.value.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}

function startEditing(index: number) {
  editingIndex.value = index;
  categoryForm.value = { ...localCategories.value[index] };
}

function cancelEditing() {
  editingIndex.value = null;
  resetCategoryForm();
}

function addOrUpdateCategory() {
  const form = categoryForm.value;
  if (!form.key.trim() || !form.label.trim() || !form.category.trim()) {
    toast.add({ title: "Key, label, and category are required", color: "warning", icon: "i-lucide-alert-triangle" });
    return;
  }
  const duplicate = localCategories.value.findIndex((c) => c.key === form.key.trim());
  if (duplicate !== -1 && duplicate !== editingIndex.value) {
    toast.add({ title: "A category with this key already exists", color: "warning", icon: "i-lucide-alert-triangle" });
    return;
  }

  const entry: InventoryCategoryDef = {
    key: form.key.trim(),
    label: form.label.trim(),
    category: form.category.trim(),
    icon: form.icon.trim() || "i-lucide-box",
    description: form.description.trim(),
  };

  if (editingIndex.value !== null) {
    localCategories.value[editingIndex.value] = entry;
    editingIndex.value = null;
  } else {
    localCategories.value.push(entry);
  }
  resetCategoryForm();
}

function removeCategory(index: number) {
  localCategories.value.splice(index, 1);
  if (editingIndex.value === index) {
    editingIndex.value = null;
    resetCategoryForm();
  } else if (editingIndex.value !== null && editingIndex.value > index) {
    editingIndex.value--;
  }
}

async function saveCategories() {
  if (localCategories.value.length === 0) {
    toast.add({ title: "At least one category is required", color: "warning", icon: "i-lucide-alert-triangle" });
    return;
  }
  await settingsStore.updateSettings({ itemCategories: localCategories.value });
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-6 mt-4">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Item Categories</h3>
      <p class="text-sm text-parchment/60 mt-1">
        Manage the inventory categories. Each category has a name, label, icon, and description used across the inventory pages.
      </p>
    </div>

    <!-- Existing categories list -->
    <div class="space-y-2 mb-6">
      <div
        v-for="(cat, i) in localCategories"
        :key="cat.key"
        :class="[
          'flex items-center gap-3 rounded-lg px-4 py-3 border transition-colors',
          editingIndex === i
            ? 'bg-primary/10 border-primary/40'
            : 'bg-espresso/50 border-brown/20',
        ]"
      >
        <UIcon :name="cat.icon || 'i-lucide-box'" class="text-lg text-parchment/70 shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-parchment">{{ cat.label }}</span>
            <UBadge :label="cat.category" variant="subtle" color="neutral" size="xs" />
          </div>
          <p v-if="cat.description" class="text-xs text-parchment/50 mt-0.5 truncate">{{ cat.description }}</p>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" @click="startEditing(i)" />
          <UButton icon="i-lucide-x" color="error" variant="ghost" size="xs" :disabled="localCategories.length <= 1" @click="removeCategory(i)" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="localCategories.length === 0" class="text-center py-6 mb-4">
      <UIcon name="i-lucide-tags" class="text-3xl text-parchment/30 mb-2" />
      <p class="text-sm text-parchment/50">No categories defined</p>
    </div>

    <!-- Add / Edit form -->
    <div class="bg-espresso/30 rounded-lg border border-brown/20 p-4">
      <h4 class="text-sm font-medium text-parchment/80 mb-3">
        {{ editingIndex !== null ? 'Edit Category' : 'Add New Category' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <UFormField label="Category" required>
          <UInput v-model="categoryForm.category" placeholder="e.g. Bottling" class="w-full" @input="autoGenerateKey" />
        </UFormField>
        <UFormField label="Label" required>
          <UInput v-model="categoryForm.label" placeholder="e.g. Bottling Supplies" class="w-full" />
        </UFormField>
        <UFormField label="Key (URL slug)" required>
          <UInput v-model="categoryForm.key" placeholder="e.g. bottling" class="w-full" />
        </UFormField>
        <UFormField label="Icon">
          <UInput v-model="categoryForm.icon" placeholder="i-lucide-box" class="w-full">
            <template #leading>
              <UIcon :name="categoryForm.icon || 'i-lucide-box'" class="text-parchment/50" />
            </template>
          </UInput>
        </UFormField>
        <UFormField label="Description" class="md:col-span-2">
          <UInput v-model="categoryForm.description" placeholder="Brief description of this category..." class="w-full" />
        </UFormField>
      </div>
      <div class="flex justify-end gap-2 mt-3">
        <UButton
          v-if="editingIndex !== null"
          label="Cancel"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="cancelEditing"
        />
        <UButton
          :icon="editingIndex !== null ? 'i-lucide-check' : 'i-lucide-plus'"
          :label="editingIndex !== null ? 'Update' : 'Add Category'"
          color="primary"
          size="sm"
          :disabled="!categoryForm.key.trim() || !categoryForm.label.trim() || !categoryForm.category.trim()"
          @click="addOrUpdateCategory"
        />
      </div>
    </div>

    <!-- Save -->
    <div class="flex justify-end mt-6 pt-4 border-t border-brown/20">
      <div class="flex items-center gap-2">
        <UButton label="Reset" variant="ghost" color="neutral" @click="resetCategories" />
        <UButton label="Save Categories" icon="i-lucide-save" color="primary" :loading="settingsStore.saving" @click="saveCategories" />
      </div>
    </div>
  </div>
</template>
