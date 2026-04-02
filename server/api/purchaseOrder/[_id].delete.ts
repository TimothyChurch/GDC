export default createDeleteHandler(PurchaseOrder, {
  referenceChecks: [
    { model: Item, field: "purchaseHistory", label: "item(s)" },
  ],
});
