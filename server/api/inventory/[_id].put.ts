export default createUpdateHandler(Inventory, {
  schema: inventoryUpdateSchema,
  nullableFields: ["location"],
});
