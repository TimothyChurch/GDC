export default createCreateHandler(Event, {
  schema: eventCreateSchema,
  populate: "contact",
});
