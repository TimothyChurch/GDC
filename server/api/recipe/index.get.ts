export default defineEventHandler(async (event) => {
    try {
      return await Recipe.find({})
    }
    catch (error) {
      return error
    }
  })
  