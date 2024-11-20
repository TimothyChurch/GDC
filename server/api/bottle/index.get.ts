export default defineEventHandler(async (event) => {
    try {
      return await Bottle.find({})
    }
    catch (error) {
      return error
    }
  })
  