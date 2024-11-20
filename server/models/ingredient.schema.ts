import { defineMongooseModel } from '#nuxt/mongoose'

export const Ingredient = defineMongooseModel({
    name: "Ingredient",
    schema: {
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
        },
        vendor: {
            type: String,
        },
    }
})
