export default createCreateHandler(Bottle, {
  schema: bottleCreateSchema,
  falsyFields: { recipe: "deleteIfFalsy" },
});
