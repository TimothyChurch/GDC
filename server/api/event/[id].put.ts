export default createUpdateHandler(GDCEvent, {
  schema: eventUpdateSchema,
  populate: "contact",
  nullableFields: ["contact"],
});
