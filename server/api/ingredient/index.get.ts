export default defineEventHandler(async (event) => {
    try {
      return await Ingredient.find({})
    }
    catch (error) {
      return error
    }
  })
  