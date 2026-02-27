export default createDeleteHandler(Item, {
  referenceChecks: [
    { model: Recipe, field: "items.item", label: "recipe(s)" },
    { model: PurchaseOrder, field: "items.item", label: "purchase order(s)" },
    { model: Cocktail, field: "ingredients.item", label: "cocktail(s)" },
  ],
});
