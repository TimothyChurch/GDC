export default createDeleteHandler(Contact, {
  referenceChecks: [
    { model: PurchaseOrder, field: "vendor", label: "purchase order(s)" },
    { model: Event, field: "contact", label: "event(s)" },
  ],
});
