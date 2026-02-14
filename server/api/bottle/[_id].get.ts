export default defineEventHandler(async (event) => {
    try {
      return await Bottle.findOne({ _id: event.context.params?._id })
    }
    catch (error) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch bottle' });
    }
  })