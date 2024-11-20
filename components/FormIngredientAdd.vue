<script setup>
const ingredient = reactive({
    name: '',
    type: '',
    vendor: '',
})

const addIngredient = async() => {
    await $fetch('/api/ingredient/create', {
        method: 'POST',
        body: JSON.stringify(ingredient)
    })
}
</script>

<template>
    <div>
        <label for="name">Name:</label>
        <input type="text" v-model="ingredient.name" />
        <label for="type">Type:</label>
        <input type="text" v-model="ingredient.type" />
        <label for="vendor">Vendor:</label>
        <input type="text" v-model="ingredient.vendor" />
        <button @click="addIngredient">Add Ingredient</button>
    </div>
</template>