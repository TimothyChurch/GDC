export default createCreateHandler(Message, {
  schema: messageCreateSchema,
  falsyFields: { contact: "deleteIfFalsy" },
});
