export default createDeleteHandler(Item, {
  referenceChecks: [
    { model: Recipe, field: "items._id", label: "recipe(s)" },
    { model: PurchaseOrder, field: "items.item", label: "purchase order(s)" },
    { model: Cocktail, field: "ingredients.item", label: "cocktail(s)" },
    { model: Production, field: "bottling.glassware", label: "production record(s) (glassware)" },
    { model: Production, field: "bottling.cap", label: "production record(s) (cap)" },
    { model: Production, field: "bottling.label", label: "production record(s) (label)" },
  ],
});
