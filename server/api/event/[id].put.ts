export default createUpdateHandler(Event, {
  schema: eventUpdateSchema,
  populate: "contact",
  nullableFields: ["contact"],
});
