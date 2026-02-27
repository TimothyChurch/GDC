export default createDeleteHandler(Bottle, {
  referenceChecks: [
    { model: Production, field: "bottle", label: "production record(s)" },
  ],
});
