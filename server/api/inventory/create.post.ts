export default createCreateHandler(Inventory, {
  schema: inventoryCreateSchema,
  falsyFields: { location: "deleteIfFalsy" },
});
