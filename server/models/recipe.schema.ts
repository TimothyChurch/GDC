import { defineMongooseModel } from '#nuxt/mongoose'

export const Recipe = defineMongooseModel({
    name: "Recipe",
    schema: {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        ingredients: {
            type: Array,
            required: true
        },
        
    }
})