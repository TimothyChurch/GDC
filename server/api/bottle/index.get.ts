export default defineEventHandler(async (event) => {
    try {
      return await Bottle.find({}).lean()
    }
    catch (error) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch bottles' });
    }
  })
  