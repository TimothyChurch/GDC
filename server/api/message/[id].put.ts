export default createUpdateHandler(Message, {
  schema: messageUpdateSchema,
  nullableFields: ["contact"],
});
