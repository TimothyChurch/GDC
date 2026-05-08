export default createCreateHandler(GDCEvent, {
  schema: eventCreateSchema,
  populate: "contact",
  falsyFields: { contact: "deleteIfFalsy" },
});
