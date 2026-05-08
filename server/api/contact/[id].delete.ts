export default createDeleteHandler(GDCContact, {
  referenceChecks: [
    { model: PurchaseOrder, field: "vendor", label: "purchase order(s)" },
    { model: GDCEvent, field: "contact", label: "event(s)" },
  ],
});
