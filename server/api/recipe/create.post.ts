export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    try {
      return await new Recipe(body).save()
    }
    catch (error) {
      return error
    }
  })