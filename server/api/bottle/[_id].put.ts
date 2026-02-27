export default createUpdateHandler(Bottle, {
  schema: bottleUpdateSchema,
  nullableFields: ["recipe"],
});
